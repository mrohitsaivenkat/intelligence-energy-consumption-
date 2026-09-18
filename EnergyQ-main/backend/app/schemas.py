from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "household"
    phone: Optional[str] = None
    address: Optional[str] = None

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "household"
    phone: Optional[str] = None
    address: Optional[str] = None
    # Provider-specific fields:
    business_name: Optional[str] = None
    categories: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class HouseholdBase(BaseModel):
    home_type: Optional[str] = "Apartment"
    size_sqft: Optional[int] = 1200
    occupants: Optional[int] = 4
    location: Optional[str] = "Mumbai"
    monthly_budget: Optional[float] = 3500.0
    solar_available: Optional[bool] = False

class HouseholdUpdate(HouseholdBase):
    pass

class HouseholdResponse(HouseholdBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class ApplianceCreate(BaseModel):
    name: str
    category: Optional[str] = "General"
    quantity: Optional[int] = 1
    power_rating_watts: Optional[float] = 500.0
    usage_hours_per_day: Optional[float] = 4.0
    power: Optional[float] = None
    hours: Optional[float] = None

class ApplianceResponse(BaseModel):
    id: int
    household_id: int
    name: str
    category: str
    quantity: int
    power_rating_watts: float
    usage_hours_per_day: float

    class Config:
        from_attributes = True

class HouseholdBillCreate(BaseModel):
    amount: float
    units: Optional[float] = 0.0
    billing_period: Optional[str] = None
    billingPeriod: Optional[str] = None
    tariff_rate: Optional[float] = None
    tariffRate: Optional[float] = None
    fixed_charges: Optional[float] = None
    fixedCharges: Optional[float] = None
    taxes: Optional[float] = 0.0
    other_charges: Optional[float] = 0.0
    otherCharges: Optional[float] = 0.0
    discom: Optional[str] = "Utility Provider"
    source: Optional[str] = "bill_analyzer"

class HouseholdBillResponse(BaseModel):
    household_id: int
    amount: float
    units: float
    billing_period: str
    tariff_rate: float
    fixed_charges: float
    taxes: float
    other_charges: float
    discom: str
    source: str
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EnergyReadingCreate(BaseModel):
    household_id: Optional[int] = 1
    date: Optional[str] = None
    kwh: float
    source: Optional[str] = "Grid Meter"
    notes: Optional[str] = ""

class EnergyReadingResponse(BaseModel):
    id: int
    household_id: int
    date: str
    kwh: float
    source: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ServiceRequestCreate(BaseModel):
    user_id: Optional[int] = 1
    provider_id: int = 1
    service_type: Optional[str] = "Maintenance"
    description: Optional[str] = ""
    requested_date: Optional[str] = None
    address: Optional[str] = "Mumbai"

class ServiceRequestStatusUpdate(BaseModel):
    status: str

class ServiceRequestResponse(BaseModel):
    id: int
    user_id: int
    provider_id: int
    service_type: str
    description: Optional[str] = None
    requested_date: str
    address: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProviderResponse(BaseModel):
    id: int
    user_id: int
    business_name: str
    categories: str
    experience_years: int
    location: str
    base_price: str
    description: Optional[str] = None
    availability_status: str
    rating: float
    verified: bool

    class Config:
        from_attributes = True

class ProviderUpdate(BaseModel):
    business_name: Optional[str] = None
    categories: Optional[str] = None
    experience_years: Optional[int] = None
    location: Optional[str] = None
    base_price: Optional[str] = None
    description: Optional[str] = None
    availability_status: Optional[str] = None
    rating: Optional[float] = None
    verified: Optional[bool] = None

class AIChatRequest(BaseModel):
    message: str
    user_id: Optional[int] = 1
    conversation_id: Optional[int] = None

class AIChatResponse(BaseModel):
    response: str
    conversation_id: int
