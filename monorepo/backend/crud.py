from sqlmodel import Session, select
from models import PolicyHolder, PolicyHolderCreate, PolicyHolderUpdate
import uuid
from typing import List, Optional

def get_policyholder(db: Session, policyholder_id: str) -> Optional[PolicyHolder]:
    return db.exec(select(PolicyHolder).where(PolicyHolder.policyholder_id == policyholder_id)).first()

def get_policyholder_by_email(db: Session, email: str) -> Optional[PolicyHolder]:
    return db.exec(select(PolicyHolder).where(PolicyHolder.email == email)).first()

def get_policyholders(db: Session, skip: int = 0, limit: int = 100) -> List[PolicyHolder]:
    return db.exec(select(PolicyHolder).offset(skip).limit(limit)).all()

def create_policyholder(db: Session, policyholder: PolicyHolderCreate) -> PolicyHolder:
    # Generate a unique policyholder ID with PH prefix
    policyholder_id = f"PH{uuid.uuid4().hex[:6].upper()}"
    
    # Convert to dict and add policyholder_id
    policyholder_data = policyholder.model_dump()
    policyholder_data["policyholder_id"] = policyholder_id
    
    # Create the new PolicyHolder instance
    db_policyholder = PolicyHolder(**policyholder_data)
    
    # Add to DB and commit
    db.add(db_policyholder)
    db.commit()
    db.refresh(db_policyholder)
    return db_policyholder

def update_policyholder(db: Session, policyholder_id: str, policyholder: PolicyHolderUpdate) -> Optional[PolicyHolder]:
    db_policyholder = get_policyholder(db, policyholder_id)
    if db_policyholder is None:
        return None
    
    # Filter out None values to only update provided fields
    update_data = policyholder.model_dump(exclude_unset=True)
    
    # Update the policyholder with the new data
    for key, value in update_data.items():
        setattr(db_policyholder, key, value)
    
    db.add(db_policyholder)
    db.commit()
    db.refresh(db_policyholder)
    return db_policyholder

def delete_policyholder(db: Session, policyholder_id: str) -> bool:
    db_policyholder = get_policyholder(db, policyholder_id)
    if db_policyholder is None:
        return False
    
    db.delete(db_policyholder)
    db.commit()
    return True