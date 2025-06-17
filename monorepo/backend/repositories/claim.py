from typing import List, Optional, Dict, Any, Tuple
from sqlmodel import select, and_, or_, func
from fastapi import Depends
import logging
import uuid
from datetime import date, datetime

from database import get_async_session
from models import Claim, PolicyHolder, EventType, ClaimStatus
from .base import BaseRepository
from sqlmodel.ext.asyncio.session import AsyncSession

logger = logging.getLogger(__name__)

class ClaimRepository(BaseRepository[Claim]):
    """Repository for managing insurance claims"""
    
    def __init__(self, session: AsyncSession = Depends(get_async_session)):
        super().__init__(session, Claim)
    
    async def get_by_claim_id(self, claim_id: str) -> Optional[Claim]:
        """
        Get a claim by its claim_id
        
        Args:
            claim_id: The claim identifier
            
        Returns:
            The claim if found, None otherwise
        """
        statement = select(Claim).where(Claim.claim_id == claim_id)
        result = await self.session.exec(statement)
        return result.first()
    
    async def search_claims(
        self,
        id: Optional[str] = None,
        policy_id: Optional[str] = None,
        status: Optional[str] = None,
        event_type: Optional[str] = None,
        name_search: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Claim], int]:
        """
        Search for claims with various filters
        
        Args:
            id: Filter by policyholder ID
            policy_id: Filter by policy ID
            status: Filter by claim status
            event_type: Filter by event type
            name_search: Search in first or last name
            date_from: Filter events from this date
            date_to: Filter events until this date
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            Tuple of (list of claims, total count)
        """
        filters = []
        
        # Apply filters
        if id:
            filters.append(Claim.id == id)
            
        if policy_id:
            filters.append(Claim.policy_id == policy_id)
            
        if status:
            filters.append(Claim.claim_status == status)
            
        if event_type:
            filters.append(Claim.event_type == event_type)
            
        if name_search:
            filters.append(
                or_(
                    Claim.first_name.ilike(f"%{name_search}%"),
                    Claim.last_name.ilike(f"%{name_search}%")
                )
            )
            
        if date_from:
            filters.append(Claim.event_date >= date_from)
            
        if date_to:
            filters.append(Claim.event_date <= date_to)
        
        # Build query
        statement = select(Claim)
        if filters:
            statement = statement.where(and_(*filters))
            
        # Get total count
        count_statement = select(func.count()).select_from(statement.subquery())
        total = await self.session.exec(count_statement)
        total_count = total.one()
        
        # Apply pagination
        statement = statement.offset(skip).limit(limit)
        
        # Execute query
        result = await self.session.exec(statement)
        claims = result.all()
        
        return claims, total_count
    
    async def create_claim(self, claim_data: Dict[str, Any]) -> Claim:
        """
        Create a new claim
        
        Args:
            claim_data: Data for the new claim
            
        Returns:
            The created claim
        """
        # Generate a unique claim ID if not provided
        if not claim_data.get("claim_id"):
            claim_data["claim_id"] = f"CLM{uuid.uuid4().hex[:6].upper()}"
        
        # Create new claim
        claim = Claim(**claim_data)
        
        # Add to DB and commit
        self.session.add(claim)
        await self.session.commit()
        await self.session.refresh(claim)
        
        return claim
    
    async def update_claim_status(
        self, 
        claim_id: str, 
        status: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Claim]:
        """
        Update a claim's status
        
        Args:
            claim_id: The claim ID
            status: The new status
            metadata: Optional metadata to add
            
        Returns:
            The updated claim or None if not found
        """
        claim = await self.get_by_claim_id(claim_id)
        if not claim:
            return None
        
        # Update status
        claim.claim_status = status
        
        # Update metadata if provided
        if metadata:
            if not claim.claim_metadata:
                claim.claim_metadata = {}
            claim.claim_metadata.update(metadata)
        
        # Save changes
        self.session.add(claim)
        await self.session.commit()
        await self.session.refresh(claim)
        
        return claim
    
    async def associate_with_policyholder(
        self,
        claim_id: str,
        policyholder_id: str,
        policy_id: Optional[str] = None,
        matched_by: Optional[str] = None
    ) -> Optional[Claim]:
        """
        Associate a claim with a policyholder
        
        Args:
            claim_id: The claim ID
            id: The policyholder ID
            policy_id: Optional policy ID
            matched_by: How the match was determined
            
        Returns:
            The updated claim or None if not found
        """
        claim = await self.get_by_claim_id(claim_id)
        if not claim:
            return None
        
        # Update policyholder association
        claim.policyholder_id = policyholder_id
        if policy_id:
            claim.policy_id = policy_id
        if matched_by:
            claim.matched_by = matched_by
        
        # Save changes
        self.session.add(claim)
        await self.session.commit()
        await self.session.refresh(claim)
        
        return claim
    
    async def delete_claim(self, claim_id: str) -> bool:
        """
        Delete a claim
        
        Args:
            claim_id: The claim ID to delete
            
        Returns:
            True if deleted successfully, False if not found
        """
        try:
            claim = await self.get_by_claim_id(claim_id)
            if not claim:
                logger.warning(f"Claim with ID {claim_id} not found for deletion")
                return False
            
            # Delete the claim
            await self.session.delete(claim)
            await self.session.commit()
            
            logger.info(f"Deleted claim {claim_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting claim {claim_id}: {str(e)}")
            await self.session.rollback()
            return False