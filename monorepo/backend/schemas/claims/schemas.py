from typing import List, Optional, Dict, Any
from datetime import date, datetime
from sqlmodel import SQLModel
from pydantic import Field, EmailStr

class ClaimBase(SQLModel):
    """Base schema for a claim with common fields"""
    first_name: str
    last_name: str
    date_of_birth: date
    event_type: str
    event_date: date
    event_location: str
    damage_description: str
    contact_email: EmailStr
    photos: List[str] = []
    
    # Optional fields
    vehicle_vin: Optional[str] = None
    estimated_damage_amount: Optional[float] = None
    ingest_method: Optional[str] = "manual"

class ClaimCreate(ClaimBase):
    """Schema for creating a new claim"""
    # Optional relationships and identifiers that might be added later
    policyholder_id: Optional[str] = None
    policy_id: Optional[str] = None
    
    # Optional enriched fields
    coverage_type: Optional[str] = None
    policy_effective_date: Optional[date] = None
    policy_expiry_date: Optional[date] = None
    deductible: Optional[float] = None
    coverage_limit: Optional[float] = None
    
    # Metadata
    claim_metadata: Optional[Dict[str, Any]] = None

class ClaimRead(ClaimBase):
    """Schema for reading a claim, includes all fields including generated ones"""
    id: str
    claim_id: str
    
    # Relationships
    policyholder_id: Optional[str] = None
    policy_id: Optional[str] = None
    
    # Enriched or derived fields
    coverage_type: Optional[str] = None
    policy_effective_date: Optional[date] = None
    policy_expiry_date: Optional[date] = None
    deductible: Optional[float] = None
    coverage_limit: Optional[float] = None
    claim_status: str
    initial_payout_estimate: Optional[float] = None
    eligibility_validated: Optional[bool] = None
    matched_by: Optional[str] = None
    
    # Metadata
    claim_metadata: Optional[Dict[str, Any]] = None
    
    # Timestamps
    created_at: datetime
    updated_at: Optional[datetime] = None

class ClaimUpdate(SQLModel):
    """Schema for updating a claim, all fields are optional"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    event_type: Optional[str] = None
    event_date: Optional[date] = None
    event_location: Optional[str] = None
    vehicle_vin: Optional[str] = None
    damage_description: Optional[str] = None
    estimated_damage_amount: Optional[float] = None
    photos: Optional[List[str]] = None
    contact_email: Optional[EmailStr] = None
    ingest_method: Optional[str] = None
    
    # Relationships
    id: Optional[str] = None
    policy_id: Optional[str] = None
    
    # Enriched or derived fields
    coverage_type: Optional[str] = None
    policy_effective_date: Optional[date] = None
    policy_expiry_date: Optional[date] = None
    deductible: Optional[float] = None
    coverage_limit: Optional[float] = None
    claim_status: Optional[str] = None
    initial_payout_estimate: Optional[float] = None
    eligibility_validated: Optional[bool] = None
    matched_by: Optional[str] = None
    
    # Metadata
    claim_metadata: Optional[Dict[str, Any]] = None

class ClaimResponse(SQLModel):
    """Base response schema for claim operations"""
    success: bool
    message: str

class ClaimListResponse(ClaimResponse):
    """Response schema for listing claims"""
    data: List[ClaimRead]
    count: int
    total: int
    page: int = 1
    pages: int = 1

class ClaimDetailResponse(ClaimResponse):
    """Response schema for claim details"""
    data: ClaimRead