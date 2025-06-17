from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from typing import List, Optional
from datetime import date
import logging

from repositories import ClaimRepository, PolicyHolderRepository
from models import ClaimStatus, EventType
from schemas.claims import (
    ClaimCreate,
    ClaimRead,
    ClaimUpdate,
    ClaimResponse,
    ClaimListResponse,
    ClaimDetailResponse,
)
from database import AsyncSessionDep

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/claims", tags=["claims"])

@router.post(
    "/",
    response_model=ClaimDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new claim"
)
async def create_claim(
    claim: ClaimCreate,
    claim_repo: ClaimRepository = Depends(ClaimRepository),
    policyholder_repo: PolicyHolderRepository = Depends(PolicyHolderRepository),
):
    """
    Create a new insurance claim.
    
    Args:
        claim: The claim data to create
        
    Returns:
        The created claim
    """
    try:
        
        # Convert pydantic model to dict
        claim_data = claim.model_dump()
        
        # Check if policyholder exists if ID is provided
        if claim.policyholder_id:
            policyholder = await policyholder_repo.get_by_policyholder_id(claim.policyholder_id)
            if not policyholder:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Policyholder with ID {claim.policyholder_id} not found"
                )
        
        # Create the claim
        created_claim = await claim_repo.create_claim(claim_data)
        
        return ClaimDetailResponse(
            success=True,
            message="Claim created successfully",
            data=created_claim
        )
    except Exception as e:
        logger.error(f"Error creating claim: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating claim: {str(e)}"
        )

@router.get(
    "/",
    response_model=ClaimListResponse,
    summary="List and search claims"
)
async def list_claims(
    policyholder_id: Optional[str] = None,
    policy_id: Optional[str] = None,
    status: Optional[str] = None,
    event_type: Optional[str] = None,
    name_search: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    claim_repo: ClaimRepository = Depends(ClaimRepository),
):
    """
    List and search claims with various filters.
    
    Args:
        policyholder_id: Filter by policyholder ID
        policy_id: Filter by policy ID
        status: Filter by claim status
        event_type: Filter by event type
        name_search: Search in first or last name
        date_from: Filter events from this date
        date_to: Filter events until this date
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of matching claims
    """
    try:
        
        # Search claims
        claims, total = await claim_repo.search_claims(
            policyholder_id=policyholder_id,
            policy_id=policy_id,
            status=status,
            event_type=event_type,
            name_search=name_search,
            date_from=date_from,
            date_to=date_to,
            skip=skip,
            limit=limit
        )
        
        # Calculate pagination
        pages = (total + limit - 1) // limit if limit > 0 else 1
        page = (skip // limit) + 1 if limit > 0 else 1
        
        return ClaimListResponse(
            success=True,
            message=f"Found {len(claims)} claims",
            data=claims,
            count=len(claims),
            total=total,
            page=page,
            pages=pages
        )
    except Exception as e:
        logger.error(f"Error searching claims: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching claims: {str(e)}"
        )

@router.get(
    "/{claim_id}",
    response_model=ClaimDetailResponse,
    summary="Get claim details"
)
async def get_claim(
    claim_id: str,
    claim_repo: ClaimRepository = Depends(ClaimRepository),
):
    """
    Get details for a specific claim.
    
    Args:
        claim_id: The claim ID
        
    Returns:
        The claim details
    """
    try:
        
        # Get claim
        claim = await claim_repo.get_by_claim_id(claim_id)
        if not claim:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Claim with ID {claim_id} not found"
            )
        
        return ClaimDetailResponse(
            success=True,
            message="Claim found",
            data=claim
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting claim {claim_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting claim: {str(e)}"
        )

@router.patch(
    "/{claim_id}",
    response_model=ClaimDetailResponse,
    summary="Update a claim"
)
async def update_claim(
    claim_id: str,
    claim: ClaimUpdate,
    claim_repo: ClaimRepository = Depends(ClaimRepository),
):
    """
    Update a claim.
    
    Args:
        claim_id: The claim ID to update
        claim: The updated claim data
        
    Returns:
        The updated claim
    """
    try:
        
        # Get existing claim
        existing_claim = await claim_repo.get_by_claim_id(claim_id)
        if not existing_claim:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Claim with ID {claim_id} not found"
            )
        
        # Update claim
        updated_claim = await claim_repo.update(existing_claim.id, claim)
        if not updated_claim:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Failed to update claim with ID {claim_id}"
            )
        
        return ClaimDetailResponse(
            success=True,
            message="Claim updated successfully",
            data=updated_claim
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating claim {claim_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating claim: {str(e)}"
        )

@router.patch(
    "/{claim_id}/status",
    response_model=ClaimDetailResponse,
    summary="Update a claim's status"
)
async def update_claim_status(
    claim_id: str,
    status: str = Body(..., embed=True),
    metadata: Optional[dict] = Body(None, embed=True),
    claim_repo: ClaimRepository = Depends(ClaimRepository),
):
    """
    Update a claim's status.
    
    Args:
        claim_id: The claim ID
        status: The new status
        metadata: Optional metadata to add
        
    Returns:
        The updated claim
    """
    try:
        
        # Validate status
        if status not in [s for s in dir(ClaimStatus) if not s.startswith("_")]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status}"
            )
        
        # Update status
        updated_claim = await claim_repo.update_claim_status(claim_id, status, metadata)
        if not updated_claim:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Claim with ID {claim_id} not found"
            )
        
        return ClaimDetailResponse(
            success=True,
            message=f"Claim status updated to {status}",
            data=updated_claim
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating claim status for {claim_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating claim status: {str(e)}"
        )

@router.patch(
    "/{claim_id}/associate",
    response_model=ClaimDetailResponse,
    summary="Associate claim with policyholder"
)
async def associate_claim(
    claim_id: str,
    policyholder_id: str = Body(..., embed=True),
    policy_id: Optional[str] = Body(None, embed=True),
    matched_by: Optional[str] = Body(None, embed=True),
    claim_repo: ClaimRepository = Depends(ClaimRepository),
    policyholder_repo: PolicyHolderRepository = Depends(PolicyHolderRepository),
):
    """
    Associate a claim with a policyholder.
    
    Args:
        claim_id: The claim ID
        policyholder_id: The policyholder ID
        policy_id: Optional policy ID
        matched_by: How the match was determined
        
    Returns:
        The updated claim
    """
    try:
        
        # Check if policyholder exists
        policyholder = await policyholder_repo.get_by_policyholder_id(policyholder_id)
        if not policyholder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Policyholder with ID {policyholder_id} not found"
            )
        
        # Associate claim
        updated_claim = await claim_repo.associate_with_policyholder(
            claim_id=claim_id,
            policyholder_id=policyholder_id,
            policy_id=policy_id,
            matched_by=matched_by
        )
        
        if not updated_claim:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Claim with ID {claim_id} not found"
            )
        
        return ClaimDetailResponse(
            success=True,
            message=f"Claim associated with policyholder {policyholder_id}",
            data=updated_claim
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error associating claim {claim_id} with policyholder: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error associating claim with policyholder: {str(e)}"
        )