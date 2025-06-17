from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlmodel import select, and_, or_
from fastapi import Depends
from logging import getLogger

from database import get_async_session
from models.document import Document
from schemas.documents.schemas import DocumentCreate, DocumentUpdate

logger = getLogger(__name__)

class DocumentRepository:
    """Repository for document operations"""
    
    def __init__(self, session=Depends(get_async_session)):
        self.session = session
    
    async def create_document(self, document_data: DocumentCreate) -> Document:
        """
        Create a new document
        
        Args:
            document_data: Document data to create
            
        Returns:
            Created document
        """
        document = Document(**document_data.dict())
        self.session.add(document)
        await self.session.commit()
        await self.session.refresh(document)
        return document
    
    async def get_by_id(self, document_id: str) -> Optional[Document]:
        """
        Get document by ID
        
        Args:
            document_id: Document ID
            
        Returns:
            Document or None if not found
        """
        statement = select(Document).where(Document.id == document_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()
    
    async def get_by_claim_id(self, claim_id: str) -> List[Document]:
        """
        Get documents by claim ID
        
        Args:
            claim_id: Claim ID
            
        Returns:
            List of documents
        """
        statement = select(Document).where(Document.claim_id == claim_id)
        result = await self.session.execute(statement)
        return result.scalars().all()
    
    async def get_by_inbox_id(self, inbox_id: str) -> List[Document]:
        """
        Get documents by inbox ID
        
        Args:
            inbox_id: Inbox ID
            
        Returns:
            List of documents
        """
        statement = select(Document).where(Document.inbox_id == inbox_id)
        result = await self.session.execute(statement)
        return result.scalars().all()
    
    async def update_document(self, document_id: str, document_data: DocumentUpdate) -> Optional[Document]:
        """
        Update document
        
        Args:
            document_id: Document ID
            document_data: Document data to update
            
        Returns:
            Updated document or None if not found
        """
        document = await self.get_by_id(document_id)
        if not document:
            logger.warning(f"Document not found: {document_id}")
            return None
        
        # Update only non-None fields
        update_data = document_data.dict(exclude_unset=True, exclude_none=True)
        for key, value in update_data.items():
            setattr(document, key, value)
        
        document.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(document)
        return document
    
    async def delete_document(self, document_id: str) -> bool:
        """
        Delete document
        
        Args:
            document_id: Document ID
            
        Returns:
            True if document was deleted, False otherwise
        """
        document = await self.get_by_id(document_id)
        if not document:
            logger.warning(f"Document not found: {document_id}")
            return False
        
        await self.session.delete(document)
        await self.session.commit()
        return True
    
    async def list_documents(
        self,
        skip: int = 0,
        limit: int = 100,
        claim_id: Optional[str] = None,
        inbox_id: Optional[str] = None,
    ) -> List[Document]:
        """
        List documents with optional filtering
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            claim_id: Filter by claim ID
            inbox_id: Filter by inbox ID
            
        Returns:
            List of documents
        """
        statement = select(Document)
        
        # Apply filters
        filters = []
        if claim_id:
            filters.append(Document.claim_id == claim_id)
        if inbox_id:
            filters.append(Document.inbox_id == inbox_id)
        
        if filters:
            statement = statement.where(or_(*filters))
        
        statement = statement.offset(skip).limit(limit)
        result = await self.session.execute(statement)
        return result.scalars().all()
    
    async def count_documents(
        self,
        claim_id: Optional[str] = None,
        inbox_id: Optional[str] = None,
    ) -> int:
        """
        Count documents with optional filtering
        
        Args:
            claim_id: Filter by claim ID
            inbox_id: Filter by inbox ID
            
        Returns:
            Number of documents
        """
        statement = select(Document)
        
        # Apply filters
        filters = []
        if claim_id:
            filters.append(Document.claim_id == claim_id)
        if inbox_id:
            filters.append(Document.inbox_id == inbox_id)
        
        if filters:
            statement = statement.where(or_(*filters))
        
        result = await self.session.execute(statement)
        return len(result.scalars().all())
    
    async def transfer_documents_to_claim(
        self,
        inbox_id: str,
        claim_id: str,
    ) -> List[Document]:
        """
        Transfer all documents from an inbox item to a claim
        
        Args:
            inbox_id: Source inbox ID
            claim_id: Target claim ID
            
        Returns:
            List of transferred documents
        """
        # Get all documents associated with the inbox
        inbox_documents = await self.get_by_inbox_id(inbox_id)
        
        # Update each document to associate with claim instead of inbox
        transferred_documents = []
        for document in inbox_documents:
            document.claim_id = claim_id
            document.inbox_id = None
            document.updated_at = datetime.utcnow()
            transferred_documents.append(document)
        
        # Commit all changes
        await self.session.commit()
        
        # Refresh all documents
        for document in transferred_documents:
            await self.session.refresh(document)
        
        logger.info(f"Transferred {len(transferred_documents)} documents from inbox {inbox_id} to claim {claim_id}")
        return transferred_documents
