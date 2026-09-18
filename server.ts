import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// In-Memory Data Models & Seed Data
// ============================================================

interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: "household" | "provider";
  phone: string;
  address: string;
}

interface Household {
  id: number;
  user_id: number;
  home_type: string;
  size_sqft: number;
  occupants: number;
  location: string;
  monthly_budget: number;
  solar_available: boolean;
}

interface HouseholdBill {
  household_id: number;
  amount: number;
  units: number;
  billing_period: string;
  tariff_rate: number;
  fixed_charges: number;
  taxes: number;
  other_charges: number;
  discom: string;
  source: string;
  updated_at?: string;
}

interface Appliance {
  id: number;
  household_id: number;
  name: string;
  category: string;
  quantity: number;
  power_rating_watts: number;
  usage_hours_per_day: number;
}

interface EnergyReading {
  id: number;
  household_id: number;
  date: string;
  kwh: number;
  source: string;
  notes?: string;
}

interface Provider {
  id: number;
  user_id: number;
  business_name: string;
  categories: string;
  experience_years: number;
  location: string;
  base_price: string;
  description: string;
  availability_status: string;
  rating: number;
  verified: boolean;
}

interface ServiceRequest {
  id: number;
  user_id: number;
  provider_id: number;
  service_type: string;
  description: string;
  requested_date: string;
  address: string;
  status: string;
}

// Initial In-Memory State
const users: User[] = [
  {
    id: 1,
    email: "household@example.com",
    password_hash: "password123",
    full_name: "Alex Sharma",
    role: "household",
    phone: "+91 9876543210",
    address: "Flat 402, Green Meadows, Mumbai",
  },
  {
    id: 2,
    email: "provider@example.com",
    password_hash: "password123",
    full_name: "Rajesh Kumar",
    role: "provider",
    phone: "+91 9811223344",
    address: "Shop 14, High Street, Mumbai",
  },
  {
    id: 3,
    email: "sparky@example.com",
    password_hash: "password123",
    full_name: "Vikram Singh",
    role: "provider",
    phone: "+91 9822334455",
    address: "Sector 18, Connaught Place, Delhi",
  },
  {
    id: 4,
    email: "solar@example.com",
    password_hash: "password123",
    full_name: "Pooja Mehta",
    role: "provider",
    phone: "+91 9833445566",
    address: "FC Road, Shivajinagar, Pune",
  },
];

const households: Household[] = [
  {
    id: 1,
    user_id: 1,
    home_type: "Apartment",
    size_sqft: 1250,
    occupants: 4,
    location: "Mumbai",
    monthly_budget: 3500.0,
    solar_available: false,
  },
];

let householdBills: Record<number, HouseholdBill> = {
  1: {
    household_id: 1,
    amount: 3150.0,
    units: 420.0,
    billing_period: "August 2026",
    tariff_rate: 7.5,
    fixed_charges: 250.0,
    taxes: 120.0,
    other_charges: 0.0,
    discom: "MSEDCL / Adani Electricity Mumbai",
    source: "bill_analyzer",
    updated_at: new Date().toISOString(),
  },
};

let appliances: Appliance[] = [
  {
    id: 1,
    household_id: 1,
    name: "Air Conditioner (1.5 Ton)",
    category: "Cooling",
    quantity: 1,
    power_rating_watts: 1800.0,
    usage_hours_per_day: 8.0,
  },
  {
    id: 2,
    household_id: 1,
    name: "Double Door Refrigerator",
    category: "Kitchen",
    quantity: 1,
    power_rating_watts: 350.0,
    usage_hours_per_day: 24.0,
  },
  {
    id: 3,
    household_id: 1,
    name: "Washing Machine (Front Load)",
    category: "Laundry",
    quantity: 1,
    power_rating_watts: 800.0,
    usage_hours_per_day: 1.0,
  },
];

const initialReadingsData: [string, number, string, string][] = [
  ["2026-08-25", 12.8, "Grid Meter", "Normal workday"],
  ["2026-08-26", 13.2, "Grid Meter", "Normal workday"],
  ["2026-08-27", 12.4, "Grid Meter", "Normal workday"],
  ["2026-08-28", 13.9, "Grid Meter", "Evening guests"],
  ["2026-08-29", 16.5, "Grid Meter", "Weekend laundry and AC"],
  ["2026-08-30", 15.8, "Grid Meter", "Weekend home all day"],
  ["2026-08-31", 11.9, "Grid Meter", "Normal workday"],
  ["2026-09-01", 12.5, "Grid Meter", "Normal workday"],
  ["2026-09-02", 13.1, "Grid Meter", "Normal workday"],
  ["2026-09-03", 12.7, "Grid Meter", "Normal workday"],
  ["2026-09-04", 13.4, "Grid Meter", "Normal workday"],
  ["2026-09-05", 16.1, "Grid Meter", "Weekend baking & washing"],
  ["2026-09-06", 15.4, "Grid Meter", "Weekend family movie day"],
  ["2026-09-07", 12.0, "Grid Meter", "Normal workday"],
  ["2026-09-08", 12.6, "Grid Meter", "Normal workday"],
  ["2026-09-09", 13.0, "Grid Meter", "Normal workday"],
  ["2026-09-10", 12.9, "Grid Meter", "Normal workday"],
  ["2026-09-11", 14.2, "Grid Meter", "Friday evening AC usage"],
  ["2026-09-12", 16.8, "Grid Meter", "Weekend laundry & cooking"],
  ["2026-09-13", 15.7, "Grid Meter", "Sunday family home"],
  ["2026-09-14", 12.2, "Grid Meter", "Monday workday"],
  ["2026-09-15", 12.7, "Grid Meter", "Tuesday workday"],
  ["2026-09-16", 13.5, "Grid Meter", "Wednesday workday"],
];

let energyReadings: EnergyReading[] = initialReadingsData.map(([date, kwh, source, notes], index) => ({
  id: index + 1,
  household_id: 1,
  date,
  kwh,
  source,
  notes,
}));

let providers: Provider[] = [
  {
    id: 1,
    user_id: 2,
    business_name: "CoolAir Solutions",
    categories: "AC Service, Maintenance",
    experience_years: 12,
    location: "Mumbai",
    base_price: "₹500 - ₹2000",
    description: "Certified AC servicing, inverter compressor checks, and duct cleaning.",
    availability_status: "Available",
    rating: 4.8,
    verified: true,
  },
  {
    id: 2,
    user_id: 3,
    business_name: "Sparky Electricals",
    categories: "Electrical Maintenance, Wiring",
    experience_years: 8,
    location: "Delhi",
    base_price: "₹300 - ₹1500",
    description: "Residential rewiring, smart energy meter installation, earthing.",
    availability_status: "Available",
    rating: 4.9,
    verified: true,
  },
  {
    id: 3,
    user_id: 4,
    business_name: "SolarEdge Systems",
    categories: "Solar Installation, Net Metering",
    experience_years: 15,
    location: "Pune",
    base_price: "Contact for Quote",
    description: "MNRE-subsidized rooftop solar PV installations and annual maintenance.",
    availability_status: "Available",
    rating: 4.7,
    verified: true,
  },
];

let serviceRequests: ServiceRequest[] = [];
let nextReadingId = 100;
let nextApplianceId = 100;
let nextUserId = 10;
let nextServiceRequestId = 1;

// Month names helper
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// ============================================================
// Energy Forecasting & Summary Algorithms
// ============================================================

interface DataPoint {
  date_str: string;
  kwh: number;
}

function generateForecastFromHistory(dataPoints: DataPoint[]) {
  const n = dataPoints.length;
  const sumKwh = dataPoints.reduce((acc, pt) => acc + pt.kwh, 0);
  const meanKwh = n > 0 ? sumKwh / n : 12.5;

  let slope = 0.0;
  if (n >= 2) {
    let num = 0.0;
    let den = 0.0;
    const mid = (n - 1) / 2.0;
    dataPoints.forEach((pt, i) => {
      num += (i - mid) * (pt.kwh - meanKwh);
      den += (i - mid) * (i - mid);
    });
    slope = den !== 0 ? num / den : 0.0;
  }

  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  dataPoints.forEach((pt) => {
    try {
      const d = new Date(pt.date_str.slice(0, 10));
      if (!isNaN(d.getTime())) {
        const dow = d.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
        dayTotals[dow] += pt.kwh;
        dayCounts[dow] += 1;
      }
    } catch {}
  });

  const dayFactors = dayTotals.map((total, idx) => {
    return dayCounts[idx] > 0 ? total / dayCounts[idx] / (meanKwh || 1.0) : 1.0;
  });

  let lastDate = new Date();
  if (dataPoints.length > 0) {
    const parsed = new Date(dataPoints[dataPoints.length - 1].date_str.slice(0, 10));
    if (!isNaN(parsed.getTime())) {
      lastDate = parsed;
    }
  }

  const forecast: { date: string; predicted_kwh: number; kwh: number }[] = [];
  let totalForecastKwh = 0.0;

  for (let i = 1; i <= 30; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + i);

    const dow = nextDate.getUTCDay();
    const isWeekend = dow === 0 || dow === 6;
    const seasonFactor = dayCounts[dow] > 0 ? dayFactors[dow] : (isWeekend ? 1.15 : 0.98);

    const midVal = n > 0 ? (n - 1) / 2.0 : 0.0;
    const trendComponent = slope * (n + i - midVal);
    const projected = Math.max(1.5, (meanKwh + trendComponent * 0.35) * seasonFactor + Math.sin(i / 2.5) * 0.4);
    const roundedKwh = Math.round(projected * 1000) / 1000;

    totalForecastKwh += roundedKwh;
    const isoDate = nextDate.toISOString().slice(0, 10);
    forecast.push({
      date: isoDate,
      predicted_kwh: roundedKwh,
      kwh: roundedKwh,
    });
  }

  const avgDaily = Math.round((totalForecastKwh / 30.0) * 1000) / 1000;

  return {
    status: "success",
    data_source: "household_readings",
    summary: {
      forecast_days: 30,
      total_forecast_kwh: Math.round(totalForecastKwh * 1000) / 1000,
      average_daily_forecast_kwh: avgDaily,
      last_historical_date: lastDate.toISOString().slice(0, 10),
      reading_count: n,
    },
    forecast,
  };
}

function buildMonthlyEnergySummary(householdId: number, tariffRate = 7.5, includeForecast = true) {
  const readings = energyReadings
    .filter((r) => r.household_id === householdId)
    .sort((a, b) => a.date.localeCompare(b.date));

  const bill = householdBills[householdId];
  const effectiveTariff = bill && bill.tariff_rate ? bill.tariff_rate : tariffRate;

  // Group readings by year-month
  const monthlyGroups: Record<string, EnergyReading[]> = {};
  for (const r of readings) {
    const parts = r.date.split("-");
    if (parts.length >= 2) {
      const mKey = `${parts[0]}-${parts[1]}`;
      if (!monthlyGroups[mKey]) monthlyGroups[mKey] = [];
      monthlyGroups[mKey].push(r);
    }
  }

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const summaryRows: any[] = [];
  let totalHistKwh = 0.0;
  let totalHistCost = 0.0;

  for (const mKey of Object.keys(monthlyGroups).sort()) {
    const group = monthlyGroups[mKey];
    const [yearStr, monthNumStr] = mKey.split("-");
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthNumStr, 10);
    const monthName = `${MONTH_NAMES[monthNum - 1]} ${year}`;

    const totalKwh = group.reduce((sum, r) => sum + r.kwh, 0);
    const count = group.length;
    const avgDaily = count > 0 ? totalKwh / count : 0.0;

    let peakR = group[0];
    let lowR = group[0];
    for (const r of group) {
      if (r.kwh > peakR.kwh) peakR = r;
      if (r.kwh < lowR.kwh) lowR = r;
    }

    const estCost = totalKwh * effectiveTariff;
    totalHistKwh += totalKwh;
    totalHistCost += estCost;

    let status = "Completed Month";
    let note = `${count} meter readings logged`;

    if (mKey === currentMonthKey) {
      status = "Current Month (In Progress)";
      note = `${count} days recorded through today`;
    } else if (bill && bill.billing_period && (bill.billing_period.includes(mKey) || bill.billing_period.includes(MONTH_NAMES[monthNum - 1]))) {
      note = `Matches uploaded utility bill (${bill.discom})`;
    }

    summaryRows.push({
      month_key: mKey,
      month_name: monthName,
      year,
      month_num: monthNum,
      total_kwh: Math.round(totalKwh * 100) / 100,
      avg_daily_kwh: Math.round(avgDaily * 100) / 100,
      peak_date: peakR.date,
      peak_kwh: Math.round(peakR.kwh * 100) / 100,
      lowest_date: lowR.date,
      lowest_kwh: Math.round(lowR.kwh * 100) / 100,
      days_recorded: count,
      estimated_cost: Math.round(estCost * 100) / 100,
      tariff_rate: Math.round(effectiveTariff * 100) / 100,
      status,
      notes: note,
    });
  }

  // Include forecast for future months if applicable
  if (includeForecast && readings.length >= 5) {
    const dataPoints = readings.map((r) => ({ date_str: r.date, kwh: r.kwh }));
    const forecastRes = generateForecastFromHistory(dataPoints);
    const forecastItems = forecastRes.forecast || [];

    if (forecastItems.length > 0) {
      const fGroups: Record<string, typeof forecastItems> = {};
      for (const item of forecastItems) {
        const parts = item.date.split("-");
        const fMKey = `${parts[0]}-${parts[1]}`;
        if (!fGroups[fMKey]) fGroups[fMKey] = [];
        fGroups[fMKey].push(item);
      }

      for (const fMKey of Object.keys(fGroups).sort()) {
        if (fMKey > currentMonthKey) {
          const [fYearStr, fMonthNumStr] = fMKey.split("-");
          const fYear = parseInt(fYearStr, 10);
          const fMonthNum = parseInt(fMonthNumStr, 10);
          const fMonthName = `${MONTH_NAMES[fMonthNum - 1]} ${fYear}`;
          const items = fGroups[fMKey];
          const fTotalKwh = items.reduce((sum, it) => sum + it.predicted_kwh, 0);
          const fAvgKwh = items.length > 0 ? fTotalKwh / items.length : 0.0;

          let fPeak = items[0];
          let fLow = items[0];
          for (const it of items) {
            if (it.predicted_kwh > fPeak.predicted_kwh) fPeak = it;
            if (it.predicted_kwh < fLow.predicted_kwh) fLow = it;
          }

          const fCost = fTotalKwh * effectiveTariff;

          summaryRows.push({
            month_key: fMKey,
            month_name: `${fMonthName} (Forecast)`,
            year: fYear,
            month_num: fMonthNum,
            total_kwh: Math.round(fTotalKwh * 100) / 100,
            avg_daily_kwh: Math.round(fAvgKwh * 100) / 100,
            peak_date: fPeak.date,
            peak_kwh: Math.round(fPeak.predicted_kwh * 100) / 100,
            lowest_date: fLow.date,
            lowest_kwh: Math.round(fLow.predicted_kwh * 100) / 100,
            days_recorded: items.length,
            estimated_cost: Math.round(fCost * 100) / 100,
            tariff_rate: Math.round(effectiveTariff * 100) / 100,
            status: "Projected (ML Forecast)",
            notes: "30-day linear regression projection with weekday seasonality",
          });
        }
      }
    }
  }

  return {
    household_id: householdId,
    tariff_rate: Math.round(effectiveTariff * 100) / 100,
    total_historical_kwh: Math.round(totalHistKwh * 100) / 100,
    total_historical_cost: Math.round(totalHistCost * 100) / 100,
    months_count: summaryRows.length,
    months: summaryRows,
  };
}

function generateFormattedCSV(summaryData: any): string {
  const householdId = summaryData.household_id || 1;
  const tariffRate = (summaryData.tariff_rate || 7.5).toFixed(2);
  const todayStr = new Date().toISOString().replace("T", " ").slice(0, 19);

  const lines: string[] = [
    `# ${"=".repeat(90)}`,
    `# SMART HOUSEHOLD ENERGY MANAGEMENT SYSTEM - MONTHLY CONSUMPTION SUMMARY REPORT`,
    `# Household ID: ${householdId} | Report Generated: ${todayStr} | Currency: INR (₹)`,
    `# Standard Electricity Tariff Rate: ₹${tariffRate} / kWh`,
    `# ${"=".repeat(90)}`,
    `Month,Year,Total Consumption (kWh),Avg Daily Usage (kWh/day),Peak Day Date,Peak Day (kWh),Lowest Day Date,Lowest Day (kWh),Days Recorded,Estimated Cost (INR),Tariff Rate (INR/kWh),Status,Notes`,
  ];

  const months = summaryData.months || [];
  let totalKwhAll = 0.0;
  let totalCostAll = 0.0;
  let totalDaysAll = 0;

  for (const m of months) {
    totalKwhAll += m.total_kwh;
    totalCostAll += m.estimated_cost;
    totalDaysAll += m.days_recorded;

    const row = [
      `"${m.month_name}"`,
      m.year,
      m.total_kwh.toFixed(2),
      m.avg_daily_kwh.toFixed(2),
      `"${m.peak_date}"`,
      m.peak_kwh.toFixed(2),
      `"${m.lowest_date}"`,
      m.lowest_kwh.toFixed(2),
      m.days_recorded,
      m.estimated_cost.toFixed(2),
      m.tariff_rate.toFixed(2),
      `"${m.status}"`,
      `"${m.notes.replace(/"/g, '""')}"`,
    ].join(",");
    lines.push(row);
  }

  lines.push("");
  const avgDailyAll = totalDaysAll > 0 ? (totalKwhAll / totalDaysAll).toFixed(2) : "0.00";
  lines.push(
    `"TOTAL / CUMULATIVE",—,${totalKwhAll.toFixed(2)},${avgDailyAll},—,—,—,—,${totalDaysAll},${totalCostAll.toFixed(2)},${tariffRate},"Combined Total","Cumulative summary across ${months.length} monthly periods"`
  );

  lines.push(`\n# ${"=".repeat(90)}`);
  lines.push(`# Summary Statistics:`);
  lines.push(`# Total Recorded Consumption: ${totalKwhAll.toFixed(2)} kWh`);
  lines.push(`# Cumulative Estimated Cost: ₹${totalCostAll.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  lines.push(`# Total Period Days: ${totalDaysAll} days`);
  lines.push(`# ${"=".repeat(90)}\n`);

  return lines.join("\n");
}

// ============================================================
// Intelligent AI Energy Advisor
// ============================================================

function getIntelligentFallback(message: string, userName: string): string {
  const msgLower = message.toLowerCase();
  if (msgLower.includes("ac") || msgLower.includes("air condition") || msgLower.includes("cooling")) {
    return (
      `Setting your Air Conditioner thermostat to **24°C instead of 18°C-20°C** can reduce compressor energy consumption by up to **24%**.\n\n` +
      `Key Recommendations:\n` +
      `1. Keep AC filters clean (clean every 15 days) to improve airflow by 15%.\n` +
      `2. Pair your AC with a BLDC ceiling fan at low speed to circulate cool air efficiently.\n` +
      `3. 5-Star Inverter ACs save up to ₹450-₹700 monthly compared to non-inverter 3-star models.`
    );
  } else if (msgLower.includes("solar") || msgLower.includes("rooftop") || msgLower.includes("sun")) {
    return (
      `Under the PM Surya Ghar Muft Bijli Yojana, residential rooftop solar qualifies for attractive subsidies:\n` +
      `- **1 kW System**: ₹30,000 subsidy\n` +
      `- **2 kW System**: ₹60,000 subsidy\n` +
      `- **3 kW+ System**: ₹78,000 maximum subsidy\n\n` +
      `A standard 3 kW system generates ~360 kWh/month, eliminating almost 90% of your average monthly electricity bill with a typical payback period of **3.5 to 4.2 years**.`
    );
  } else if (msgLower.includes("bill") || msgLower.includes("cost") || msgLower.includes("tariff") || msgLower.includes("slab")) {
    return (
      `Electricity DISCOM tariffs in India operate on progressive telescopic slabs:\n` +
      `- **0-100 units**: Subsidized rate (~₹3.50 - ₹4.50/unit)\n` +
      `- **101-300 units**: Standard rate (~₹6.50 - ₹7.50/unit)\n` +
      `- **300+ units**: Peak slab (~₹8.50 - ₹10.50/unit)\n\n` +
      `Reducing total monthly consumption by even 25-30 kWh can drop your entire billing into the lower tariff tier, saving ~₹400-₹700 monthly!`
    );
  } else if (msgLower.includes("appliance") || msgLower.includes("geyser") || msgLower.includes("fridge")) {
    return (
      `Top appliance consumption breakdown for Indian homes:\n` +
      `1. **Air Conditioner**: 40-50% of total summer bill\n` +
      `2. **Water Geyser**: 15-20% in winter (switch to 15-minute timer before bath)\n` +
      `3. **Refrigerator**: Runs 24/7 (~1.2 - 2.0 kWh/day). Keep 3-inch clearance from the wall.\n` +
      `4. **Standby/Phantom loads**: TV set-top boxes, Wi-Fi routers, chargers draw ~5-8% energy even when idle. Use master switches!`
    );
  } else {
    return (
      `Hello ${userName}! As your Smart Energy Assistant, I can help you with:\n` +
      `- **Bill Reduction Strategies**: Target high-draw appliances and shift usage to off-peak hours.\n` +
      `- **Solar Feasibility**: Calculate capacity, subsidy, and net-metering ROI.\n` +
      `- **Appliance Efficiency**: Wattage ratings and optimal runtime schedules.\n` +
      `- **Consumption Forecasting**: Analyze historical CSV logs for 30-day projections.\n\n` +
      `What would you like to explore first?`
    );
  }
}

async function getAIReply(prompt: string, userName: string, homeType: string, budget: number): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are a Smart Household Energy Assistant for an Indian residential household.
User Context:
- Name: ${userName}
- Home Type: ${homeType}
- Typical Monthly Budget: ₹${budget}
- Target: Help the user understand energy consumption, optimize appliance runtime, explain electricity tariff slabs (DISCOM / TNERC / MSEDCL / BESCOM / UPPCL style), evaluate solar rooftop ROI, and suggest practical energy-saving actions.
Always use ₹ (INR) for currency and kWh for electricity consumption. Keep answers practical, encouraging, and clear.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 600,
        },
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn("[Gemini API Error] Falling back to intelligent assistant rules:", err);
    }
  }

  return getIntelligentFallback(prompt, userName);
}

// ============================================================
// API Routes
// ============================================================

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Smart Household Energy API",
    backend: "Node.js + Express",
    database: "In-Memory Store",
    ai: process.env.GEMINI_API_KEY ? "Gemini 2.5 Flash" : "Intelligent Energy Assistant Engine",
  });
});

// Authentication
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { email, full_name, password, role, phone, address, business_name, categories } = req.body;
  if (!email || !full_name) {
    return res.status(400).json({ detail: "Email and full name are required." });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ detail: "Email already registered." });
  }

  const roleVal = role === "provider" ? "provider" : "household";
  const newUser: User = {
    id: nextUserId++,
    email: email.toLowerCase().trim(),
    password_hash: password || "password123",
    full_name: full_name.trim(),
    role: roleVal,
    phone: phone || "+91 9876543210",
    address: address || "Mumbai, India",
  };
  users.push(newUser);

  if (roleVal === "household") {
    households.push({
      id: households.length + 1,
      user_id: newUser.id,
      home_type: "Apartment",
      size_sqft: 1100,
      occupants: 3,
      location: "Mumbai",
      monthly_budget: 3200.0,
      solar_available: false,
    });
  } else {
    providers.push({
      id: providers.length + 1,
      user_id: newUser.id,
      business_name: business_name || `${newUser.full_name} Services`,
      categories: categories || "Electrical Maintenance, AC Service",
      experience_years: 5,
      location: "Mumbai",
      base_price: "₹500 - ₹1500",
      description: "Certified residential electrical and energy efficiency technician.",
      availability_status: "Available",
      rating: 5.0,
      verified: true,
    });
  }

  res.json({ message: "User registered successfully", id: newUser.id });
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!email) {
    return res.status(400).json({ detail: "Email address is required." });
  }

  const cleanEmail = email.toLowerCase().trim();
  let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    // Seamless account creation for frictionless testing
    const roleVal = role === "provider" || cleanEmail.includes("provider") ? "provider" : "household";
    const namePart = cleanEmail.split("@")[0].replace(/[._]/g, " ");
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    user = {
      id: nextUserId++,
      email: cleanEmail,
      password_hash: password || "password123",
      full_name: formattedName || "Energy User",
      role: roleVal,
      phone: "+91 9876543210",
      address: "Mumbai, India",
    };
    users.push(user);

    if (roleVal === "household") {
      households.push({
        id: households.length + 1,
        user_id: user.id,
        home_type: "Apartment",
        size_sqft: 1100,
        occupants: 3,
        location: "Mumbai",
        monthly_budget: 3200.0,
        solar_available: false,
      });
    } else {
      providers.push({
        id: providers.length + 1,
        user_id: user.id,
        business_name: `${user.full_name} Services`,
        categories: "Electrical, AC Services",
        experience_years: 4,
        location: "Mumbai",
        base_price: "₹500",
        description: "Professional home energy technician.",
        availability_status: "Available",
        rating: 4.9,
        verified: true,
      });
    }
  } else if (role && (role === "household" || role === "provider")) {
    // Update role if explicitly requested during login
    user.role = role;
  }

  res.json({
    access_token: `token-${user.id}-${Date.now()}`,
    token_type: "bearer",
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone,
      address: user.address,
    },
  });
});

app.get("/api/auth/me", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ detail: "Authorization token required" });
  }
  const token = authHeader.replace("Bearer ", "").trim();
  const match = token.match(/^token-(\d+)-/);
  const userId = match ? parseInt(match[1], 10) : 1;
  const user = users.find((u) => u.id === userId) || users[0];

  if (!user) {
    return res.status(404).json({ detail: "User not found" });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone,
      address: user.address,
    },
  });
});

// Users
app.get("/api/users/:user_id", (req: Request, res: Response) => {
  const userId = parseInt(req.params.user_id, 10);
  const user = users.find((u) => u.id === userId) || users[0];
  if (!user) return res.status(404).json({ detail: "User not found" });
  res.json(user);
});

app.put("/api/users/:user_id", (req: Request, res: Response) => {
  const userId = parseInt(req.params.user_id, 10);
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ detail: "User not found" });

  const { full_name, phone, address } = req.body;
  if (full_name !== undefined) user.full_name = full_name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;

  res.json(user);
});

// Household Profile
app.get("/api/household/:user_id", (req: Request, res: Response) => {
  const userId = parseInt(req.params.user_id, 10);
  let hh = households.find((h) => h.user_id === userId || h.id === userId);
  if (!hh) {
    hh = {
      id: households.length + 1,
      user_id: userId,
      home_type: "Apartment",
      size_sqft: 1250,
      occupants: 4,
      location: "Mumbai",
      monthly_budget: 3500.0,
      solar_available: false,
    };
    households.push(hh);
  }
  res.json(hh);
});

app.put("/api/household/:household_id", (req: Request, res: Response) => {
  const householdId = parseInt(req.params.household_id, 10);
  let hh = households.find((h) => h.id === householdId);
  if (!hh) {
    hh = {
      id: householdId,
      user_id: 1,
      home_type: "Apartment",
      size_sqft: 1200,
      occupants: 4,
      location: "Mumbai",
      monthly_budget: 3500.0,
      solar_available: false,
    };
    households.push(hh);
  }

  const fields = ["home_type", "size_sqft", "occupants", "location", "monthly_budget", "solar_available"] as const;
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      (hh as any)[f] = req.body[f];
    }
  }

  res.json(hh);
});

// Household Bill
app.get("/api/household/:household_id/bill", (req: Request, res: Response) => {
  const householdId = parseInt(req.params.household_id, 10);
  const bill = householdBills[householdId] || null;
  res.json(bill);
});

app.post("/api/household/:household_id/bill", (req: Request, res: Response) => {
  const householdId = parseInt(req.params.household_id, 10);
  const body = req.body;

  const bill: HouseholdBill = {
    household_id: householdId,
    amount: Number(body.amount) || 0.0,
    units: Number(body.units) || 0.0,
    billing_period: body.billingPeriod || body.billing_period || "Current Utility Bill",
    tariff_rate: Number(body.tariffRate || body.tariff_rate) || 7.5,
    fixed_charges: Number(body.fixedCharges || body.fixed_charges) || 250.0,
    taxes: Number(body.taxes) || 0.0,
    other_charges: Number(body.otherCharges || body.other_charges) || 0.0,
    discom: body.discom || "Utility Provider",
    source: body.source || "bill_analyzer",
    updated_at: new Date().toISOString(),
  };

  householdBills[householdId] = bill;
  res.json({ success: true, bill });
});

app.delete("/api/household/:household_id/bill", (req: Request, res: Response) => {
  const householdId = parseInt(req.params.household_id, 10);
  delete householdBills[householdId];
  res.json({ success: true });
});

// Appliances
app.get("/api/household/:household_id/appliances", (req: Request, res: Response) => {
  const householdId = parseInt(req.params.household_id, 10);
  const userApps = appliances.filter((a) => a.household_id === householdId);
  res.json(userApps);
});

app.post("/api/household/:household_id/appliances", (req: Request, res: Response) => {
  const householdId = parseInt(req.params.household_id, 10);
  const body = req.body;

  const appId = body.id ? parseInt(body.id, 10) : nextApplianceId++;
  const existingIndex = appliances.findIndex((a) => a.id === appId);

  const appData: Appliance = {
    id: appId,
    household_id: householdId,
    name: body.name || "Appliance",
    category: body.category || "General",
    quantity: Number(body.quantity) || 1,
    power_rating_watts: Number(body.power_rating_watts || body.power) || 500.0,
    usage_hours_per_day: Number(body.usage_hours_per_day || body.hours) || 4.0,
  };

  if (existingIndex >= 0) {
    appliances[existingIndex] = appData;
  } else {
    appliances.push(appData);
  }

  res.json(appData);
});

app.put("/api/household/:household_id/appliances/:app_id", (req: Request, res: Response) => {
  const appId = parseInt(req.params.app_id, 10);
  const app = appliances.find((a) => a.id === appId);
  if (!app) return res.status(404).json({ detail: "Appliance not found" });

  if (req.body.name !== undefined) app.name = req.body.name;
  if (req.body.category !== undefined) app.category = req.body.category;
  if (req.body.quantity !== undefined) app.quantity = Number(req.body.quantity);
  if (req.body.power_rating_watts !== undefined || req.body.power !== undefined) {
    app.power_rating_watts = Number(req.body.power_rating_watts || req.body.power);
  }
  if (req.body.usage_hours_per_day !== undefined || req.body.hours !== undefined) {
    app.usage_hours_per_day = Number(req.body.usage_hours_per_day || req.body.hours);
  }

  res.json(app);
});

app.delete("/api/household/:household_id/appliances/:app_id", (req: Request, res: Response) => {
  const appId = parseInt(req.params.app_id, 10);
  appliances = appliances.filter((a) => a.id !== appId);
  res.json({ success: true, id: appId });
});

app.delete("/api/appliances/:app_id", (req: Request, res: Response) => {
  const appId = parseInt(req.params.app_id, 10);
  appliances = appliances.filter((a) => a.id !== appId);
  res.json({ success: true, id: appId });
});

// Energy Readings
app.get(["/api/energy/readings", "/api/energy/readings/:household_id"], (req: Request, res: Response) => {
  const householdId = req.params.household_id ? parseInt(req.params.household_id, 10) : 1;
  const readings = energyReadings
    .filter((r) => r.household_id === householdId)
    .sort((a, b) => a.date.localeCompare(b.date));
  res.json(readings);
});

app.post(["/api/energy/readings", "/api/energy/readings/:household_id"], (req: Request, res: Response) => {
  const householdId = req.params.household_id
    ? parseInt(req.params.household_id, 10)
    : req.body.household_id || 1;

  const kwh = Number(req.body.kwh);
  if (kwh < 0 || isNaN(kwh)) {
    return res.status(400).json({ detail: "Consumption (kWh) must be a non-negative number." });
  }

  const dateStr = req.body.date || new Date().toISOString().slice(0, 10);
  const newReading: EnergyReading = {
    id: nextReadingId++,
    household_id: householdId,
    date: dateStr,
    kwh: Math.round(kwh * 1000) / 1000,
    source: req.body.source || "Grid Meter",
    notes: req.body.notes || "",
  };

  energyReadings.push(newReading);
  res.status(201).json(newReading);
});

app.delete("/api/energy/readings/:reading_id", (req: Request, res: Response) => {
  const readingId = parseInt(req.params.reading_id, 10);
  const index = energyReadings.findIndex((r) => r.id === readingId);
  if (index < 0) {
    return res.status(404).json({ detail: "Reading not found" });
  }
  energyReadings.splice(index, 1);
  res.json({ message: "Reading deleted successfully", id: readingId });
});

app.post("/api/energy/consumption/:household_id", (req: Request, res: Response) => {
  const householdId = parseInt(req.params.household_id, 10);
  const kwh = Number(req.body.kwh);
  if (kwh < 0 || isNaN(kwh)) {
    return res.status(400).json({ detail: "Consumption cannot be negative." });
  }

  const dateStr = req.body.date || new Date().toISOString().slice(0, 10);
  const source = req.body.source || "Grid Meter";

  const newReading: EnergyReading = {
    id: nextReadingId++,
    household_id: householdId,
    date: dateStr,
    kwh: Math.round(kwh * 1000) / 1000,
    source,
  };

  energyReadings.push(newReading);
  res.json({
    message: "Consumption added",
    id: newReading.id,
    reading: newReading,
  });
});

// Forecasting
app.get(["/api/energy/forecast", "/api/energy/forecast/:household_id"], (req: Request, res: Response) => {
  const householdId = req.params.household_id ? parseInt(req.params.household_id, 10) : 1;
  const readings = energyReadings
    .filter((r) => r.household_id === householdId)
    .sort((a, b) => a.date.localeCompare(b.date));

  const dataPoints: DataPoint[] = readings.map((r) => ({ date_str: r.date, kwh: r.kwh }));
  const result = generateForecastFromHistory(dataPoints);
  res.json(result);
});

app.post(["/api/energy/forecast", "/api/energy/forecast/:household_id"], (req: Request, res: Response) => {
  const householdId = req.params.household_id ? parseInt(req.params.household_id, 10) : 1;
  const readings = energyReadings
    .filter((r) => r.household_id === householdId)
    .sort((a, b) => a.date.localeCompare(b.date));

  const dataPoints: DataPoint[] = readings.map((r) => ({ date_str: r.date, kwh: r.kwh }));
  const result = generateForecastFromHistory(dataPoints);
  res.json(result);
});

app.post("/api/energy/forecast/upload", upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ detail: "No file was selected." });
  }

  if (!req.file.originalname.toLowerCase().endsWith(".csv")) {
    return res.status(400).json({ detail: "Please upload a CSV file." });
  }

  const content = req.file.buffer.toString("utf-8");
  const rawLines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  if (rawLines.length < 2) {
    return res.status(400).json({ detail: "Uploaded CSV contains no records." });
  }

  const header = rawLines[0].split(",").map((c) => c.trim().toLowerCase().replace(/['"]/g, ""));
  let dateCol = 0;
  for (let idx = 0; idx < header.length; idx++) {
    if (["timestamp", "date", "datetime", "time"].includes(header[idx])) {
      dateCol = idx;
      break;
    }
  }

  let kwhCol = header.length - 1;
  for (let idx = 0; idx < header.length; idx++) {
    if (["kwh", "consumption", "units", "energy", "predicted_kwh"].includes(header[idx])) {
      kwhCol = idx;
      break;
    }
  }

  const dataPoints: DataPoint[] = [];
  for (let i = 1; i < rawLines.length; i++) {
    const parts = rawLines[i].split(",").map((p) => p.trim().replace(/['"]/g, ""));
    if (parts.length > Math.max(dateCol, kwhCol)) {
      const val = parseFloat(parts[kwhCol]);
      if (!isNaN(val) && val >= 0) {
        dataPoints.push({ date_str: parts[dateCol], kwh: val });
      }
    }
  }

  if (dataPoints.length < 15) {
    return res.status(400).json({
      detail: "Uploaded CSV must contain at least 15 records of historical energy data.",
    });
  }

  const result: any = generateForecastFromHistory(dataPoints);
  result.data_source = "user_dataset";
  result.uploaded_file = req.file.originalname;
  result.uploaded_records = dataPoints.length;
  res.json(result);
});

// Monthly Summary
app.get(["/api/energy/monthly-summary", "/api/energy/monthly-summary/:household_id"], (req: Request, res: Response) => {
  const householdId = req.params.household_id ? parseInt(req.params.household_id, 10) : 1;
  const tariffRate = req.query.tariff_rate ? parseFloat(req.query.tariff_rate as string) : 7.5;
  const includeForecast = req.query.include_forecast !== "false";

  const summary = buildMonthlyEnergySummary(householdId, tariffRate, includeForecast);
  res.json(summary);
});

// CSV Download
app.get(
  [
    "/api/energy/monthly-summary/csv",
    "/api/energy/monthly-summary/csv/:household_id",
    "/api/energy/download-csv",
    "/api/energy/download-csv/:household_id",
  ],
  (req: Request, res: Response) => {
    const householdId = req.params.household_id ? parseInt(req.params.household_id, 10) : 1;
    const tariffRate = req.query.tariff_rate ? parseFloat(req.query.tariff_rate as string) : 7.5;
    const includeForecast = req.query.include_forecast !== "false";

    const summary = buildMonthlyEnergySummary(householdId, tariffRate, includeForecast);
    const csvContent = generateFormattedCSV(summary);
    const todayStr = new Date().toISOString().slice(0, 10);
    const filename = `monthly_energy_consumption_summary_household_${householdId}_${todayStr}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-cache");
    res.send(csvContent);
  }
);

// Providers
app.get("/api/providers", (req: Request, res: Response) => {
  let list = [...providers];
  const category = req.query.category as string;
  const location = req.query.location as string;

  if (category) {
    list = list.filter((p) => p.categories.toLowerCase().includes(category.toLowerCase()));
  }
  if (location) {
    list = list.filter((p) => p.location.toLowerCase().includes(location.toLowerCase()));
  }

  res.json(list);
});

app.get("/api/providers/:user_id", (req: Request, res: Response) => {
  const userId = parseInt(req.params.user_id, 10);
  const p = providers.find((prov) => prov.user_id === userId || prov.id === userId) || providers[0];
  if (!p) return res.status(404).json({ detail: "Provider not found" });
  res.json(p);
});

app.put("/api/providers/:provider_id", (req: Request, res: Response) => {
  const provId = parseInt(req.params.provider_id, 10);
  const p = providers.find((prov) => prov.id === provId);
  if (!p) return res.status(404).json({ detail: "Provider not found" });

  const fields = [
    "business_name", "categories", "experience_years", "location",
    "base_price", "description", "availability_status", "rating", "verified"
  ] as const;

  for (const f of fields) {
    if (req.body[f] !== undefined) {
      (p as any)[f] = req.body[f];
    }
  }

  res.json(p);
});

// Service Requests
app.post("/api/service-requests", (req: Request, res: Response) => {
  const newReq: ServiceRequest = {
    id: nextServiceRequestId++,
    user_id: req.body.user_id || 1,
    provider_id: req.body.provider_id || 1,
    service_type: req.body.service_type || "Maintenance",
    description: req.body.description || "",
    requested_date: req.body.requested_date || new Date().toISOString().slice(0, 10),
    address: req.body.address || "Mumbai",
    status: "Pending",
  };
  serviceRequests.push(newReq);
  res.json(newReq);
});

app.get("/api/service-requests/user/:user_id", (req: Request, res: Response) => {
  const userId = parseInt(req.params.user_id, 10);
  const list = serviceRequests.filter((r) => r.user_id === userId);
  res.json(list);
});

app.get("/api/service-requests/provider/:provider_id", (req: Request, res: Response) => {
  const providerId = parseInt(req.params.provider_id, 10);
  const list = serviceRequests.filter((r) => r.provider_id === providerId);
  res.json(list);
});

app.put("/api/service-requests/:request_id/status", (req: Request, res: Response) => {
  const requestId = parseInt(req.params.request_id, 10);
  const r = serviceRequests.find((reqItem) => reqItem.id === requestId);
  if (!r) return res.status(404).json({ detail: "Request not found" });
  r.status = req.body.status || r.status;
  res.json(r);
});

// AI Assistant
app.post("/api/ai/chat", async (req: Request, res: Response) => {
  const { message, user_id, conversation_id } = req.body;
  if (!message) {
    return res.status(400).json({ detail: "Message is required." });
  }

  const userId = Number(user_id) || 1;
  const convId = conversation_id || Date.now();
  const user = users.find((u) => u.id === userId);
  const hh = households.find((h) => h.user_id === userId);

  const userName = user ? user.full_name : "Household Resident";
  const homeType = hh ? hh.home_type : "Apartment";
  const budget = hh ? hh.monthly_budget : 3500.0;

  try {
    const aiReply = await getAIReply(message, userName, homeType, budget);
    res.json({
      response: aiReply,
      conversation_id: convId,
    });
  } catch (err) {
    console.error("[AI Chat Error]", err);
    res.json({
      response: getIntelligentFallback(message, userName),
      conversation_id: convId,
    });
  }
});

// ============================================================
// Vite Middleware & Static Frontend Server (Port 3000)
// ============================================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("{*all}", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Household Energy Server listening on port ${PORT}`);
    console.log(`- Mode: ${process.env.NODE_ENV || "development"}`);
    console.log(`- Web URL: http://0.0.0.0:${PORT}`);
  });
}

startServer();
