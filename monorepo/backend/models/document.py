from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Column
from sqlalchemy import VARCHAR, Text, ForeignKey
import uuid
from .base import TimestampModel

def generate_document_id() -> str:
    """Generate a prefixed unique ID for documents"""
    return f"DOC{uuid.uuid4().hex[:8].upper()}"

class Document(SQLModel, table=True):
    """
    Model for document storage
    
    Represents a document that can be associated with a claim or inbox item
    """
    __tablename__ = "documents"
    
    id: str = Field(
        default_factory=generate_document_id,
        sa_column=Column(VARCHAR(length=50), nullable=False, primary_key=True)
    )
    
    # Document information
    file_name: str = Field(sa_column=Column(VARCHAR(length=255)))
    file_url: str = Field(sa_column=Column(VARCHAR(length=500)))
 
    # Foreign keys for relationships
    claim_id: Optional[str] = Field(
        default=None,
        sa_column=Column(
            VARCHAR(length=50),
            ForeignKey("claims.id", ondelete="SET NULL"),
            nullable=True,
            index=True
        )
    )
    
    inbox_id: Optional[str] = Field(
        default=None,
        sa_column=Column(
            VARCHAR(length=50),
            ForeignKey("inbox.id", ondelete="SET NULL"),
            nullable=True,
            index=True
        )
    )
    
    # Timestamps
    created_at: datetime = TimestampModel().set_datetime()
    updated_at: datetime = TimestampModel().set_datetime()
