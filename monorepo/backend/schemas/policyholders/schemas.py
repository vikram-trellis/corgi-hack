from typing import List, Optional
from datetime import date, datetime
from sqlmodel import SQLModel
from pydantic import EmailStr
from models import Address

class PolicyHolderBase(SQLModel):
    """Base schema for PolicyHolder with common fields"""
    first_name: str
    last_name: str
    date_of_birth: date
    email: EmailStr
    phone: str
    address: Address
    status: str = "active"

class PolicyHolderCreate(PolicyHolderBase):
    """Schema for creating a new PolicyHolder"""
    linked_policies: List[str] = []

class PolicyHolderRead(PolicyHolderBase):
    """Schema for reading a PolicyHolder, includes all fields including generated ones"""
    id: int
    policyholder_id: str
    linked_policies: List[str]
    created_at: datetime
    updated_at: Optional[datetime] = None

class PolicyHolderUpdate(SQLModel):
    """Schema for updating a PolicyHolder, all fields are optional"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[Address] = None
    linked_policies: Optional[List[str]] = None
    status: Optional[str] = None