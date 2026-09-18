import datetime
import math
import io
import csv
import calendar
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, Response, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import EnergyReading, HouseholdBill
from backend.app.schemas import EnergyReadingCreate, EnergyReadingResponse

router = APIRouter(prefix="/api/energy", tags=["Energy & Forecasting"])

def generate_forecast_from_history(data_points: list):
    n = len(data_points)
    sum_kwh = sum(pt["kwh"] for pt in data_points)
    mean_kwh = sum_kwh / n if n > 0 else 12.5

    slope = 0.0
    if n >= 2:
        num = 0.0
        den = 0.0
        mid = (n - 1) / 2.0
        for i, pt in enumerate(data_points):
            num += (i - mid) * (pt["kwh"] - mean_kwh)
            den += (i - mid) * (i - mid)
        slope = num / den if den != 0 else 0.0

    day_totals = [0.0] * 7
    day_counts = [0] * 7
    for pt in data_points:
        try:
            d = datetime.date.fromisoformat(pt["date_str"][:10])
            # Python weekday: Monday is 0 and Sunday is 6
            # In JS: Sunday is 0, Monday is 1 ...
            dow = (d.weekday() + 1) % 7
            day_totals[dow] += pt["kwh"]
            day_counts[dow] += 1
        except Exception:
            pass

    day_factors = [
        (day_totals[i] / day_counts[i] / (mean_kwh or 1.0)) if day_counts[i] > 0 else 1.0
        for i in range(7)
    ]

    last_date = datetime.date.today()
    if data_points:
        try:
            last_date = datetime.date.fromisoformat(data_points[-1]["date_str"][:10])
        except Exception:
            pass

    forecast = []
    total_forecast_kwh = 0.0

    for i in range(1, 31):
        next_date = last_date + datetime.timedelta(days=i)
        dow = (next_date.weekday() + 1) % 7
        is_weekend = dow in (0, 6)
        season_factor = day_factors[dow] if day_counts[dow] > 0 else (1.15 if is_weekend else 0.98)

        mid_val = (n - 1) / 2.0 if n > 0 else 0.0
        trend_component = slope * (n + i - mid_val)
        projected = max(1.5, (mean_kwh + trend_component * 0.35) * season_factor + math.sin(i / 2.5) * 0.4)
        rounded_kwh = round(projected, 3)

        total_forecast_kwh += rounded_kwh
        forecast.append({
            "date": next_date.isoformat(),
            "predicted_kwh": rounded_kwh,
            "kwh": rounded_kwh,
        })

    avg_daily = round(total_forecast_kwh / 30.0, 3)

    return {
        "status": "success",
        "data_source": "household_readings",
        "summary": {
            "forecast_days": 30,
            "total_forecast_kwh": round(total_forecast_kwh, 3),
            "average_daily_forecast_kwh": avg_daily,
            "last_historical_date": last_date.isoformat(),
            "reading_count": n,
        },
        "forecast": forecast,
    }

@router.get("/readings", response_model=List[EnergyReadingResponse])
@router.get("/readings/{household_id}", response_model=List[EnergyReadingResponse])
def get_readings(household_id: int = 1, db: Session = Depends(get_db)):
    readings = (
        db.query(EnergyReading)
        .filter(EnergyReading.household_id == household_id)
        .order_by(EnergyReading.date.asc())
        .all()
    )
    return readings

@router.post("/readings", response_model=EnergyReadingResponse, status_code=201)
@router.post("/readings/{household_id}", response_model=EnergyReadingResponse, status_code=201)
def add_reading(req: EnergyReadingCreate, household_id: int = 1, db: Session = Depends(get_db)):
    hh_id = req.household_id or household_id
    if req.kwh < 0:
        raise HTTPException(status_code=400, detail="Consumption (kWh) must be a non-negative number.")

    date_str = req.date or datetime.date.today().isoformat()
    new_reading = EnergyReading(
        household_id=hh_id,
        date=date_str,
        kwh=round(req.kwh, 3),
        source=req.source or "Grid Meter",
        notes=req.notes or "",
    )
    db.add(new_reading)
    db.commit()
    db.refresh(new_reading)
    return new_reading

@router.delete("/readings/{reading_id}")
def delete_reading(reading_id: int, db: Session = Depends(get_db)):
    reading = db.query(EnergyReading).filter(EnergyReading.id == reading_id).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found")
    db.delete(reading)
    db.commit()
    return {"message": "Reading deleted successfully", "id": reading_id}

@router.post("/consumption/{household_id}")
async def add_consumption(household_id: int, req: Request, db: Session = Depends(get_db)):
    body = await req.json()
    kwh = float(body.get("kwh", 0))
    if kwh < 0:
        raise HTTPException(status_code=400, detail="Consumption cannot be negative.")
    date_str = body.get("date") or datetime.date.today().isoformat()
    source = body.get("source") or "Grid Meter"
    new_reading = EnergyReading(
        household_id=household_id,
        date=date_str,
        kwh=round(kwh, 3),
        source=source,
    )
    db.add(new_reading)
    db.commit()
    db.refresh(new_reading)
    return {
        "message": "Consumption added",
        "id": new_reading.id,
        "reading": {
            "id": new_reading.id,
            "household_id": new_reading.household_id,
            "date": new_reading.date,
            "kwh": new_reading.kwh,
            "source": new_reading.source,
        }
    }

@router.get("/forecast")
@router.get("/forecast/{household_id}")
@router.post("/forecast")
@router.post("/forecast/{household_id}")
def generate_forecast(household_id: int = 1, db: Session = Depends(get_db)):
    readings = (
        db.query(EnergyReading)
        .filter(EnergyReading.household_id == household_id)
        .order_by(EnergyReading.date.asc())
        .all()
    )
    data_points = [{"date_str": r.date, "kwh": r.kwh} for r in readings]
    return generate_forecast_from_history(data_points)

@router.post("/forecast/upload")
async def upload_forecast_csv(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file was selected.")
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    content = (await file.read()).decode("utf-8", errors="ignore")
    raw_lines = [l.strip() for l in content.splitlines() if l.strip()]

    if len(raw_lines) < 2:
        raise HTTPException(status_code=400, detail="Uploaded CSV contains no records.")

    header = [c.strip().lower().replace('"', '').replace("'", "") for c in raw_lines[0].split(",")]
    date_col = 0
    for idx, c in enumerate(header):
        if c in ("timestamp", "date", "datetime", "time"):
            date_col = idx
            break

    kwh_col = len(header) - 1
    for idx, c in enumerate(header):
        if c in ("kwh", "consumption", "units", "energy", "predicted_kwh"):
            kwh_col = idx
            break

    data_points = []
    for line in raw_lines[1:]:
        parts = [p.strip().replace('"', '').replace("'", "") for p in line.split(",")]
        if len(parts) > max(date_col, kwh_col):
            try:
                val = float(parts[kwh_col])
                if val >= 0:
                    data_points.append({"date_str": parts[date_col], "kwh": val})
            except ValueError:
                pass

    if len(data_points) < 15:
        raise HTTPException(
            status_code=400,
            detail="Uploaded CSV must contain at least 15 records of historical energy data."
        )

    result = generate_forecast_from_history(data_points)
    result["data_source"] = "user_dataset"
    result["uploaded_file"] = file.filename
    result["uploaded_records"] = len(data_points)
    return result


def build_monthly_energy_summary(household_id: int, db: Session, tariff_rate: float = 7.5, include_forecast: bool = True):
    """
    Groups historical energy readings by month, computes key aggregates,
    adds bill correlation, and optionally appends next-month ML projections.
    """
    readings = (
        db.query(EnergyReading)
        .filter(EnergyReading.household_id == household_id)
        .order_by(EnergyReading.date.asc())
        .all()
    )

    bill = (
        db.query(HouseholdBill)
        .filter(HouseholdBill.household_id == household_id)
        .first()
    )

    effective_tariff = bill.tariff_rate if bill and bill.tariff_rate else tariff_rate

    # Group historical readings by year-month
    monthly_groups = {}
    for r in readings:
        try:
            parts = r.date.split("-")
            if len(parts) >= 2:
                m_key = f"{parts[0]}-{parts[1]}"
            else:
                continue
        except Exception:
            continue

        if m_key not in monthly_groups:
            monthly_groups[m_key] = []
        monthly_groups[m_key].append(r)

    today = datetime.date.today()
    current_month_key = f"{today.year:04d}-{today.month:02d}"

    summary_rows = []
    total_hist_kwh = 0.0
    total_hist_cost = 0.0

    for m_key in sorted(monthly_groups.keys()):
        group = monthly_groups[m_key]
        year, month_num = [int(p) for p in m_key.split("-")]
        month_name = f"{calendar.month_name[month_num]} {year}"

        total_kwh = sum(r.kwh for r in group)
        count = len(group)
        avg_daily = total_kwh / count if count > 0 else 0.0
        peak_r = max(group, key=lambda x: x.kwh)
        low_r = min(group, key=lambda x: x.kwh)
        est_cost = total_kwh * effective_tariff

        total_hist_kwh += total_kwh
        total_hist_cost += est_cost

        status = "Completed Month"
        note = f"{count} meter readings logged"

        if m_key == current_month_key:
            status = "Current Month (In Progress)"
            note = f"{count} days recorded through today"
        elif bill and bill.billing_period and (m_key in bill.billing_period or calendar.month_name[month_num] in bill.billing_period):
            note = f"Matches uploaded utility bill ({bill.discom})"

        summary_rows.append({
            "month_key": m_key,
            "month_name": month_name,
            "year": year,
            "month_num": month_num,
            "total_kwh": round(total_kwh, 2),
            "avg_daily_kwh": round(avg_daily, 2),
            "peak_date": peak_r.date,
            "peak_kwh": round(peak_r.kwh, 2),
            "lowest_date": low_r.date,
            "lowest_kwh": round(low_r.kwh, 2),
            "days_recorded": count,
            "estimated_cost": round(est_cost, 2),
            "tariff_rate": round(effective_tariff, 2),
            "status": status,
            "notes": note,
        })

    # Optional: append ML forecast for next month
    if include_forecast and len(readings) >= 5:
        data_points = [{"date_str": r.date, "kwh": r.kwh} for r in readings]
        forecast_res = generate_forecast_from_history(data_points)
        forecast_items = forecast_res.get("forecast", [])

        if forecast_items:
            f_groups = {}
            for it in forecast_items:
                f_date = it["date"]
                f_parts = f_date.split("-")
                f_m_key = f"{f_parts[0]}-{f_parts[1]}"
                if f_m_key not in f_groups:
                    f_groups[f_m_key] = []
                f_groups[f_m_key].append(it)

            for f_m_key, f_items in sorted(f_groups.items()):
                # Only include future forecasted months
                if f_m_key > current_month_key:
                    f_year, f_month_num = [int(p) for p in f_m_key.split("-")]
                    f_month_name = f"{calendar.month_name[f_month_num]} {f_year}"
                    f_total_kwh = sum(it["predicted_kwh"] for it in f_items)
                    f_avg_kwh = f_total_kwh / len(f_items) if f_items else 0.0
                    f_peak = max(f_items, key=lambda x: x["predicted_kwh"])
                    f_low = min(f_items, key=lambda x: x["predicted_kwh"])
                    f_cost = f_total_kwh * effective_tariff

                    summary_rows.append({
                        "month_key": f_m_key,
                        "month_name": f"{f_month_name} (Forecast)",
                        "year": f_year,
                        "month_num": f_month_num,
                        "total_kwh": round(f_total_kwh, 2),
                        "avg_daily_kwh": round(f_avg_kwh, 2),
                        "peak_date": f_peak["date"],
                        "peak_kwh": round(f_peak["predicted_kwh"], 2),
                        "lowest_date": f_low["date"],
                        "lowest_kwh": round(f_low["predicted_kwh"], 2),
                        "days_recorded": len(f_items),
                        "estimated_cost": round(f_cost, 2),
                        "tariff_rate": round(effective_tariff, 2),
                        "status": "Projected (ML Forecast)",
                        "notes": "30-day linear regression projection with weekday seasonality",
                    })

    return {
        "household_id": household_id,
        "tariff_rate": round(effective_tariff, 2),
        "total_historical_kwh": round(total_hist_kwh, 2),
        "total_historical_cost": round(total_hist_cost, 2),
        "months_count": len(summary_rows),
        "months": summary_rows,
    }


def generate_formatted_csv_content(summary_data: dict) -> str:
    """
    Formats the monthly energy summary into a professional, human-readable CSV.
    """
    output = io.StringIO()
    writer = csv.writer(output, lineterminator="\n")

    household_id = summary_data.get("household_id", 1)
    tariff_rate = summary_data.get("tariff_rate", 7.50)
    today_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Header comments / Metadata block
    output.write("# " + "=" * 90 + "\n")
    output.write(f"# SMART HOUSEHOLD ENERGY MANAGEMENT SYSTEM - MONTHLY CONSUMPTION SUMMARY REPORT\n")
    output.write(f"# Household ID: {household_id} | Report Generated: {today_str} | Currency: INR (₹)\n")
    output.write(f"# Standard Electricity Tariff Rate: ₹{tariff_rate:.2f} / kWh\n")
    output.write("# " + "=" * 90 + "\n")

    # Column Headers
    headers = [
        "Month",
        "Year",
        "Total Consumption (kWh)",
        "Avg Daily Usage (kWh/day)",
        "Peak Day Date",
        "Peak Day (kWh)",
        "Lowest Day Date",
        "Lowest Day (kWh)",
        "Days Recorded",
        "Estimated Cost (INR)",
        "Tariff Rate (INR/kWh)",
        "Status",
        "Notes"
    ]
    writer.writerow(headers)

    months = summary_data.get("months", [])
    total_kwh_all = 0.0
    total_cost_all = 0.0
    total_days_all = 0

    for m in months:
        total_kwh_all += m["total_kwh"]
        total_cost_all += m["estimated_cost"]
        total_days_all += m["days_recorded"]

        writer.writerow([
            m["month_name"],
            m["year"],
            f"{m['total_kwh']:.2f}",
            f"{m['avg_daily_kwh']:.2f}",
            m["peak_date"],
            f"{m['peak_kwh']:.2f}",
            m["lowest_date"],
            f"{m['lowest_kwh']:.2f}",
            m["days_recorded"],
            f"{m['estimated_cost']:.2f}",
            f"{m['tariff_rate']:.2f}",
            m["status"],
            m["notes"],
        ])

    # Blank separator line
    output.write("\n")

    # Total Summary Row
    avg_daily_all = total_kwh_all / total_days_all if total_days_all > 0 else 0.0
    writer.writerow([
        "TOTAL / CUMULATIVE",
        "—",
        f"{total_kwh_all:.2f}",
        f"{avg_daily_all:.2f}",
        "—",
        "—",
        "—",
        "—",
        total_days_all,
        f"{total_cost_all:.2f}",
        f"{tariff_rate:.2f}",
        "Combined Total",
        f"Cumulative summary across {len(months)} monthly periods"
    ])

    # Footer Metadata summary
    output.write("\n# " + "=" * 90 + "\n")
    output.write(f"# Summary Statistics:\n")
    output.write(f"# Total Recorded Consumption: {total_kwh_all:.2f} kWh\n")
    output.write(f"# Cumulative Estimated Cost: ₹{total_cost_all:,.2f}\n")
    output.write(f"# Total Period Days: {total_days_all} days\n")
    output.write("# " + "=" * 90 + "\n")

    return output.getvalue()


@router.get("/monthly-summary")
@router.get("/monthly-summary/{household_id}")
def get_monthly_summary(
    household_id: int = 1,
    tariff_rate: float = Query(7.5, description="Tariff rate in INR per kWh"),
    include_forecast: bool = Query(True, description="Include next month ML projection"),
    db: Session = Depends(get_db)
):
    return build_monthly_energy_summary(
        household_id=household_id,
        db=db,
        tariff_rate=tariff_rate,
        include_forecast=include_forecast,
    )


@router.get("/monthly-summary/csv")
@router.get("/monthly-summary/csv/{household_id}")
@router.get("/download-csv")
@router.get("/download-csv/{household_id}")
def download_monthly_summary_csv(
    household_id: int = 1,
    tariff_rate: float = Query(7.5, description="Tariff rate in INR per kWh"),
    include_forecast: bool = Query(True, description="Include next month ML projection"),
    db: Session = Depends(get_db)
):
    summary_data = build_monthly_energy_summary(
        household_id=household_id,
        db=db,
        tariff_rate=tariff_rate,
        include_forecast=include_forecast,
    )
    csv_content = generate_formatted_csv_content(summary_data)
    today_str = datetime.date.today().isoformat()
    filename = f"monthly_energy_consumption_summary_household_{household_id}_{today_str}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        }
    )

