from typing import List, Optional, Dict, Any
import uuid
from fastapi import Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database import get_async_session
from models import PolicyHolder
from schemas import PolicyHolderCreate, PolicyHolderUpdate
from .base import BaseRepository

class PolicyHolderRepository(BaseRepository[PolicyHolder]):
    def __init__(self, session: AsyncSession = Depends(get_async_session)):
        super().__init__(session, PolicyHolder)
    
    async def get_by_id(self, id: str) -> Optional[PolicyHolder]:
        """Get policyholder by their unique id"""
        return await self.get_by_field("id", id)
    
    async def get_by_email(self, email: str) -> Optional[PolicyHolder]:
        """Get policyholder by email address"""
        return await self.get_by_field("email", email)
    
    async def create_policyholder(self, policyholder: PolicyHolderCreate) -> PolicyHolder:
        """Create a new policyholder with auto-generated id"""
        # Generate a unique policyholder ID with PH prefix
        id = f"PH{uuid.uuid4().hex[:6].upper()}"
        
        # Convert to dict and add id
        policyholder_data = policyholder.model_dump()
        policyholder_data["id"] = id
        
        # Create the policyholder
        return await self.create(policyholder_data)
    
    async def update_policyholder(self, id: str, policyholder: PolicyHolderUpdate) -> Optional[PolicyHolder]:
        """Update a policyholder by id"""
        # First, get the policyholder by id
        db_policyholder = await self.get_by_id(id)
        if db_policyholder is None:
            return None
        
        # Update with the provided data
        update_data = policyholder.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(db_policyholder, key, value)
        
        self.session.add(db_policyholder)
        await self.session.commit()
        await self.session.refresh(db_policyholder)
        return db_policyholder
    
    async def delete_policyholder(self, id: str) -> bool:
        """Delete a policyholder by id"""
        db_policyholder = await self.get_by_id(id)
        if db_policyholder is None:
            return False
        
        await self.session.delete(db_policyholder)
        await self.session.commit()
        return True
    
    async def list_policyholders(self, skip: int = 0, limit: int = 100) -> List[PolicyHolder]:
        """List all policyholders with pagination"""
        return await self.get_all(skip, limit)