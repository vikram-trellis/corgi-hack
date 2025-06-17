from typing import List, Optional, TYPE_CHECKING
from datetime import date, datetime
from sqlalchemy.dialects.postgresql import JSONB
from pydantic import EmailStr
from sqlmodel import Field, SQLModel, Column, Relationship
from sqlalchemy import VARCHAR
import uuid

from .base import TimestampModel

if TYPE_CHECKING:
    from .autoupload_email import AutouploadEmail

def generate_id() -> str:
    """Generate a prefixed unique ID for policyholders"""
    return f"ph_{uuid.uuid4().hex[:8]}"

class Address(SQLModel):
    """Embedded model for address information"""
    street: str
    city: str
    state: str
    zip: str

class PolicyHolder(SQLModel, table=True):
    """PolicyHolder model representing insurance policy holders"""
    __tablename__ = "policyholders"
    
    id: str = Field(
        default_factory=generate_id,
        sa_column=Column(VARCHAR(length=50), nullable=False, primary_key=True)
    )
    first_name: str = Field(index=True)
    last_name: str = Field(index=True)
    date_of_birth: date
    email: EmailStr = Field(unique=True, index=True)
    phone: str
    address: Address = Field(sa_column=Column(JSONB))
    linked_policies: List[str] = Field(sa_column=Column(JSONB))
    status: str = Field(default="active")
    
    # Timestamps
    created_at: datetime = TimestampModel().set_datetime()
    updated_at: datetime = TimestampModel().set_datetime()
    
    # Relationships
    autoupload_emails: List["AutouploadEmail"] = Relationship(
        back_populates="policy_holder",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
        },
    )