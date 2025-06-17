from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException, status
from typing import Dict, List, Any, Optional
import logging
import json

from services.gemini import GeminiService, SchemaType
from schemas.ai import (
    DocumentAnalysisRequest,
    DocumentAnalysisResponse,
    TextGenerationRequest,
    TextGenerationResponse,
)

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post(
    "/analyze",
    response_model=DocumentAnalysisResponse,
    summary="Analyze a document using Gemini AI",
)
async def analyze_document(
    schema_type: SchemaType = Form(...),
    file: UploadFile = File(...),
    temperature: float = Form(0.2),
    model: str = Form("gemini-2.5-pro-preview-03-25"),
    gemini_service: GeminiService = Depends(lambda: GeminiService()),
):
    """
    Analyze a document (PDF, image, etc.) using Gemini AI with structured output.
    
    Args:
        schema_type: The schema to use for analysis
        file: The document file to analyze
        temperature: Controls randomness (0.0-1.0)
        model: Gemini model to use
        
    Returns:
        Structured analysis of the document based on the schema
    """
    try:
        logger.info(f"Analyzing document '{file.filename}' with schema {schema_type}")
        
        # Reset file cursor to beginning
        await file.seek(0)
        
        # Process the document
        result = await gemini_service.process_document(
            file=file,
            schema_type=schema_type,
            model=model,
            temperature=temperature,
        )
        
        return DocumentAnalysisResponse(
            success=True,
            message=f"Document analyzed successfully with schema: {schema_type}",
            result=result,
            metadata={
                "filename": file.filename,
                "content_type": file.content_type,
                "schema_type": schema_type,
            },
        )
        
    except Exception as e:
        logger.error(f"Error analyzing document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze document: {str(e)}",
        )

@router.post(
    "/extract-policyholder",
    response_model=DocumentAnalysisResponse,
    summary="Extract policyholder information from a document",
)
async def extract_policyholder_info(
    file: UploadFile = File(...),
    gemini_service: GeminiService = Depends(lambda: GeminiService()),
):
    """
    Extract policyholder information from a document using Gemini AI.
    
    Args:
        file: The document file containing policyholder information
        
    Returns:
        Structured policyholder information
    """
    try:
        logger.info(f"Extracting policyholder info from '{file.filename}'")
        
        # Reset file cursor to beginning
        await file.seek(0)
        
        # Process the document
        result = await gemini_service.extract_policyholder_info(file)
        
        return DocumentAnalysisResponse(
            success=True,
            message="Policyholder information extracted successfully",
            result=result,
            metadata={
                "filename": file.filename,
                "content_type": file.content_type,
            },
        )
        
    except Exception as e:
        logger.error(f"Error extracting policyholder info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract policyholder information: {str(e)}",
        )

@router.post(
    "/analyze-claim",
    response_model=DocumentAnalysisResponse,
    summary="Analyze an insurance claim document",
)
async def analyze_claim(
    file: UploadFile = File(...),
    gemini_service: GeminiService = Depends(lambda: GeminiService()),
):
    """
    Analyze an insurance claim document using Gemini AI.
    
    Args:
        file: The claim document to analyze
        
    Returns:
        Structured analysis of the claim
    """
    try:
        logger.info(f"Analyzing claim document '{file.filename}'")
        
        # Reset file cursor to beginning
        await file.seek(0)
        
        # Process the document
        result = await gemini_service.analyze_claim(file)
        
        return DocumentAnalysisResponse(
            success=True,
            message="Claim document analyzed successfully",
            result=result,
            metadata={
                "filename": file.filename,
                "content_type": file.content_type,
            },
        )
        
    except Exception as e:
        logger.error(f"Error analyzing claim document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze claim document: {str(e)}",
        )

@router.post(
    "/extract-claim-info",
    response_model=DocumentAnalysisResponse,
    summary="Extract information from a claim document",
)
async def extract_claim_info(
    file: UploadFile = File(...),
    gemini_service: GeminiService = Depends(lambda: GeminiService()),
):
    """
    Extract information from a claim document using Gemini AI.
    
    Args:
        file: The claim document to analyze
        
    Returns:
        Structured claim information
    """
    try:
        logger.info(f"Extracting claim info from '{file.filename}'")
        
        # Reset file cursor to beginning
        await file.seek(0)
        
        # Process the document
        result = await gemini_service.extract_claim_info(file)
        
        return DocumentAnalysisResponse(
            success=True,
            message="Claim information extracted successfully",
            result=result,
            metadata={
                "filename": file.filename,
                "content_type": file.content_type,
            },
        )
        
    except Exception as e:
        logger.error(f"Error extracting claim info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract claim information: {str(e)}",
        )

@router.post(
    "/generate-text",
    response_model=TextGenerationResponse,
    summary="Generate text with Gemini AI",
)
async def generate_text(
    request: TextGenerationRequest,
    gemini_service: GeminiService = Depends(lambda: GeminiService()),
):
    """
    Generate text using Gemini AI.
    
    Args:
        request: Text generation parameters
        
    Returns:
        Generated text response
    """
    try:
        logger.info(f"Generating text with prompt: {request.prompt[:50]}...")
        
        # Generate text
        response_text = await gemini_service.generate_text(
            prompt=request.prompt,
            model=request.model,
            temperature=request.temperature,
            max_output_tokens=request.max_tokens,
        )
        
        return TextGenerationResponse(
            success=True,
            message="Text generated successfully",
            text=response_text,
            metadata={
                "model": request.model,
                "temperature": request.temperature,
                "max_tokens": request.max_tokens,
            },
        )
        
    except Exception as e:
        logger.error(f"Error generating text: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate text: {str(e)}",
        )