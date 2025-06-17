from typing import List, Optional, Dict, Any, Tuple
from sqlmodel import select, and_, or_, func
from fastapi import Depends
import logging
import uuid
from datetime import date, datetime

from database import get_async_session
from models import Inbox, PolicyHolder, EventType, ClaimStatus, InboxStatus
from .base import BaseRepository
from sqlmodel.ext.asyncio.session import AsyncSession

logger = logging.getLogger(__name__)

class InboxRepository(BaseRepository[Inbox]):
    """Repository for managing inbox items"""
    
    def __init__(self, session: AsyncSession = Depends(get_async_session)):
        super().__init__(session, Inbox)

    async def get_by_inbox_id(self, inbox_id: str) -> Optional[Inbox]:
        """
        Get an inbox item by its inbox_id
        
        Args:
            inbox_id: The inbox identifier
            
        Returns:
            The inbox item if found, None otherwise
        """
        try:
            statement = select(Inbox).where(Inbox.id == inbox_id)
            result = await self.session.exec(statement)
            return result.first()
        except Exception as e:
            logger.error(f"Error getting inbox item by inbox_id {inbox_id}: {str(e)}")
            return None
    
    async def get_by_claim_id(self, claim_id: str) -> Optional[Inbox]:
        """
        Get an inbox item by its claim_id
        
        Args:
            claim_id: The claim identifier
            
        Returns:
            The inbox item if found, None otherwise
        """
        try:
            statement = select(Inbox).where(Inbox.claim_id == claim_id)
            result = await self.session.exec(statement)
            return result.first()
        except Exception as e:
            logger.error(f"Error getting inbox item by claim_id {claim_id}: {str(e)}")
            return None

    async def search_inbox_items(
        self,
        policyholder_id: Optional[str] = None,
        policy_id: Optional[str] = None,
        inbox_status: Optional[str] = None,
        claim_status: Optional[str] = None,
        event_type: Optional[str] = None,
        name_search: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        assigned_to: Optional[str] = None,
        priority: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[Inbox], int]:
        """
        Search inbox items with various filters
        
        Args:
            policyholder_id: Filter by policyholder ID
            policy_id: Filter by policy ID
            inbox_status: Filter by inbox status
            claim_status: Filter by claim status
            event_type: Filter by event type
            name_search: Search in first or last name
            date_from: Filter events from this date
            date_to: Filter events until this date
            assigned_to: Filter by assigned user
            priority: Filter by priority
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
            
        Returns:
            Tuple of (list of inbox items, total count)
        """
        try:
            # Build base query
            query_conditions = []
            
            # Add filters
            if policyholder_id:
                query_conditions.append(Inbox.policyholder_id == policyholder_id)
            
            if policy_id:
                query_conditions.append(Inbox.policy_id == policy_id)
            
            if inbox_status:
                query_conditions.append(Inbox.inbox_status == inbox_status)
                
            if claim_status:
                query_conditions.append(Inbox.claim_status == claim_status)
            
            if event_type:
                query_conditions.append(Inbox.event_type == event_type)
            
            if name_search:
                name_condition = or_(
                    Inbox.first_name.ilike(f"%{name_search}%"),
                    Inbox.last_name.ilike(f"%{name_search}%")
                )
                query_conditions.append(name_condition)
            
            if date_from:
                query_conditions.append(Inbox.event_date >= date_from)
                
            if date_to:
                query_conditions.append(Inbox.event_date <= date_to)
                
            if assigned_to:
                query_conditions.append(Inbox.assigned_to == assigned_to)
                
            if priority:
                query_conditions.append(Inbox.priority == priority)
            
            # Combine all conditions
            where_clause = and_(*query_conditions) if query_conditions else True
            
            # Count query
            count_statement = select(func.count(Inbox.id)).where(where_clause)
            count_result = await self.session.exec(count_statement)
            total = count_result.one()
            
            # Data query with pagination
            statement = (
                select(Inbox)
                .where(where_clause)
                .order_by(Inbox.created_at.desc())
                .offset(skip)
                .limit(limit)
            )
            
            result = await self.session.exec(statement)
            inbox_items = result.all()
            
            logger.info(f"Found {len(inbox_items)} inbox items (total: {total})")
            return inbox_items, total
            
        except Exception as e:
            logger.error(f"Error searching inbox items: {str(e)}")
            return [], 0

    async def create_inbox_item(self, inbox_data: Dict[str, Any]) -> Inbox:
        """
        Create a new inbox item
        
        Args:
            inbox_data: Dictionary containing inbox item data
            
        Returns:
            The created inbox item
        """
        # Generate a unique claim ID if not provided
        if not inbox_data.get("claim_id"):
            inbox_data["claim_id"] = f"INB{uuid.uuid4().hex[:6].upper()}"
        
        # Create new inbox item
        inbox_item = Inbox(**inbox_data)
        
        # Add to DB and commit
        self.session.add(inbox_item)
        await self.session.commit()
        await self.session.refresh(inbox_item)
        
        return inbox_item

    async def update_inbox_status(
        self,
        inbox_id: str,
        status: str,
        metadata: Optional[dict] = None
    ) -> Optional[Inbox]:
        """
        Update the status of an inbox item
        
        Args:
            inbox_id: The inbox item ID (could be id or claim_id)
            status: New status
            metadata: Optional metadata to update
            
        Returns:
            Updated inbox item or None if not found
        """
        try:
            # Try to find by claim_id first, then by id
            inbox_item = await self.get_by_claim_id(inbox_id)
            if not inbox_item:
                inbox_item = await self.get_by_id(inbox_id)
            
            if not inbox_item:
                logger.warning(f"Inbox item not found: {inbox_id}")
                return None
            
            # Update status
            inbox_item.inbox_status = status
            inbox_item.updated_at = datetime.utcnow()
            
            # Update metadata if provided
            if metadata:
                if inbox_item.claim_metadata:
                    inbox_item.claim_metadata.update(metadata)
                else:
                    inbox_item.claim_metadata = metadata
            
            # Mark as processed if status is converted or rejected
            if status in [InboxStatus.CONVERTED, InboxStatus.REJECTED]:
                inbox_item.processed_at = datetime.utcnow()
            
            await self.session.commit()
            await self.session.refresh(inbox_item)
            
            logger.info(f"Updated inbox item {inbox_id} status to {status}")
            return inbox_item
            
        except Exception as e:
            logger.error(f"Error updating inbox item status: {str(e)}")
            await self.session.rollback()
            return None

    async def convert_to_claim(
        self,
        inbox_id: str,
        converted_claim_id: str
    ) -> Optional[Inbox]:
        """
        Mark an inbox item as converted to a claim
        
        Args:
            inbox_id: The inbox item ID
            converted_claim_id: The ID of the created claim
            
        Returns:
            Updated inbox item or None if not found
        """
        try:
            # Try to find by claim_id first, then by id
            inbox_item = await self.get_by_claim_id(inbox_id)
            if not inbox_item:
                inbox_item = await self.get_by_id(inbox_id)
            
            if not inbox_item:
                logger.warning(f"Inbox item not found: {inbox_id}")
                return None
            
            # Update status and link to converted claim
            inbox_item.inbox_status = InboxStatus.CONVERTED
            inbox_item.converted_claim_id = converted_claim_id
            inbox_item.processed_at = datetime.utcnow()
            inbox_item.updated_at = datetime.utcnow()
            
            await self.session.commit()
            await self.session.refresh(inbox_item)
            
            logger.info(f"Converted inbox item {inbox_id} to claim {converted_claim_id}")
            return inbox_item
            
        except Exception as e:
            logger.error(f"Error converting inbox item to claim: {str(e)}")
            await self.session.rollback()
            return None

    async def assign_to_user(
        self,
        inbox_id: str,
        assigned_to: str
    ) -> Optional[Inbox]:
        """
        Assign an inbox item to a user
        
        Args:
            inbox_id: The inbox item ID
            assigned_to: User to assign to
            
        Returns:
            Updated inbox item or None if not found
        """
        try:
            # Try to find by claim_id first, then by id
            inbox_item = await self.get_by_claim_id(inbox_id)
            if not inbox_item:
                inbox_item = await self.get_by_id(inbox_id)
            
            if not inbox_item:
                logger.warning(f"Inbox item not found: {inbox_id}")
                return None
            
            # Update assignment
            inbox_item.assigned_to = assigned_to
            inbox_item.updated_at = datetime.utcnow()
            
            # Update status to processing if it's new
            if inbox_item.inbox_status == InboxStatus.NEW:
                inbox_item.inbox_status = InboxStatus.PROCESSING
            
            await self.session.commit()
            await self.session.refresh(inbox_item)
            
            logger.info(f"Assigned inbox item {inbox_id} to {assigned_to}")
            return inbox_item
            
        except Exception as e:
            logger.error(f"Error assigning inbox item: {str(e)}")
            await self.session.rollback()
            return None

    async def set_priority(
        self,
        inbox_id: str,
        priority: str
    ) -> Optional[Inbox]:
        """
        Set the priority of an inbox item
        
        Args:
            inbox_id: The inbox item ID
            priority: Priority level (low, normal, high, urgent)
            
        Returns:
            Updated inbox item or None if not found
        """
        try:
            # Try to find by claim_id first, then by id
            inbox_item = await self.get_by_claim_id(inbox_id)
            if not inbox_item:
                inbox_item = await self.get_by_id(inbox_id)
            
            if not inbox_item:
                logger.warning(f"Inbox item not found: {inbox_id}")
                return None
            
            # Update priority
            inbox_item.priority = priority
            inbox_item.updated_at = datetime.utcnow()
            
            await self.session.commit()
            await self.session.refresh(inbox_item)
            
            logger.info(f"Set inbox item {inbox_id} priority to {priority}")
            return inbox_item
            
        except Exception as e:
            logger.error(f"Error setting inbox item priority: {str(e)}")
            await self.session.rollback()
            return None

    async def get_inbox_stats(self) -> Dict[str, int]:
        """
        Get statistics about inbox items
        
        Returns:
            Dictionary with counts by status
        """
        try:
            stats = {}
            
            # Count by inbox status
            for status in InboxStatus:
                count_statement = select(func.count(Inbox.id)).where(Inbox.inbox_status == status)
                result = await self.session.exec(count_statement)
                stats[status] = result.one()
            
            # Total count
            total_statement = select(func.count(Inbox.id))
            result = await self.session.exec(total_statement)
            stats["total"] = result.one()
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting inbox stats: {str(e)}")
            return {}

    async def get_unprocessed_count(self) -> int:
        """
        Get count of unprocessed inbox items (new or processing)
        
        Returns:
            Count of unprocessed items
        """
        try:
            statement = select(func.count(Inbox.id)).where(
                Inbox.inbox_status.in_([InboxStatus.NEW, InboxStatus.PROCESSING])
            )
            result = await self.session.exec(statement)
            return result.one()
            
        except Exception as e:
            logger.error(f"Error getting unprocessed count: {str(e)}")
            return 0