from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models import User, Household, HouseholdBill, Appliance
from backend.app.schemas import (
    UserResponse,
    HouseholdResponse,
    HouseholdUpdate,
    HouseholdBillCreate,
    HouseholdBillResponse,
    ApplianceCreate,
    ApplianceResponse,
)

router = APIRouter(prefix="/api", tags=["Household & Appliances"])

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user_profile(user_id: int, req: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    body = await req.json()
    if "full_name" in body:
        user.full_name = body["full_name"]
    if "phone" in body:
        user.phone = body["phone"]
    if "address" in body:
        user.address = body["address"]
    db.commit()
    db.refresh(user)
    return user

@router.get("/household/{user_id}", response_model=HouseholdResponse)
def get_household_by_user(user_id: int, db: Session = Depends(get_db)):
    hh = db.query(Household).filter(Household.user_id == user_id).first()
    if not hh:
        # Create a default household if missing
        hh = Household(
            user_id=user_id,
            home_type="Apartment",
            size_sqft=1250,
            occupants=4,
            location="Mumbai",
            monthly_budget=3500.0,
            solar_available=False,
        )
        db.add(hh)
        db.commit()
        db.refresh(hh)
    return hh

@router.put("/household/{household_id}", response_model=HouseholdResponse)
async def update_household(household_id: int, req: Request, db: Session = Depends(get_db)):
    hh = db.query(Household).filter(Household.id == household_id).first()
    if not hh:
        hh = Household(
            id=household_id,
            user_id=1,
            home_type="Apartment",
            size_sqft=1200,
            occupants=4,
            location="Mumbai",
            monthly_budget=3500.0,
            solar_available=False,
        )
        db.add(hh)
    body = await req.json()
    for field in ["home_type", "size_sqft", "occupants", "location", "monthly_budget", "solar_available"]:
        if field in body:
            setattr(hh, field, body[field])
    db.commit()
    db.refresh(hh)
    return hh

@router.get("/household/{household_id}/bill", response_model=HouseholdBillResponse | None)
def get_household_bill(household_id: int, db: Session = Depends(get_db)):
    bill = db.query(HouseholdBill).filter(HouseholdBill.household_id == household_id).first()
    return bill

@router.post("/household/{household_id}/bill", response_model=dict)
async def save_household_bill(household_id: int, req: Request, db: Session = Depends(get_db)):
    body = await req.json()
    bill = db.query(HouseholdBill).filter(HouseholdBill.household_id == household_id).first()
    amount = float(body.get("amount", 0.0))
    units = float(body.get("units", 0.0))
    billing_period = body.get("billingPeriod") or body.get("billing_period") or "Current Utility Bill"
    tariff_rate = float(body.get("tariffRate") or body.get("tariff_rate") or 7.5)
    fixed_charges = float(body.get("fixedCharges") or body.get("fixed_charges") or 250.0)
    taxes = float(body.get("taxes", 0.0))
    other_charges = float(body.get("otherCharges") or body.get("other_charges") or 0.0)
    discom = body.get("discom") or "Utility Provider"
    source = body.get("source") or "bill_analyzer"

    if not bill:
        bill = HouseholdBill(
            household_id=household_id,
            amount=amount,
            units=units,
            billing_period=billing_period,
            tariff_rate=tariff_rate,
            fixed_charges=fixed_charges,
            taxes=taxes,
            other_charges=other_charges,
            discom=discom,
            source=source,
        )
        db.add(bill)
    else:
        bill.amount = amount
        bill.units = units
        bill.billing_period = billing_period
        bill.tariff_rate = tariff_rate
        bill.fixed_charges = fixed_charges
        bill.taxes = taxes
        bill.other_charges = other_charges
        bill.discom = discom
        bill.source = source

    db.commit()
    db.refresh(bill)
    return {
        "success": True,
        "bill": {
            "household_id": bill.household_id,
            "amount": bill.amount,
            "units": bill.units,
            "billing_period": bill.billing_period,
            "tariff_rate": bill.tariff_rate,
            "fixed_charges": bill.fixed_charges,
            "taxes": bill.taxes,
            "other_charges": bill.other_charges,
            "discom": bill.discom,
            "source": bill.source,
            "updated_at": bill.updated_at.isoformat() if bill.updated_at else None,
        }
    }

@router.delete("/household/{household_id}/bill")
def delete_household_bill(household_id: int, db: Session = Depends(get_db)):
    bill = db.query(HouseholdBill).filter(HouseholdBill.household_id == household_id).first()
    if bill:
        db.delete(bill)
        db.commit()
    return {"success": True}

@router.get("/household/{household_id}/appliances", response_model=List[ApplianceResponse])
def get_household_appliances(household_id: int, db: Session = Depends(get_db)):
    apps = db.query(Appliance).filter(Appliance.household_id == household_id).all()
    return apps

@router.post("/household/{household_id}/appliances", response_model=ApplianceResponse)
async def add_household_appliance(household_id: int, req: Request, db: Session = Depends(get_db)):
    body = await req.json()
    name = body.get("name", "Appliance")
    category = body.get("category", "General")
    quantity = int(body.get("quantity", 1))
    power = float(body.get("power_rating_watts") or body.get("power") or 500.0)
    hours = float(body.get("usage_hours_per_day") or body.get("hours") or 4.0)

    app_id = body.get("id")
    if app_id:
        existing = db.query(Appliance).filter(Appliance.id == int(app_id)).first()
        if existing:
            existing.name = name
            existing.category = category
            existing.quantity = quantity
            existing.power_rating_watts = power
            existing.usage_hours_per_day = hours
            db.commit()
            db.refresh(existing)
            return existing

    new_app = Appliance(
        household_id=household_id,
        name=name,
        category=category,
        quantity=quantity,
        power_rating_watts=power,
        usage_hours_per_day=hours,
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@router.put("/household/{household_id}/appliances/{app_id}", response_model=ApplianceResponse)
async def update_household_appliance(household_id: int, app_id: int, req: Request, db: Session = Depends(get_db)):
    app = db.query(Appliance).filter(Appliance.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Appliance not found")
    body = await req.json()
    if "name" in body:
        app.name = body["name"]
    if "category" in body:
        app.category = body["category"]
    if "quantity" in body:
        app.quantity = int(body["quantity"])
    if "power_rating_watts" in body or "power" in body:
        app.power_rating_watts = float(body.get("power_rating_watts") or body.get("power"))
    if "usage_hours_per_day" in body or "hours" in body:
        app.usage_hours_per_day = float(body.get("usage_hours_per_day") or body.get("hours"))
    db.commit()
    db.refresh(app)
    return app

@router.delete("/household/{household_id}/appliances/{app_id}")
def delete_household_appliance(household_id: int, app_id: int, db: Session = Depends(get_db)):
    app = db.query(Appliance).filter(Appliance.id == app_id).first()
    if app:
        db.delete(app)
        db.commit()
    return {"success": True, "id": app_id}

@router.delete("/appliances/{app_id}")
def delete_appliance_direct(app_id: int, db: Session = Depends(get_db)):
    app = db.query(Appliance).filter(Appliance.id == app_id).first()
    if app:
        db.delete(app)
        db.commit()
    return {"success": True, "id": app_id}
