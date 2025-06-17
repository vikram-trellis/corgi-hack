from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from repositories import AutouploadEmailRepository, PolicyHolderRepository
from schemas.autoupload_email import (
    AutouploadEmailRowData,
    GetAutouploadEmailRowsResponse,
    GetAutouploadEmailRowResponse,
    UpsertAutouploadEmailResponse,
    DeleteAutouploadEmailResponse,
)
from models import AutouploadEmail

router = APIRouter(prefix="/autoupload-email", tags=["autoupload-email"])

@router.get(
    "/{policy_holder_id}",
    response_model=GetAutouploadEmailRowsResponse,
    summary="Get all autoupload email configurations for a policy holder",
)
async def get_autoupload_emails(
    policy_holder_id: str,
    autoupload_email_repo: AutouploadEmailRepository = Depends(),
    policy_holder_repo: PolicyHolderRepository = Depends(),
):
    """
    Retrieve all autoupload email configurations for a specific policy holder.
    
    Args:
        policy_holder_id: The unique identifier of the policy holder
        
    Returns:
        List of autoupload email configurations
    """
    # First verify the policy holder exists
    policy_holder = await policy_holder_repo.get_by_id(policy_holder_id)
    if not policy_holder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Policy holder not found"
        )
    
    results = await autoupload_email_repo.get(policy_holder_id=str(policy_holder.id))
    
    return GetAutouploadEmailRowsResponse(
        message="Autoupload email configurations retrieved",
        data=[
            AutouploadEmailRowData(
                alias=row.alias,
                domain=row.domain,
                is_user_generated=row.is_user_generated,
            )
            for row in results
        ],
    )

@router.get(
    "/{policy_holder_id}/{alias}",
    response_model=GetAutouploadEmailRowResponse,
    summary="Get a specific autoupload email configuration",
)
async def get_autoupload_email_by_alias(
    policy_holder_id: str,
    alias: str,
    autoupload_email_repo: AutouploadEmailRepository = Depends(),
    policy_holder_repo: PolicyHolderRepository = Depends(),
):
    """
    Retrieve a specific autoupload email configuration by policy holder ID and alias.
    
    Args:
        policy_holder_id: The unique identifier of the policy holder
        alias: The email alias to retrieve
        
    Returns:
        The requested autoupload email configuration
    """
    # First verify the policy holder exists
    policy_holder = await policy_holder_repo.get_by_id(policy_holder_id)
    if not policy_holder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Policy holder not found"
        )
    
    rows = await autoupload_email_repo.get(
        policy_holder_id=str(policy_holder.id), alias=alias
    )
    
    if not rows:
        return GetAutouploadEmailRowResponse(
            message="Autoupload email configuration not found",
            data=None,
        )

    row = rows[0]
    
    return GetAutouploadEmailRowResponse(
        message="Autoupload email configuration retrieved",
        data=AutouploadEmailRowData(
            alias=row.alias,
            domain=row.domain,
            is_user_generated=row.is_user_generated,
        ),
    )

@router.post(
    "/{policy_holder_id}",
    response_model=UpsertAutouploadEmailResponse,
    summary="Create or update an autoupload email configuration",
)
async def upsert_autoupload_email(
    policy_holder_id: str,
    autoupload_email_data: AutouploadEmailRowData,
    autoupload_email_repo: AutouploadEmailRepository = Depends(),
    policy_holder_repo: PolicyHolderRepository = Depends(),
):
    """
    Create or update an autoupload email configuration.
    
    Args:
        policy_holder_id: The unique identifier of the policy holder
        autoupload_email_data: The configuration data
        
    Returns:
        The created or updated configuration
    """
    # First verify the policy holder exists
    policy_holder = await policy_holder_repo.get_by_id(policy_holder_id)
    if not policy_holder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Policy holder not found"
        )
    
    # Clean input data
    alias = autoupload_email_data.alias.strip().lower()
    domain = autoupload_email_data.domain.strip().lower()
    
    # Create the model instance
    autoupload_email = AutouploadEmail(
        alias=alias,
        domain=domain,
        policy_holder_id=str(policy_holder.id),
        is_user_generated=autoupload_email_data.is_user_generated,
    )
    
    # Use the upsert method
    upserted_record = await autoupload_email_repo.upsert(autoupload_email)
    
    return UpsertAutouploadEmailResponse(
        message="Autoupload email configuration created or updated successfully",
        data=AutouploadEmailRowData(
            alias=upserted_record.alias,
            domain=upserted_record.domain,
            is_user_generated=upserted_record.is_user_generated,
        ),
    )

@router.delete(
    "/{policy_holder_id}/{alias}",
    response_model=DeleteAutouploadEmailResponse,
    summary="Delete an autoupload email configuration",
)
async def delete_autoupload_email(
    policy_holder_id: str,
    alias: str,
    autoupload_email_repo: AutouploadEmailRepository = Depends(),
    policy_holder_repo: PolicyHolderRepository = Depends(),
):
    """
    Delete an autoupload email configuration.
    
    Args:
        policy_holder_id: The unique identifier of the policy holder
        alias: The email alias to delete
        
    Returns:
        The deleted configuration
    """
    # First verify the policy holder exists
    policy_holder = await policy_holder_repo.get_by_id(policy_holder_id)
    if not policy_holder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Policy holder not found"
        )
    
    deleted_record = await autoupload_email_repo.delete(
        policy_holder_id=str(policy_holder.id),
        alias=alias,
    )
    
    if not deleted_record:
        return DeleteAutouploadEmailResponse(
            message="No matching autoupload email configuration found",
            data=None,
        )
    
    return DeleteAutouploadEmailResponse(
        message="Autoupload email configuration deleted successfully",
        data=AutouploadEmailRowData(
            alias=deleted_record.alias,
            domain=deleted_record.domain,
            is_user_generated=deleted_record.is_user_generated,
        ),
    )