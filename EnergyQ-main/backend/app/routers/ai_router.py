import os
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, Household, ChatMessage
from backend.app.schemas import AIChatRequest, AIChatResponse

router = APIRouter(prefix="/api/ai", tags=["AI Assistant (Mistral AI)"])

# Mistral AI API Key secured in Python FastAPI backend
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "")

def call_mistral_api(prompt: str, system_prompt: str) -> str:
    if not MISTRAL_API_KEY:
        return ""
    try:
        from mistralai import Mistral
        client = Mistral(api_key=MISTRAL_API_KEY)
        response = client.chat.complete(
            model="mistral-small-latest",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=600,
        )
        if response and response.choices and len(response.choices) > 0:
            return response.choices[0].message.content or ""
    except Exception as e:
        print(f"[Mistral AI Error] {e}")
    return ""

def get_intelligent_fallback(message: str, user_name: str) -> str:
    msg_lower = message.lower()
    if "ac" in msg_lower or "air condition" in msg_lower or "cooling" in msg_lower:
        return (
            f"Setting your Air Conditioner thermostat to **24°C instead of 18°C-20°C** can reduce compressor energy consumption by up to **24%**.\n\n"
            f"Key Recommendations:\n"
            f"1. Keep AC filters clean (clean every 15 days) to improve airflow by 15%.\n"
            f"2. Pair your AC with a BLDC ceiling fan at low speed to circulate cool air efficiently.\n"
            f"3. 5-Star Inverter ACs save up to ₹450-₹700 monthly compared to non-inverter 3-star models."
        )
    elif "solar" in msg_lower or "rooftop" in msg_lower or "sun" in msg_lower:
        return (
            f"Under the PM Surya Ghar Muft Bijli Yojana, residential rooftop solar qualifies for attractive subsidies:\n"
            f"- **1 kW System**: ₹30,000 subsidy\n"
            f"- **2 kW System**: ₹60,000 subsidy\n"
            f"- **3 kW+ System**: ₹78,000 maximum subsidy\n\n"
            f"A standard 3 kW system generates ~360 kWh/month, eliminating almost 90% of your average monthly electricity bill with a typical payback period of **3.5 to 4.2 years**."
        )
    elif "bill" in msg_lower or "cost" in msg_lower or "tariff" in msg_lower or "slab" in msg_lower:
        return (
            f"Electricity DISCOM tariffs in India operate on progressive telescopic slabs:\n"
            f"- **0-100 units**: Subsidized rate (~₹3.50 - ₹4.50/unit)\n"
            f"- **101-300 units**: Standard rate (~₹6.50 - ₹7.50/unit)\n"
            f"- **300+ units**: Peak slab (~₹8.50 - ₹10.50/unit)\n\n"
            f"Reducing total monthly consumption by even 25-30 kWh can drop your entire billing into the lower tariff tier, saving ~₹400-₹700 monthly!"
        )
    elif "appliance" in msg_lower or "geyser" in msg_lower or "fridge" in msg_lower:
        return (
            f"Top appliance consumption breakdown for Indian homes:\n"
            f"1. **Air Conditioner**: 40-50% of total summer bill\n"
            f"2. **Water Geyser**: 15-20% in winter (switch to 15-minute timer before bath)\n"
            f"3. **Refrigerator**: Runs 24/7 (~1.2 - 2.0 kWh/day). Keep 3-inch clearance from the wall.\n"
            f"4. **Standby/Phantom loads**: TV set-top boxes, Wi-Fi routers, chargers draw ~5-8% energy even when idle. Use master switches!"
        )
    else:
        return (
            f"Hello {user_name}! As your Smart Energy Assistant, I can help you with:\n"
            f"- **Bill Reduction Strategies**: Target high-draw appliances and shift usage to off-peak hours.\n"
            f"- **Solar Feasibility**: Calculate capacity, subsidy, and net-metering ROI.\n"
            f"- **Appliance Efficiency**: Wattage ratings and optimal runtime schedules.\n"
            f"- **Consumption Forecasting**: Analyze historical CSV logs for 30-day projections.\n\n"
            f"What would you like to explore first?"
        )

@router.post("/chat", response_model=AIChatResponse)
def ai_chat(req: AIChatRequest, db: Session = Depends(get_db)):
    if not req.message:
        raise HTTPException(status_code=400, detail="Message is required.")

    conv_id = req.conversation_id or int(datetime.datetime.utcnow().timestamp() * 1000) % 1000000
    user_id = req.user_id or 1
    user = db.query(User).filter(User.id == user_id).first()
    hh = db.query(Household).filter(Household.user_id == user_id).first() if user else None

    user_name = user.full_name if user else "Household Resident"
    home_type = hh.home_type if hh else "Apartment"
    budget = hh.monthly_budget if hh else 3500.0

    system_prompt = (
        f"You are a Smart Household Energy Assistant for an Indian residential household.\n"
        f"User Context:\n"
        f"- Name: {user_name}\n"
        f"- Home Type: {home_type}\n"
        f"- Typical Monthly Budget: ₹{budget}\n"
        f"- Target: Help the user understand energy consumption, optimize appliance runtime, explain electricity tariff slabs (DISCOM / TNERC / MSEDCL / BESCOM / UPPCL style), evaluate solar rooftop ROI, and suggest practical energy-saving actions.\n"
        f"Always use ₹ (INR) for currency and kWh for electricity consumption. Keep answers practical, encouraging, and clear."
    )

    ai_reply = call_mistral_api(req.message, system_prompt)
    if not ai_reply:
        ai_reply = get_intelligent_fallback(req.message, user_name)

    # Save to chat history
    try:
        user_msg = ChatMessage(conversation_id=conv_id, user_id=user_id, sender="user", content=req.message)
        bot_msg = ChatMessage(conversation_id=conv_id, user_id=user_id, sender="assistant", content=ai_reply)
        db.add(user_msg)
        db.add(bot_msg)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Chat History Save Warning] {e}")

    return AIChatResponse(
        response=ai_reply,
        conversation_id=conv_id,
    )
