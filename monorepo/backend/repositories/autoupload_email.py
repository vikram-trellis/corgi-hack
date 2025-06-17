from typing import List, Optional, Tuple
import re
from sqlmodel import select, and_
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import Depends

from database import get_async_session
from models import AutouploadEmail, PolicyHolder
from .base import BaseRepository

class AutouploadEmailRepository(BaseRepository[AutouploadEmail]):
    """Repository for managing AutouploadEmail entities"""
    
    def __init__(self, session: AsyncSession = Depends(get_async_session)):
        super().__init__(session, AutouploadEmail)
    
    async def get(
        self, policy_holder_id: str, alias: Optional[str] = None
    ) -> List[AutouploadEmail]:
        """
        Fetch email records by policy holder ID and optionally filter by alias.

        Args:
            policy_holder_id: The ID of the policy holder to filter email records
            alias: Optional alias to further filter email records

        Returns:
            List of matching AutouploadEmail records
        """
        filters = [
            AutouploadEmail.policy_holder_id == policy_holder_id,
        ]

        if alias:
            filters.append(AutouploadEmail.alias == alias)

        statement = select(AutouploadEmail).where(and_(*filters))
        results = await self.session.exec(statement)
        
        return results.all()
    
    async def get_by_email(self, email: str) -> List[AutouploadEmail]:
        """
        Get autoupload email records by matching an email address.
        
        Args:
            email: The email address to match against

        Returns:
            List of matching AutouploadEmail records
        """
        email_records = []

        # Validate email format
        if "@" not in email:
            return email_records
            
        local_part, domain = email.split("@", 1)
        
        # First, get all records matching the domain
        stmt = select(AutouploadEmail).where(AutouploadEmail.domain == domain)
        results = await self.session.exec(stmt)
        domain_matches = results.all()
        
        # Then filter records where the local part starts with the alias
        for email_record in domain_matches:
            if local_part.startswith(email_record.alias):
                # Load the related policy holder
                policy_holder_stmt = select(PolicyHolder).where(
                    PolicyHolder.id == email_record.policy_holder_id
                )
                policy_holder_result = await self.session.exec(policy_holder_stmt)
                policy_holder = policy_holder_result.one_or_none()
                
                if policy_holder:
                    # Check if the format matches alias-policyholderId@domain
                    expected_local_part = f"{email_record.alias}-{policy_holder.id.lower()}"
                    if local_part.lower() == expected_local_part:
                        email_records.append(email_record)
        
        return email_records
    
    async def upsert(self, email_record: AutouploadEmail) -> AutouploadEmail:
        """
        Upsert an AutouploadEmail record:
          - If a record with the same (alias, policy_holder_id) exists, update it.
          - Otherwise, insert a new record.
          
        Args:
            email_record: The AutouploadEmail record to upsert
            
        Returns:
            The upserted AutouploadEmail record
        """
        # Check if a record with the same policy_holder_id and alias already exists
        statement = select(AutouploadEmail).where(
            AutouploadEmail.policy_holder_id == email_record.policy_holder_id,
            AutouploadEmail.alias == email_record.alias,
        )
        result = await self.session.exec(statement)
        existing_record = result.one_or_none()

        # If it exists, update fields
        if existing_record:
            existing_record.domain = email_record.domain
            existing_record.is_user_generated = email_record.is_user_generated

            self.session.add(existing_record)
            await self.session.commit()
            await self.session.refresh(existing_record)
            return existing_record

        # Otherwise, create a new record
        self.session.add(email_record)
        await self.session.commit()
        await self.session.refresh(email_record)
        return email_record
    
    async def delete(
        self, policy_holder_id: str, alias: str
    ) -> Optional[AutouploadEmail]:
        """
        Delete an AutouploadEmail record by policy holder and alias.

        Args:
            policy_holder_id: The policy holder ID
            alias: The alias to identify the record
            
        Returns:
            The deleted AutouploadEmail if found, otherwise None
        """
        statement = select(AutouploadEmail).where(
            and_(
                AutouploadEmail.policy_holder_id == policy_holder_id,
                AutouploadEmail.alias == alias,
            )
        )
        result = await self.session.exec(statement)
        existing_record = result.one_or_none()

        if not existing_record:
            return None

        # Save existing record to return
        existing_record_copy = AutouploadEmail.model_validate(existing_record.model_dump())

        await self.session.delete(existing_record)
        await self.session.commit()

        return existing_record_copy