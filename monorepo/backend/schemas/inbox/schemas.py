from typing import List, Optional, Dict, Any
from datetime import date, datetime
from sqlmodel import SQLModel
from pydantic import Field, EmailStr

class InboxBase(SQLModel):
    """Base schema for an inbox item with common fields"""
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
    ingest_method: Optional[str] = "email"

class InboxCreate(InboxBase):
    """Schema for creating a new inbox item"""
    # Optional relationships and identifiers that might be added later
    policyholder_id: Optional[str] = None
    policy_id: Optional[str] = None
    
    # Optional enriched fields
    coverage_type: Optional[str] = None
    policy_effective_date: Optional[date] = None
    policy_expiry_date: Optional[date] = None
    deductible: Optional[float] = None
    coverage_limit: Optional[float] = None
    
    # Inbox-specific fields
    priority: Optional[str] = "normal"
    assigned_to: Optional[str] = None
    
    # Email-specific fields
    raw_email_content: Optional[str] = None
    email_subject: Optional[str] = None
    email_sender: Optional[str] = None
    
    # Metadata
    claim_metadata: Optional[Dict[str, Any]] = None

class InboxRead(InboxBase):
    """Schema for reading an inbox item, includes all fields including generated ones"""
    id: str
    claim_id: Optional[str] = None
    
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
    
    # Inbox-specific fields
    inbox_status: str
    converted_claim_id: Optional[str] = None
    rejection_reason: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: str
    
    # Email-specific fields
    raw_email_content: Optional[str] = None
    email_subject: Optional[str] = None
    email_sender: Optional[str] = None
    
    # Metadata
    claim_metadata: Optional[Dict[str, Any]] = None
    
    # Timestamps
    created_at: datetime
    updated_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None

class InboxUpdate(SQLModel):
    """Schema for updating an inbox item, all fields are optional"""
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
    policyholder_id: Optional[str] = None
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
    
    # Inbox-specific fields
    inbox_status: Optional[str] = None
    converted_claim_id: Optional[str] = None
    rejection_reason: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    
    # Email-specific fields
    raw_email_content: Optional[str] = None
    email_subject: Optional[str] = None
    email_sender: Optional[str] = None
    
    # Metadata
    claim_metadata: Optional[Dict[str, Any]] = None

class InboxResponse(SQLModel):
    """Base response schema for inbox operations"""
    success: bool
    message: str

class InboxListResponse(InboxResponse):
    """Response schema for listing inbox items"""
    data: List[InboxRead]
    count: int
    total: int
    page: int = 1
    pages: int = 1

class InboxDetailResponse(InboxResponse):
    """Response schema for inbox item details"""
    data: InboxRead

class InboxStatsResponse(InboxResponse):
    """Response schema for inbox statistics"""
    data: Dict[str, int]