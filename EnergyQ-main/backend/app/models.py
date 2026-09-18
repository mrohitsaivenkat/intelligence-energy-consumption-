import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="household")  # "household" or "provider"
    phone = Column(String(50), nullable=True)
    address = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    household = relationship("Household", back_populates="user", uselist=False, cascade="all, delete-orphan")
    provider = relationship("Provider", back_populates="user", uselist=False, cascade="all, delete-orphan")
    service_requests = relationship("ServiceRequest", back_populates="user", cascade="all, delete-orphan")


class Household(Base):
    __tablename__ = "households"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    home_type = Column(String(100), default="Apartment")
    size_sqft = Column(Integer, default=1200)
    occupants = Column(Integer, default=4)
    location = Column(String(100), default="Mumbai")
    monthly_budget = Column(Float, default=3500.0)
    solar_available = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="household")
    appliances = relationship("Appliance", back_populates="household", cascade="all, delete-orphan")
    readings = relationship("EnergyReading", back_populates="household", cascade="all, delete-orphan")
    bill = relationship("HouseholdBill", back_populates="household", uselist=False, cascade="all, delete-orphan")


class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    business_name = Column(String(255), nullable=False)
    categories = Column(String(255), default="Electrical Maintenance")
    experience_years = Column(Integer, default=5)
    location = Column(String(100), default="Mumbai")
    base_price = Column(String(100), default="₹500 - ₹2000")
    description = Column(Text, nullable=True)
    availability_status = Column(String(50), default="Available")
    rating = Column(Float, default=5.0)
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="provider")
    service_requests = relationship("ServiceRequest", back_populates="provider", cascade="all, delete-orphan")


class Appliance(Base):
    __tablename__ = "appliances"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    household_id = Column(Integer, ForeignKey("households.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), default="General")
    quantity = Column(Integer, default=1)
    power_rating_watts = Column(Float, default=500.0)
    usage_hours_per_day = Column(Float, default=4.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    household = relationship("Household", back_populates="appliances")


class HouseholdBill(Base):
    __tablename__ = "household_bills"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    household_id = Column(Integer, ForeignKey("households.id", ondelete="CASCADE"), nullable=False, unique=True)
    amount = Column(Float, default=0.0)
    units = Column(Float, default=0.0)
    billing_period = Column(String(100), default="Current Utility Bill")
    tariff_rate = Column(Float, default=7.5)
    fixed_charges = Column(Float, default=250.0)
    taxes = Column(Float, default=0.0)
    other_charges = Column(Float, default=0.0)
    discom = Column(String(100), default="Utility Provider")
    source = Column(String(100), default="bill_analyzer")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    household = relationship("Household", back_populates="bill")


class EnergyReading(Base):
    __tablename__ = "energy_readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    household_id = Column(Integer, ForeignKey("households.id", ondelete="CASCADE"), nullable=False)
    date = Column(String(50), nullable=False)
    kwh = Column(Float, nullable=False)
    source = Column(String(100), default="Grid Meter")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    household = relationship("Household", back_populates="readings")


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id", ondelete="CASCADE"), nullable=False)
    service_type = Column(String(100), default="Maintenance")
    description = Column(Text, nullable=True)
    requested_date = Column(String(50), nullable=False)
    address = Column(String(255), default="Mumbai")
    status = Column(String(50), default="Pending")  # "Pending", "Scheduled", "In Progress", "Completed", "Cancelled"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="service_requests")
    provider = relationship("Provider", back_populates="service_requests")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversation_id = Column(Integer, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    sender = Column(String(50), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
