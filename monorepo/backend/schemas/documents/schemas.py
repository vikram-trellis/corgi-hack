from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field

class DocumentBase(BaseModel):
    """Base schema for document operations"""
    file_name: str
    file_url: str

class DocumentCreate(DocumentBase):
    """Schema for creating a new document"""
    claim_id: Optional[str] = None
    inbox_id: Optional[str] = None

class DocumentRead(DocumentBase):
    """Schema for reading a document, includes all fields including generated ones"""
    id: str
    claim_id: Optional[str] = None
    inbox_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class DocumentUpdate(BaseModel):
    """Schema for updating a document"""
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    claim_id: Optional[str] = None
    inbox_id: Optional[str] = None

class DocumentResponse(BaseModel):
    """Base response schema for document operations"""
    success: bool
    message: str
    data: Optional[DocumentRead] = None

class DocumentListResponse(BaseModel):
    """Response schema for listing documents"""
    success: bool
    message: str
    data: List[DocumentRead]
    total: int
    page: int
    page_size: int
