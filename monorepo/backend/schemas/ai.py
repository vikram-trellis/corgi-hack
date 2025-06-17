from typing import Dict, List, Any, Optional
from enum import Enum
from sqlmodel import SQLModel
from pydantic import BaseModel

from services.gemini import SchemaType

class DocumentAnalysisRequest(SQLModel):
    """Schema for document analysis requests"""
    model: Optional[str] = "gemini-2.5-pro-preview-03-25"
    temperature: Optional[float] = 0.2
    schema_type: SchemaType

class DocumentAnalysisResponse(SQLModel):
    """Schema for document analysis responses"""
    success: bool
    message: str
    result: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

class TextGenerationRequest(SQLModel):
    """Schema for text generation requests"""
    prompt: str
    model: Optional[str] = "gemini-2.5-pro-preview-03-25"
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 8192

class TextGenerationResponse(SQLModel):
    """Schema for text generation responses"""
    success: bool
    message: str
    text: str
    metadata: Optional[Dict[str, Any]] = None