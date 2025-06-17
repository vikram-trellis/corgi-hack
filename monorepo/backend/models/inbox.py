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

def generate_inbox_id() -> str:
    """Generate a prefixed unique ID for inbox items"""
    return f"INB{uuid.uuid4().hex[:8].upper()}"

# Import enums from claim model to maintain consistency
from .claim import EventType, ClaimStatus, IngestMethod

class InboxStatus(enum.StrEnum):
    """Status types for inbox items"""
    NEW = "new"
    PROCESSING = "processing"
    CONVERTED = "converted"
    REJECTED = "rejected"
    ARCHIVED = "archived"

class Inbox(SQLModel, table=True):
    """
    Model for inbox items - represents claims before they are processed
    
    The inbox serves as a staging area for incoming claims that need review
    before being converted to formal claims
    """
    __tablename__ = "inbox"
    
    id: str = Field(
        default_factory=generate_inbox_id,
        sa_column=Column(VARCHAR(length=50), nullable=False, primary_key=True)
    )
    
    # Basic claim information (same as claims)
    claim_id: Optional[str] = Field(
        default=None,
        sa_column=Column(VARCHAR(length=50), nullable=True, unique=True, index=True)
    )
    first_name: str = Field(index=True)
    last_name: str = Field(index=True)
    date_of_birth: date
    
    # Event details (same as claims)
    event_type: str = Field(sa_column=Column(VARCHAR(length=50)))
    event_date: date
    event_location: str
    vehicle_vin: Optional[str] = Field(default=None, sa_column=Column(VARCHAR(length=50)))
    damage_description: str = Field(sa_column=Column(Text))
    estimated_damage_amount: Optional[float] = Field(default=None)
    
    # Documentation (same as claims)
    photos: List[str] = Field(sa_column=Column(ARRAY(VARCHAR(length=500))))
    contact_email: str = Field(sa_column=Column(VARCHAR(length=255)))
    ingest_method: str = Field(default=IngestMethod.EMAIL)  # Default to email for inbox
    
    # Relationships (same as claims)
    policyholder_id: Optional[str] = Field(
        default=None,
        sa_column=Column(
            VARCHAR(length=50),
            nullable=True,
            index=True
        )
    )
    
    # Policy information (same as claims)
    policy_id: Optional[str] = Field(default=None, sa_column=Column(VARCHAR(length=50)))
    coverage_type: Optional[str] = Field(default=None, sa_column=Column(VARCHAR(length=50)))
    policy_effective_date: Optional[date] = Field(default=None)
    policy_expiry_date: Optional[date] = Field(default=None)
    
    # Financial information (same as claims)
    deductible: Optional[float] = Field(default=None)
    coverage_limit: Optional[float] = Field(default=None)
    initial_payout_estimate: Optional[float] = Field(default=None)
    
    # Status and metadata
    inbox_status: str = Field(default=InboxStatus.NEW)  # Inbox-specific status
    claim_status: str = Field(default=ClaimStatus.DRAFT)  # Potential claim status
    eligibility_validated: Optional[bool] = Field(default=None)
    matched_by: Optional[str] = Field(default=None)
    
    # Inbox-specific fields
    converted_claim_id: Optional[str] = Field(
        default=None, 
        sa_column=Column(VARCHAR(length=50), nullable=True)
    )
    rejection_reason: Optional[str] = Field(default=None, sa_column=Column(Text))
    assigned_to: Optional[str] = Field(default=None, sa_column=Column(VARCHAR(length=100)))
    priority: str = Field(default="normal", sa_column=Column(VARCHAR(length=20)))
    
    # Additional metadata (same as claims)
    claim_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    
    # Raw data for email ingestion
    raw_email_content: Optional[str] = Field(default=None, sa_column=Column(Text))
    email_subject: Optional[str] = Field(default=None, sa_column=Column(VARCHAR(length=255)))
    email_sender: Optional[str] = Field(default=None, sa_column=Column(VARCHAR(length=255)))
    
    # Timestamps
    created_at: datetime = TimestampModel().set_datetime()
    updated_at: datetime = TimestampModel().set_datetime()
    processed_at: Optional[datetime] = Field(default=None)