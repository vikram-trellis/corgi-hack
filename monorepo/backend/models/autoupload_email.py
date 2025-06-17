from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel import Field, SQLModel, Column, Relationship
from sqlalchemy import UniqueConstraint, VARCHAR, ForeignKey
import uuid

from .base import TimestampModel

if TYPE_CHECKING:
    from .policyholder import PolicyHolder

def generate_id() -> str:
    """Generate a prefixed unique ID for autoupload emails"""
    return f"auto_email_{uuid.uuid4().hex[:8]}"

class AutouploadEmail(SQLModel, table=True):
    """
    Model for email addresses used in the autoupload feature.
    Each record represents an email alias that a policyholder can use to upload documents.
    """
    __tablename__ = "autoupload_emails"

    __table_args__ = (
        UniqueConstraint(
            "alias",
            "policy_holder_id",
            name="unique_alias_policyholder_pair",
        ),
    )

    id: str = Field(
        default_factory=generate_id,
        sa_column=Column(VARCHAR(length=50), nullable=False, primary_key=True)
    )

    alias: str = Field(
        sa_column=Column(VARCHAR(length=255), nullable=False, index=True)
    )

    domain: str = Field(
        sa_column=Column(VARCHAR(length=255), nullable=False)
    )

    policy_holder_id: str = Field(
        sa_column=Column(
            VARCHAR(length=50),
            ForeignKey("policyholders.id"),
            nullable=False,
        ),
    )
    
    # Relationship with PolicyHolder
    policy_holder: Optional["PolicyHolder"] = Relationship(
        back_populates="autoupload_emails",
        sa_relationship_kwargs={
            "lazy": "selectin",
        },
    )

    created_at: datetime = TimestampModel().set_datetime()
    updated_at: datetime = TimestampModel().set_datetime()