from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from typing import List, Optional
import logging
import os
import uuid
import shutil
from pathlib import Path

from repositories import DocumentRepository, ClaimRepository, InboxRepository
from schemas.documents.schemas import (
    DocumentCreate,
    DocumentRead,
    DocumentUpdate,
    DocumentResponse,
    DocumentListResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["documents"])

# Configure upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a file and create document record"
)
async def upload_file(
    file: UploadFile = File(...),
    claim_id: Optional[str] = Query(None),
    inbox_id: Optional[str] = Query(None),
    document_repo: DocumentRepository = Depends(),
    claim_repo: ClaimRepository = Depends(),
    inbox_repo: InboxRepository = Depends(),
):
    """
    Upload a file and create a document record.
    
    Args:
        file: The file to upload
        claim_id: Optional claim ID to associate with
        inbox_id: Optional inbox ID to associate with
        
    Returns:
        The created document record
    """
    try:
        # Validate that either claim_id or inbox_id is provided
        if not claim_id and not inbox_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either claim_id or inbox_id must be provided"
            )
        
        # Validate claim exists if claim_id provided
        if claim_id:
            existing_claim = await claim_repo.get_by_claim_id(claim_id)
            if not existing_claim:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Claim with ID {claim_id} not found"
                )
        
        # Validate inbox exists if inbox_id provided
        if inbox_id:
            existing_inbox = await inbox_repo.get_by_id(inbox_id)
            if not existing_inbox:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Inbox item with ID {inbox_id} not found"
                )
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix if file.filename else ""
        unique_filename = f"{uuid.uuid4().hex}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create document record
        document_data = DocumentCreate(
            file_name=file.filename or unique_filename,
            file_url=f"/uploads/{unique_filename}",
            claim_id=claim_id,
            inbox_id=inbox_id,
        )
        
        created_document = await document_repo.create_document(document_data)
        
        return DocumentResponse(
            success=True,
            message="File uploaded successfully",
            data=created_document
        )
        
    except HTTPException:
        # Clean up file if document creation fails
        if file_path.exists():
            file_path.unlink()
        raise
    except Exception as e:
        # Clean up file if anything fails
        if file_path.exists():
            file_path.unlink()
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )

@router.get(
    "/",
    response_model=DocumentListResponse,
    summary="List documents"
)
async def list_documents(
    claim_id: Optional[str] = Query(None),
    inbox_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    document_repo: DocumentRepository = Depends(),
):
    """
    List documents with optional filtering.
    
    Args:
        claim_id: Filter by claim ID
        inbox_id: Filter by inbox ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of documents
    """
    try:
        documents = await document_repo.list_documents(
            skip=skip,
            limit=limit,
            claim_id=claim_id,
            inbox_id=inbox_id
        )
        
        total = await document_repo.count_documents(
            claim_id=claim_id,
            inbox_id=inbox_id
        )
        
        page = (skip // limit) + 1 if limit > 0 else 1
        
        return DocumentListResponse(
            success=True,
            message=f"Found {len(documents)} documents",
            data=documents,
            total=total,
            page=page,
            page_size=limit
        )
        
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing documents: {str(e)}"
        )

@router.get(
    "/claim/{claim_id}",
    response_model=DocumentListResponse,
    summary="Get documents for a claim"
)
async def get_claim_documents(
    claim_id: str,
    document_repo: DocumentRepository = Depends(),
    claim_repo: ClaimRepository = Depends(),
):
    """
    Get all documents associated with a claim.
    
    Args:
        claim_id: The claim ID
        
    Returns:
        List of documents for the claim
    """
    try:
        # Validate claim exists
        existing_claim = await claim_repo.get_by_claim_id(claim_id)
        if not existing_claim:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Claim with ID {claim_id} not found"
            )
        
        documents = await document_repo.get_by_claim_id(claim_id)
        
        return DocumentListResponse(
            success=True,
            message=f"Found {len(documents)} documents for claim {claim_id}",
            data=documents,
            total=len(documents),
            page=1,
            page_size=len(documents)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting claim documents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting claim documents: {str(e)}"
        )

@router.get(
    "/inbox/{inbox_id}",
    response_model=DocumentListResponse,
    summary="Get documents for an inbox item"
)
async def get_inbox_documents(
    inbox_id: str,
    document_repo: DocumentRepository = Depends(),
    inbox_repo: InboxRepository = Depends(),
):
    """
    Get all documents associated with an inbox item.
    
    Args:
        inbox_id: The inbox item ID
        
    Returns:
        List of documents for the inbox item
    """
    try:
        # Validate inbox exists
        existing_inbox = await inbox_repo.get_by_id(inbox_id)
        if not existing_inbox:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inbox item with ID {inbox_id} not found"
            )
        
        documents = await document_repo.get_by_inbox_id(inbox_id)
        
        return DocumentListResponse(
            success=True,
            message=f"Found {len(documents)} documents for inbox item {inbox_id}",
            data=documents,
            total=len(documents),
            page=1,
            page_size=len(documents)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting inbox documents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting inbox documents: {str(e)}"
        )

@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Get document by ID"
)
async def get_document(
    document_id: str,
    document_repo: DocumentRepository = Depends(),
):
    """
    Get a document by its ID.
    
    Args:
        document_id: The document ID
        
    Returns:
        The document details
    """
    try:
        document = await document_repo.get_by_id(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document with ID {document_id} not found"
            )
        
        return DocumentResponse(
            success=True,
            message="Document found",
            data=document
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document {document_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting document: {str(e)}"
        )

@router.delete(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Delete a document"
)
async def delete_document(
    document_id: str,
    document_repo: DocumentRepository = Depends(),
):
    """
    Delete a document and its associated file.
    
    Args:
        document_id: The document ID to delete
        
    Returns:
        Success message
    """
    try:
        # Get document to find file path
        document = await document_repo.get_by_id(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document with ID {document_id} not found"
            )
        
        # Delete file from disk
        if document.file_url:
            # Extract filename from URL
            filename = document.file_url.split("/")[-1]
            file_path = UPLOAD_DIR / filename
            if file_path.exists():
                file_path.unlink()
        
        # Delete document record
        deleted = await document_repo.delete_document(document_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete document with ID {document_id}"
            )
        
        return DocumentResponse(
            success=True,
            message=f"Document {document_id} deleted successfully",
            data=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document {document_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting document: {str(e)}"
        )