from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from schemas.policyholders.schemas import PolicyHolderDeleteResponse
from repositories import PolicyHolderRepository
from schemas import PolicyHolderCreate, PolicyHolderRead, PolicyHolderUpdate

router = APIRouter(prefix="/policyholders", tags=["policyholders"])

@router.post("/", response_model=PolicyHolderRead, status_code=status.HTTP_201_CREATED)
async def create_policyholder(
    policyholder: PolicyHolderCreate, 
    repo: PolicyHolderRepository = Depends()
):

    """
    Create a new policyholder.
    """
    # Check if email already exists
    existing_policyholder = await repo.get_by_email(email=policyholder.email)
    if existing_policyholder:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create the policyholder
    return await repo.create_policyholder(policyholder=policyholder)

@router.get("/", response_model=List[PolicyHolderRead])
async def read_policyholders(
    skip: int = 0, 
    limit: int = 100, 
    repo: PolicyHolderRepository = Depends()
):
    """
    Retrieve all policyholders with pagination.
    """
    return await repo.list_policyholders(skip=skip, limit=limit)

@router.get("/{id}", response_model=PolicyHolderRead)
async def read_policyholder(
    id: str, 
    repo: PolicyHolderRepository = Depends()
):
    """
    Get a specific policyholder by ID.
    """
    db_policyholder = await repo.get_by_id(id=id)
    if db_policyholder is None:
        raise HTTPException(status_code=404, detail="Policyholder not found")
    return db_policyholder

@router.patch("/{id}", response_model=PolicyHolderRead)
async def update_policyholder(
    id: str, 
    policyholder: PolicyHolderUpdate, 
    repo: PolicyHolderRepository = Depends()
):
    """
    Update a policyholder's information.
    """
    db_policyholder = await repo.update_policyholder(
        id=id, 
        policyholder=policyholder
    )
    if db_policyholder is None:
        raise HTTPException(status_code=404, detail="Policyholder not found")
    return db_policyholder

@router.delete("/{id}", response_model=PolicyHolderDeleteResponse)
async def delete_policyholder(
    id: str, 
    repo: PolicyHolderRepository = Depends()
):
    """
    Delete a policyholder.
    """
    success = await repo.delete_policyholder(id=id)
    if not success:
        raise HTTPException(status_code=404, detail="Policyholder not found")
    return PolicyHolderDeleteResponse(
        success=True,
        message="Policyholder deleted successfully", 
        data=None,
    )