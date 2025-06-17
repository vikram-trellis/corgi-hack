from typing import List, Optional, TYPE_CHECKING
from datetime import date, datetime
from sqlmodel import Field, SQLModel, Column, Relationship
from sqlalchemy import VARCHAR, ARRAY, Text, Boolean, Float
from sqlalchemy.dialects.postgresql import JSONB
import uuid
import enum
from .base import TimestampModel

if TYPE_CHECKING:
    from .policyholder import PolicyHolder

def generate_claim_id() -> str:
    """Generate a prefixed unique ID for claims"""
    return f"CLM{uuid.uuid4().hex[:8].upper()}"

class EventType(enum.StrEnum):
    """Event types for insurance claims"""
    COLLISION = "collision"
    ANIMAL_COLLISION = "animal_collision"
    THEFT = "theft"
    VANDALISM = "vandalism"
    WEATHER = "weather"
    FIRE = "fire"
    FLOOD = "flood"
    OTHER = "other"

class ClaimStatus(enum.StrEnum):
    """Status types for insurance claims"""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    PENDING_REVIEW = "pending_review"
    UNDER_INVESTIGATION = "under_investigation"
    APPROVED = "approved"
    PARTIALLY_APPROVED = "partially_approved"
    DENIED = "denied"
    CLOSED = "closed"
    REOPENED = "reopened"

class IngestMethod(enum.StrEnum):
    """Methods for claim ingestion"""
    EMAIL = "email"
    MANUAL = "manual"
    API = "api"
    PORTAL = "portal"
    MOBILE = "mobile"

class Claim(SQLModel, table=True):
    """
    Model for insurance claims
    
    Represents a claim filed by a policyholder for an insurance event
    """
    __tablename__ = "claims"
    
    id: str = Field(
        default_factory=generate_claim_id,
        sa_column=Column(VARCHAR(length=50), nullable=False, primary_key=True)
    )
    
    # Basic claim information
    claim_id: str = Field(
        sa_column=Column(VARCHAR(length=50), nullable=False, unique=True, index=True)
    )
    first_name: str = Field(index=True)
    last_name: str = Field(index=True)
    date_of_birth: date
    
    # Event details
    event_type: str = Field(sa_column=Column(VARCHAR(length=50)))
    event_date: date
    event_location: str
    vehicle_vin: Optional[str] = Field(default=None, sa_column=Column(VARCHAR(length=50)))
    damage_description: str = Field(sa_column=Column(Text))
    estimated_damage_amount: Optional[float] = Field(default=None)
    
    # Documentation
    photos: List[str] = Field(sa_column=Column(ARRAY(VARCHAR(length=500))))
    contact_email: str = Field(sa_column=Column(VARCHAR(length=255)))
    ingest_method: str = Field(default=IngestMethod.MANUAL)
    
    # Relationships
    policyholder_id: Optional[str] = Field(
        default=None,
        sa_column=Column(
            VARCHAR(length=50),
            nullable=True,
            index=True
        )
    )
    
    # Policy information
    policy_id: Optional[str] = Field(default=None, sa_column=Column(VARCHAR(length=50)))
    coverage_type: Optional[str] = Field(default=None, sa_column=Column(VARCHAR(length=50)))
    policy_effective_date: Optional[date] = Field(default=None)
    policy_expiry_date: Optional[date] = Field(default=None)
    
    # Financial information
    deductible: Optional[float] = Field(default=None)
    coverage_limit: Optional[float] = Field(default=None)
    initial_payout_estimate: Optional[float] = Field(default=None)
    
    # Status and metadata
    claim_status: str = Field(default=ClaimStatus.DRAFT)
    eligibility_validated: Optional[bool] = Field(default=None)
    matched_by: Optional[str] = Field(default=None)
    
    # Additional metadata
    claim_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    
    # Timestamps
    created_at: datetime = TimestampModel().set_datetime()
    updated_at: datetime = TimestampModel().set_datetime()