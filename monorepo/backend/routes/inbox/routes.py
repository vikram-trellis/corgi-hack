from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from typing import List, Optional
from datetime import date
import logging

from repositories import InboxRepository, ClaimRepository, DocumentRepository
from models import InboxStatus
from schemas.inbox import (
    InboxCreate,
    InboxRead,
    InboxUpdate,
    InboxResponse,
    InboxListResponse,
    InboxDetailResponse,
    InboxStatsResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/inbox", tags=["inbox"])

@router.post(
    "/",
    response_model=InboxDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new inbox item"
)
async def create_inbox_item(
    inbox_item: InboxCreate,
    inbox_repo: InboxRepository = Depends(),
):
    """
    Create a new inbox item.
    
    Args:
        inbox_item: The inbox item data to create
        
    Returns:
        The created inbox item
    """
    try:
        # Convert pydantic model to dict
        inbox_data = inbox_item.model_dump()
        
        # Create the inbox item
        created_item = await inbox_repo.create_inbox_item(inbox_data)
        
        return InboxDetailResponse(
            success=True,
            message="Inbox item created successfully",
            data=created_item
        )
    except Exception as e:
        logger.error(f"Error creating inbox item: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating inbox item: {str(e)}"
        )

@router.get(
    "/",
    response_model=InboxListResponse,
    summary="List and search inbox items"
)
async def list_inbox_items(
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
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    inbox_repo: InboxRepository = Depends(),
):
    """
    List and search inbox items with various filters.
    
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
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of matching inbox items
    """
    try:
        # Search inbox items
        inbox_items, total = await inbox_repo.search_inbox_items(
            policyholder_id=policyholder_id,
            policy_id=policy_id,
            inbox_status=inbox_status,
            claim_status=claim_status,
            event_type=event_type,
            name_search=name_search,
            date_from=date_from,
            date_to=date_to,
            assigned_to=assigned_to,
            priority=priority,
            skip=skip,
            limit=limit
        )
        
        # Calculate pagination
        pages = (total + limit - 1) // limit if limit > 0 else 1
        page = (skip // limit) + 1 if limit > 0 else 1
        
        return InboxListResponse(
            success=True,
            message=f"Found {len(inbox_items)} inbox items",
            data=inbox_items,
            count=len(inbox_items),
            total=total,
            page=page,
            pages=pages
        )
    except Exception as e:
        logger.error(f"Error searching inbox items: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching inbox items: {str(e)}"
        )

@router.get(
    "/stats",
    response_model=InboxStatsResponse,
    summary="Get inbox statistics"
)
async def get_inbox_stats(
    inbox_repo: InboxRepository = Depends(),
):
    """
    Get statistics about inbox items.
    
    Returns:
        Statistics about inbox items by status
    """
    try:
        stats = await inbox_repo.get_inbox_stats()
        
        return InboxStatsResponse(
            success=True,
            message="Inbox statistics retrieved successfully",
            data=stats
        )
    except Exception as e:
        logger.error(f"Error getting inbox stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting inbox stats: {str(e)}"
        )

@router.get(
    "/{inbox_id}",
    response_model=InboxDetailResponse,
    summary="Get inbox item details"
)
async def get_inbox_item(
    inbox_id: str,
    inbox_repo: InboxRepository = Depends(),
):
    """
    Get details for a specific inbox item.
    
    Args:
        inbox_id: The inbox item ID
        
    Returns:
        The inbox item details
    """
    try:
        # Try to get by claim_id first, then by id
        inbox_item = await inbox_repo.get_by_claim_id(inbox_id)
        if not inbox_item:
            inbox_item = await inbox_repo.get_by_id(inbox_id)
        
        if not inbox_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inbox item with ID {inbox_id} not found"
            )
        
        return InboxDetailResponse(
            success=True,
            message="Inbox item found",
            data=inbox_item
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting inbox item {inbox_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting inbox item: {str(e)}"
        )

@router.patch(
    "/{inbox_id}",
    response_model=InboxDetailResponse,
    summary="Update an inbox item"
)
async def update_inbox_item(
    inbox_id: str,
    inbox_item: InboxUpdate,
    inbox_repo: InboxRepository = Depends(),
):
    """
    Update an inbox item.
    
    Args:
        inbox_id: The inbox item ID to update
        inbox_item: The updated inbox item data
        
    Returns:
        The updated inbox item
    """
    try:
        # Get existing inbox item
        existing_item = await inbox_repo.get_by_claim_id(inbox_id)
        if not existing_item:
            existing_item = await inbox_repo.get_by_id(inbox_id)
        
        if not existing_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inbox item with ID {inbox_id} not found"
            )
        
        # Update inbox item
        updated_item = await inbox_repo.update(existing_item.id, inbox_item)
        if not updated_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Failed to update inbox item with ID {inbox_id}"
            )
        
        return InboxDetailResponse(
            success=True,
            message="Inbox item updated successfully",
            data=updated_item
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating inbox item {inbox_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating inbox item: {str(e)}"
        )

@router.patch(
    "/{inbox_id}/status",
    response_model=InboxDetailResponse,
    summary="Update an inbox item's status"
)
async def update_inbox_status(
    inbox_id: str,
    status: str = Body(..., embed=True),
    metadata: Optional[dict] = Body(None, embed=True),
    inbox_repo: InboxRepository = Depends(),
):
    """
    Update an inbox item's status.
    
    Args:
        inbox_id: The inbox item ID
        status: The new status
        metadata: Optional metadata to add
        
    Returns:
        The updated inbox item
    """
    try:
        # Validate status
        valid_statuses = [InboxStatus.NEW, InboxStatus.PROCESSING, InboxStatus.CONVERTED, InboxStatus.REJECTED]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status}. Valid statuses are: {', '.join(valid_statuses)}"
            )
        
        # Update status
        updated_item = await inbox_repo.update_inbox_status(inbox_id, status, metadata)
        if not updated_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inbox item with ID {inbox_id} not found"
            )
        
        return InboxDetailResponse(
            success=True,
            message=f"Inbox item status updated to {status}",
            data=updated_item
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating inbox item status for {inbox_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating inbox item status: {str(e)}"
        )

@router.patch(
    "/{inbox_id}/assign",
    response_model=InboxDetailResponse,
    summary="Assign inbox item to user"
)
async def assign_inbox_item(
    inbox_id: str,
    assigned_to: str = Body(..., embed=True),
    inbox_repo: InboxRepository = Depends(),
):
    """
    Assign an inbox item to a user.
    
    Args:
        inbox_id: The inbox item ID
        assigned_to: The user to assign to
        
    Returns:
        The updated inbox item
    """
    try:
        # Assign to user
        updated_item = await inbox_repo.assign_to_user(inbox_id, assigned_to)
        if not updated_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inbox item with ID {inbox_id} not found"
            )
        
        return InboxDetailResponse(
            success=True,
            message=f"Inbox item assigned to {assigned_to}",
            data=updated_item
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning inbox item {inbox_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error assigning inbox item: {str(e)}"
        )

@router.patch(
    "/{inbox_id}/priority",
    response_model=InboxDetailResponse,
    summary="Set inbox item priority"
)
async def set_inbox_priority(
    inbox_id: str,
    priority: str = Body(..., embed=True),
    inbox_repo: InboxRepository = Depends(),
):
    """
    Set the priority of an inbox item.
    
    Args:
        inbox_id: The inbox item ID
        priority: The priority level (low, normal, high, urgent)
        
    Returns:
        The updated inbox item
    """
    try:
        # Validate priority
        valid_priorities = ["low", "normal", "high", "urgent"]
        if priority not in valid_priorities:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid priority: {priority}. Valid priorities are: {', '.join(valid_priorities)}"
            )
        
        # Set priority
        updated_item = await inbox_repo.set_priority(inbox_id, priority)
        if not updated_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inbox item with ID {inbox_id} not found"
            )
        
        return InboxDetailResponse(
            success=True,
            message=f"Inbox item priority set to {priority}",
            data=updated_item
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting inbox item priority for {inbox_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error setting inbox item priority: {str(e)}"
        )

@router.patch(
    "/{inbox_id}/convert",
    response_model=InboxDetailResponse,
    summary="Convert inbox item to claim"
)
async def convert_to_claim(
    inbox_id: str,
    converted_claim_id: str = Body(..., embed=True),
    inbox_repo: InboxRepository = Depends(),
):
    """
    Mark an inbox item as converted to a claim.
    
    Args:
        inbox_id: The inbox item ID
        converted_claim_id: The ID of the created claim
        
    Returns:
        The updated inbox item
    """
    try:
        # Convert to claim
        updated_item = await inbox_repo.convert_to_claim(inbox_id, converted_claim_id)
        if not updated_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inbox item with ID {inbox_id} not found"
            )
        
        return InboxDetailResponse(
            success=True,
            message=f"Inbox item converted to claim {converted_claim_id}",
            data=updated_item
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error converting inbox item {inbox_id} to claim: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error converting inbox item to claim: {str(e)}"
        )

@router.post(
    "/{inbox_id}/convert-to-claim",
    response_model=InboxDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Convert inbox item to claim with document transfer"
)
async def convert_inbox_to_claim(
    inbox_id: str,
    inbox_repo: InboxRepository = Depends(),
    claim_repo: ClaimRepository = Depends(),
    document_repo: DocumentRepository = Depends(),
):
    """
    Convert an inbox item to a claim and transfer all associated documents.
    This endpoint will:
    1. Fetch the inbox item
    2. Create a new claim from the inbox data
    3. Transfer all documents from inbox to the new claim
    4. Mark the inbox item as converted
    5. Delete the inbox item (as requested)
    
    Args:
        inbox_id: The inbox item ID to convert
        
    Returns:
        The converted inbox item with claim details
    """
    try:
        # Get the inbox item
        inbox_item = await inbox_repo.get_by_inbox_id(inbox_id)
        if not inbox_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inbox item with ID {inbox_id} not found"
            )
        
        # Check if already converted
        if inbox_item.inbox_status == InboxStatus.CONVERTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Inbox item {inbox_id} has already been converted"
            )
        
        # Create claim data from inbox item
        claim_data = {
            "first_name": inbox_item.first_name,
            "last_name": inbox_item.last_name,
            "contact_email": inbox_item.contact_email,
            "date_of_birth": inbox_item.date_of_birth,
            "policyholder_id": inbox_item.policyholder_id,
            "policy_id": inbox_item.policy_id,
            "event_type": inbox_item.event_type,
            "event_date": inbox_item.event_date,
            "event_location": inbox_item.event_location,
            "damage_description": inbox_item.damage_description,
            "vehicle_vin": inbox_item.vehicle_vin,
            "estimated_damage_amount": inbox_item.estimated_damage_amount,
            "claim_status": "submitted",  # Start with submitted status
            "claim_metadata": inbox_item.claim_metadata or {},
            "photos": []
        }
        
        # Create the new claim
        new_claim = await claim_repo.create_claim(claim_data)
        
        # Transfer documents from inbox to claim
        transferred_documents = await document_repo.transfer_documents_to_claim(
            inbox_item.id,  # Use claim_id as the inbox identifier
            new_claim.id
        )
        
        # Mark inbox as converted
        updated_inbox = await inbox_repo.convert_to_claim(
            inbox_item.id,
            new_claim.id
        )
        
        # Delete the inbox item as requested
        await inbox_repo.delete(inbox_item.id)
        
        logger.info(f"Successfully converted inbox item {inbox_id} to claim {new_claim.id} with {len(transferred_documents)} documents")
        
        return InboxDetailResponse(
            success=True,
            message=f"Inbox item successfully converted to claim {new_claim.id} and removed from inbox. {len(transferred_documents)} documents transferred.",
            data={
                "converted_claim_id": new_claim.id,
                "documents_transferred": len(transferred_documents),
                "original_inbox_id": inbox_item.id,
                "first_name": inbox_item.first_name,
                "last_name": inbox_item.last_name,
                "contact_email": inbox_item.contact_email,
                "date_of_birth": inbox_item.date_of_birth,
                "policyholder_id": inbox_item.policyholder_id,
                "policy_id": inbox_item.policy_id,
                "event_type": inbox_item.event_type,
                "event_date": inbox_item.event_date,
                "event_location": inbox_item.event_location,
                "damage_description": inbox_item.damage_description,
                "vehicle_vin": inbox_item.vehicle_vin,
                "estimated_damage_amount": inbox_item.estimated_damage_amount,
                "claim_status": "submitted",  # Start with submitted status
                "claim_metadata": inbox_item.claim_metadata or {},
                "id": new_claim.id,
                "inbox_status": "converted",
                "priority": inbox_item.priority,
                "created_at": inbox_item.created_at,
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error converting inbox item {inbox_id} to claim: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error converting inbox item to claim: {str(e)}"
        )