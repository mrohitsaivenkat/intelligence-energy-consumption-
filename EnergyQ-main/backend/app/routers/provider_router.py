from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models import Provider, ServiceRequest, User
from backend.app.schemas import (
    ProviderResponse,
    ProviderUpdate,
    ServiceRequestCreate,
    ServiceRequestResponse,
    ServiceRequestStatusUpdate,
)

router = APIRouter(prefix="/api", tags=["Providers & Service Requests"])

@router.get("/providers", response_model=List[ProviderResponse])
def get_providers(
    category: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Provider)
    if category:
        query = query.filter(Provider.categories.ilike(f"%{category}%"))
    if location:
        query = query.filter(Provider.location.ilike(f"%{location}%"))
    return query.all()

@router.get("/providers/{user_id}", response_model=ProviderResponse)
def get_provider_by_user(user_id: int, db: Session = Depends(get_db)):
    p = db.query(Provider).filter(Provider.user_id == user_id).first()
    if not p:
        p = db.query(Provider).first()
        if not p:
            raise HTTPException(status_code=404, detail="Provider not found")
    return p

@router.put("/providers/{provider_id}", response_model=ProviderResponse)
async def update_provider(provider_id: int, req: Request, db: Session = Depends(get_db)):
    p = db.query(Provider).filter(Provider.id == provider_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Provider not found")
    body = await req.json()
    for field in ["business_name", "categories", "experience_years", "location", "base_price", "description", "availability_status", "rating", "verified"]:
        if field in body:
            setattr(p, field, body[field])
    db.commit()
    db.refresh(p)
    return p

@router.post("/service-requests", response_model=ServiceRequestResponse)
async def create_service_request(req: ServiceRequestCreate, db: Session = Depends(get_db)):
    new_req = ServiceRequest(
        user_id=req.user_id or 1,
        provider_id=req.provider_id or 1,
        service_type=req.service_type or "Maintenance",
        description=req.description or "",
        requested_date=req.requested_date or "2026-03-25",
        address=req.address or "Mumbai",
        status="Pending",
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return new_req

@router.get("/service-requests/user/{user_id}", response_model=List[ServiceRequestResponse])
def get_user_requests(user_id: int, db: Session = Depends(get_db)):
    return db.query(ServiceRequest).filter(ServiceRequest.user_id == user_id).all()

@router.get("/service-requests/provider/{provider_id}", response_model=List[ServiceRequestResponse])
def get_provider_requests(provider_id: int, db: Session = Depends(get_db)):
    return db.query(ServiceRequest).filter(ServiceRequest.provider_id == provider_id).all()

@router.put("/service-requests/{request_id}/status", response_model=ServiceRequestResponse)
async def update_request_status(request_id: int, req: ServiceRequestStatusUpdate, db: Session = Depends(get_db)):
    r = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Request not found")
    r.status = req.status
    db.commit()
    db.refresh(r)
    return r
