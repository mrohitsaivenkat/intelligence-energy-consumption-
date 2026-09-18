import datetime
from sqlalchemy.orm import Session
from backend.app.database import engine, Base, SessionLocal
from backend.app.models import User, Household, Provider, Appliance, EnergyReading, HouseholdBill
from backend.app.auth import get_password_hash

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if users already seeded
        if db.query(User).count() == 0:
            print("Seeding initial database data...")
            # 1. Alex Sharma (Household User)
            alex = User(
                id=1,
                email="household@example.com",
                password_hash=get_password_hash("password123"),
                full_name="Alex Sharma",
                role="household",
                phone="+91 9876543210",
                address="Flat 402, Green Meadows, Mumbai",
            )
            # 2. Rajesh Kumar (Service Provider 1)
            rajesh = User(
                id=2,
                email="provider@example.com",
                password_hash=get_password_hash("password123"),
                full_name="Rajesh Kumar",
                role="provider",
                phone="+91 9811223344",
                address="Shop 14, High Street, Mumbai",
            )
            # 3. Sparky Electricals owner
            sparky_user = User(
                id=3,
                email="sparky@example.com",
                password_hash=get_password_hash("password123"),
                full_name="Vikram Singh",
                role="provider",
                phone="+91 9822334455",
                address="Sector 18, Connaught Place, Delhi",
            )
            # 4. SolarEdge owner
            solar_user = User(
                id=4,
                email="solar@example.com",
                password_hash=get_password_hash("password123"),
                full_name="Pooja Mehta",
                role="provider",
                phone="+91 9833445566",
                address="FC Road, Shivajinagar, Pune",
            )
            db.add(alex)
            db.add(rajesh)
            db.add(sparky_user)
            db.add(solar_user)
            db.commit()

            # Household for Alex
            hh = Household(
                id=1,
                user_id=alex.id,
                home_type="Apartment",
                size_sqft=1250,
                occupants=4,
                location="Mumbai",
                monthly_budget=3500.0,
                solar_available=False,
            )
            db.add(hh)

            # Providers
            p1 = Provider(
                id=1,
                user_id=rajesh.id,
                business_name="CoolAir Solutions",
                categories="AC Service, Maintenance",
                experience_years=12,
                location="Mumbai",
                base_price="₹500 - ₹2000",
                description="Certified AC servicing, inverter compressor checks, and duct cleaning.",
                availability_status="Available",
                rating=4.8,
                verified=True,
            )
            p2 = Provider(
                id=2,
                user_id=sparky_user.id,
                business_name="Sparky Electricals",
                categories="Electrical Maintenance, Wiring",
                experience_years=8,
                location="Delhi",
                base_price="₹300 - ₹1500",
                description="Residential rewiring, smart energy meter installation, earthing.",
                availability_status="Available",
                rating=4.9,
                verified=True,
            )
            p3 = Provider(
                id=3,
                user_id=solar_user.id,
                business_name="SolarEdge Systems",
                categories="Solar Installation, Net Metering",
                experience_years=15,
                location="Pune",
                base_price="Contact for Quote",
                description="MNRE-subsidized rooftop solar PV installations and annual maintenance.",
                availability_status="Available",
                rating=4.7,
                verified=True,
            )
            db.add_all([p1, p2, p3])

            # Appliances for Household 1
            a1 = Appliance(
                id=1,
                household_id=1,
                name="Air Conditioner (1.5 Ton)",
                category="Cooling",
                quantity=1,
                power_rating_watts=1800.0,
                usage_hours_per_day=8.0,
            )
            a2 = Appliance(
                id=2,
                household_id=1,
                name="Double Door Refrigerator",
                category="Kitchen",
                quantity=1,
                power_rating_watts=350.0,
                usage_hours_per_day=24.0,
            )
            a3 = Appliance(
                id=3,
                household_id=1,
                name="Washing Machine (Front Load)",
                category="Laundry",
                quantity=1,
                power_rating_watts=800.0,
                usage_hours_per_day=1.0,
            )
            db.add_all([a1, a2, a3])

            # Initial readings
            initial_readings_data = [
                ("2026-08-25", 12.8, "Grid Meter", "Normal workday"),
                ("2026-08-26", 13.2, "Grid Meter", "Normal workday"),
                ("2026-08-27", 12.4, "Grid Meter", "Normal workday"),
                ("2026-08-28", 13.9, "Grid Meter", "Evening guests"),
                ("2026-08-29", 16.5, "Grid Meter", "Weekend laundry and AC"),
                ("2026-08-30", 15.8, "Grid Meter", "Weekend home all day"),
                ("2026-08-31", 11.9, "Grid Meter", "Normal workday"),
                ("2026-09-01", 12.5, "Grid Meter", "Normal workday"),
                ("2026-09-02", 13.1, "Grid Meter", "Normal workday"),
                ("2026-09-03", 12.7, "Grid Meter", "Normal workday"),
                ("2026-09-04", 13.4, "Grid Meter", "Normal workday"),
                ("2026-09-05", 16.1, "Grid Meter", "Weekend baking & washing"),
                ("2026-09-06", 15.4, "Grid Meter", "Weekend family movie day"),
                ("2026-09-07", 12.0, "Grid Meter", "Normal workday"),
                ("2026-09-08", 12.6, "Grid Meter", "Normal workday"),
                ("2026-09-09", 13.0, "Grid Meter", "Normal workday"),
                ("2026-09-10", 12.9, "Grid Meter", "Normal workday"),
                ("2026-09-11", 14.2, "Grid Meter", "Friday evening AC usage"),
                ("2026-09-12", 16.8, "Grid Meter", "Weekend laundry & cooking"),
                ("2026-09-13", 15.7, "Grid Meter", "Sunday family home"),
                ("2026-09-14", 12.2, "Grid Meter", "Monday workday"),
                ("2026-09-15", 12.7, "Grid Meter", "Tuesday workday"),
                ("2026-09-16", 13.5, "Grid Meter", "Wednesday workday"),
            ]
            for idx, (dt, kwh, src, note) in enumerate(initial_readings_data, start=1):
                db.add(EnergyReading(
                    id=idx,
                    household_id=1,
                    date=dt,
                    kwh=kwh,
                    source=src,
                    notes=note,
                ))

            # Initial household bill
            bill = HouseholdBill(
                household_id=1,
                amount=3150.0,
                units=420.0,
                billing_period="August 2026",
                tariff_rate=7.5,
                fixed_charges=250.0,
                taxes=120.0,
                other_charges=0.0,
                discom="MSEDCL / Adani Electricity Mumbai",
                source="bill_analyzer",
            )
            db.add(bill)
            db.commit()
            print("Database initialized and seeded successfully!")
    finally:
        db.close()
