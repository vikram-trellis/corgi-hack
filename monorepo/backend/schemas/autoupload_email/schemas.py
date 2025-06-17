from typing import List, Optional
from datetime import datetime
from sqlmodel import SQLModel

class AutouploadEmailBase(SQLModel):
    """Base schema for autoupload email with common fields"""
    alias: str
    domain: str
    is_user_generated: bool = True

class AutouploadEmailCreate(AutouploadEmailBase):
    """Schema for creating a new autoupload email"""
    pass

class AutouploadEmailRead(AutouploadEmailBase):
    """Schema for reading an autoupload email, includes all fields including generated ones"""
    id: str
    policy_holder_id: str
    created_at: datetime
    updated_at: datetime

class AutouploadEmailRowData(SQLModel):
    """Schema for representing autoupload email data in API responses"""
    alias: str
    domain: str
    is_user_generated: bool = True

# Response schemas
class BaseResponse(SQLModel):
    """Base response schema with message"""
    message: str

class GetAutouploadEmailRowsResponse(BaseResponse):
    """Response schema for getting multiple autoupload email rows"""
    data: List[AutouploadEmailRowData]

class GetAutouploadEmailRowResponse(BaseResponse):
    """Response schema for getting a single autoupload email row"""
    data: Optional[AutouploadEmailRowData]

class UpsertAutouploadEmailResponse(BaseResponse):
    """Response schema for creating/updating an autoupload email"""
    data: AutouploadEmailRowData

class DeleteAutouploadEmailResponse(BaseResponse):
    """Response schema for deleting an autoupload email"""
    data: Optional[AutouploadEmailRowData]