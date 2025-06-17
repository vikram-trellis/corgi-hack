import os
import json
import base64
import logging
from typing import List, Dict, Any, Optional, Union, Literal, TypeVar, Callable
from enum import Enum
from pathlib import Path
import asyncio

from dotenv import load_dotenv
from fastapi import UploadFile, HTTPException, status

# Google Cloud imports
from google import genai
from google.genai import types
from google.auth import credentials
from google.oauth2 import service_account
from pydantic import BaseModel

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Schema directory
SCHEMA_DIR = Path("/Users/vikramkhandelwal/corgi-hack/monorepo/backend/schemas/gemini_models")

# Type definitions
T = TypeVar('T')
FileType = Union[str, bytes, UploadFile, Path]
GenAiModel = Literal["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.5-pro-preview-03-25"]

# Schema enum for model schemas
class SchemaType(str, Enum):
    # Policyholder schemas
    POLICYHOLDER_EXTRACT = "policyholders/extract_info"
    POLICYHOLDER_CLAIM = "policyholders/claim_analysis"
    
    # Claim schemas
    CLAIM_EXTRACT = "claims/extract_info"
    
    @classmethod
    def get_schema_path(cls, schema_type: "SchemaType") -> Path:
        """Get the full path to a schema file"""
        return SCHEMA_DIR / f"{schema_type.value}.json"

class GeminiService:
    """Service for interacting with Google's Gemini generative AI model via Vertex AI"""
    
    def __init__(self):
        """Initialize the Gemini service with API key and Vertex AI configuration"""
        self.api_key = os.getenv("GEMINI_API_KEY")
        
        # Default model settings
        self.default_model = "gemini-2.5-pro-preview-03-25"
        self.vertex_project = os.getenv("GOOGLE_CLOUD_PROJECT", "corgi-hack")
        self.vertex_location = os.getenv("GOOGLE_CLOUD_LOCATION", "global")
        
        # Use Vertex AI with proper authentication
        self._initialize_client()
        
        logger.info(f"Initialized Gemini service with model: {self.default_model}")
    
    def _initialize_client(self):
        """Initialize the Gemini client with appropriate authentication"""
        try:
            # Vertex AI scope
            VERTEX_AI_SCOPE = ['https://www.googleapis.com/auth/cloud-platform']
            
            # Check if we have service account credentials in environment
            if service_account_json := os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON"):
                # Parse service account JSON
                service_account_info = json.loads(service_account_json)
                credentials_obj = service_account.Credentials.from_service_account_info(
                    service_account_info, 
                    scopes=VERTEX_AI_SCOPE
                )
                
                # Initialize with Vertex AI
                self.client = genai.Client(
                    vertexai=True,  
                    project=self.vertex_project,
                    location=self.vertex_location,
                    credentials=credentials_obj
                )
                
                logger.info("Initialized Gemini with Vertex AI and service account credentials")
            
            # Otherwise use API key
            else:
                # Configure the Gemini API with API key
                genai.configure(api_key=self.api_key)
                self.client = genai.Client()
                logger.info("Initialized Gemini with API key")
                
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {str(e)}")
            raise
    
    async def _process_file(self, file: FileType) -> tuple[bytes, str]:
        """
        Process a file into base64 encoded bytes and determine MIME type
        
        Args:
            file: A file to process (path string, bytes, or UploadFile)
            
        Returns:
            Tuple of (base64 encoded bytes, mime_type)
        """
        mime_type = "application/octet-stream"  # Default MIME type
        
        try:
            # Process based on file type
            if isinstance(file, str):
                # File path as string
                file_path = Path(file)
                if not file_path.exists():
                    raise ValueError(f"File not found: {file}")
                
                with open(file_path, "rb") as f:
                    file_bytes = f.read()
                
                # Guess MIME type from extension
                if file_path.suffix.lower() == '.pdf':
                    mime_type = "application/pdf"
                elif file_path.suffix.lower() in ['.jpg', '.jpeg']:
                    mime_type = "image/jpeg"
                elif file_path.suffix.lower() == '.png':
                    mime_type = "image/png"
                
            elif isinstance(file, bytes):
                # Already bytes
                file_bytes = file
                
            elif isinstance(file, Path):
                # Path object
                if not file.exists():
                    raise ValueError(f"File not found: {file}")
                
                with open(file, "rb") as f:
                    file_bytes = f.read()
                
                # Guess MIME type from extension
                if file.suffix.lower() == '.pdf':
                    mime_type = "application/pdf"
                elif file.suffix.lower() in ['.jpg', '.jpeg']:
                    mime_type = "image/jpeg"
                elif file.suffix.lower() == '.png':
                    mime_type = "image/png"
                
            else:
                file_bytes = await file.read()
                mime_type = file.content_type or mime_type
            
            # Encode as base64
            base64_bytes = base64.b64encode(file_bytes)
            return base64_bytes, mime_type
            
        except Exception as e:
            logger.error(f"Error processing file: {str(e)}")
            raise
    
    def _load_schema(self, schema_type: SchemaType) -> Dict[str, Any]:
        """
        Load a schema from the schemas directory
        
        Args:
            schema_type: The schema type to load
            
        Returns:
            Dict containing the schema
        """
        schema_path = SchemaType.get_schema_path(schema_type)
        
        try:
            with open(schema_path, 'r') as f:
                schema = json.load(f)
            return schema
        except Exception as e:
            logger.error(f"Error loading schema {schema_type}: {str(e)}")
            raise ValueError(f"Failed to load schema {schema_type}: {str(e)}")
    
    async def process_document(
        self, 
        file: FileType,
        schema_type: SchemaType,
        model: GenAiModel = "gemini-2.5-pro-preview-03-25",
        temperature: float = 0.2,
        max_output_tokens: int = 65535,
    ) -> Dict[str, Any]:
        """
        Process a document with Gemini using a specific schema
        
        Args:
            file: The file to process
            schema_type: The schema to use for structuring the response
            model: Which Gemini model to use
            temperature: Controls randomness of output (0.0-1.0)
            max_output_tokens: Maximum number of tokens in the response
            
        Returns:
            Dictionary containing the structured response
        """
        try:
            # Process file to base64
            base64_bytes, mime_type = await self._process_file(file)
            
            # Load the schema
            schema = self._load_schema(schema_type)
            
            # Create file part
            file_part = types.Part.from_bytes(
                data=base64.b64decode(base64_bytes),
                mime_type=mime_type,
            )
            
            # Create instruction part based on schema type
            instructions = f"Extract information from this document according to the provided schema."
            instruction_part = types.Part.from_text(text=instructions)
            
            # Create content
            contents = [
                types.Content(
                    role="user",
                    parts=[file_part, instruction_part]
                )
            ]
            
            # Configure generation
            generate_content_config = types.GenerateContentConfig(
                temperature=temperature,
                top_p=0.95,
                max_output_tokens=max_output_tokens,
                response_mime_type="application/json",
                response_schema=schema,
            )
            
            # Process with Gemini
            logger.info(f"Processing document with schema: {schema_type}")
            response = self.client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            
            # Parse response
            try:
                result = json.loads(response.text)
                return result
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON response: {response.text[:500]}...")
                return {"raw_response": response.text}
                
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            raise
    
    async def extract_policyholder_info(self, file: FileType) -> Dict[str, Any]:
        """
        Extract policyholder information from a document
        
        Args:
            file: The document containing policyholder information
            
        Returns:
            Extracted policyholder information in structured format
        """
        return await self.process_document(
            file=file,
            schema_type=SchemaType.POLICYHOLDER_EXTRACT,
            temperature=0.2,
        )
    
    async def analyze_claim(self, file: FileType) -> Dict[str, Any]:
        """
        Analyze an insurance claim document
        
        Args:
            file: The claim document to analyze
            
        Returns:
            Structured analysis of the claim
        """
        return await self.process_document(
            file=file,
            schema_type=SchemaType.POLICYHOLDER_CLAIM,
            temperature=0.2,
        )
    
    async def extract_claim_info(self, file: FileType) -> Dict[str, Any]:
        """
        Extract claim information from a document
        
        Args:
            file: The document containing claim information
            
        Returns:
            Extracted claim information in structured format
        """
        return await self.process_document(
            file=file,
            schema_type=SchemaType.CLAIM_EXTRACT,
            temperature=0.2,
        )
    
    async def generate_text(
        self, 
        prompt: str, 
        model: GenAiModel = "gemini-2.5-pro-preview-03-25",
        temperature: float = 0.7,
        max_output_tokens: int = 8192,
    ) -> str:
        """
        Generate text using Gemini model
        
        Args:
            prompt: The text prompt to send to Gemini
            model: Which Gemini model to use
            temperature: Controls randomness of output (0.0-1.0)
            max_output_tokens: Maximum number of tokens in the response
            
        Returns:
            Generated text response
        """
        try:
            logger.debug(f"Sending prompt to Gemini: {prompt[:100]}...")
            
            # Create content
            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part(text=prompt)]
                )
            ]
            
            # Configure generation
            generate_content_config = types.GenerateContentConfig(
                temperature=temperature,
                top_p=0.95,
                max_output_tokens=max_output_tokens,
            )
            
            # Process with Gemini
            response = self.client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            
            logger.debug(f"Received response from Gemini: {response.text[:100]}...")
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating text with Gemini: {str(e)}")
            raise
    
    async def analyze_attachment_type(self, file_name: str, file_content: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze the type and purpose of an attachment
        
        Args:
            file_name: Name of the attachment file
            file_content: Optional content of the file (if text)
            
        Returns:
            Dictionary with analysis results
        """
        prompt = f"""
        Analyze this file attachment and determine:
        1. What type of document this likely is (invoice, policy document, claim form, etc.)
        2. What is the most likely department this should be routed to
        3. Estimated priority level (high, medium, low)
        
        File name: {file_name}
        """
        
        if file_content:
            prompt += f"\n\nFile content preview:\n{file_content[:1000]}..."
        
        analysis_prompt = prompt + """
        
        Return the results in a structured JSON object with these keys:
        {
            "document_type": string,
            "department": string,
            "priority": string,
            "confidence": number (0.0-1.0),
            "notes": string with any additional observations
        }
        """
        
        response_text = await self.generate_text(analysis_prompt, temperature=0.2)
        
        # Extract JSON response (if any)
        try:
            # Find JSON in the response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                return json.loads(json_str)
            else:
                logger.warning("No valid JSON found in Gemini response")
                return {
                    "document_type": "unknown",
                    "department": "general",
                    "priority": "medium",
                    "confidence": 0.5,
                    "notes": response_text.strip()
                }
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON from Gemini response")
            return {
                "document_type": "unknown",
                "department": "general",
                "priority": "medium",
                "confidence": 0.5,
                "notes": response_text.strip()
            }
            
    async def extract_email_data(self, email_content: str) -> Dict[str, Any]:
        """
        Extract structured data from email content using Gemini AI
        
        Args:
            email_content: The plain text content of the email
            
        Returns:
            Dictionary containing extracted information from the email
        """
        try:
            # Prepare prompt for Gemini
            prompt = f"""
            Analyze the following email content and extract key information related to an insurance claim.
            Please identify the following information if present:
            - Topic or subject matter
            - Claim type (e.g., auto, home, health)
            - Incident date
            - Incident location
            - Damage description
            - Contact information
            - Urgency level
            - Any specific requests
            
            Email content:
            ```
            {email_content}
            ```
            
            Return the information in JSON format with the following structure:
            {{"topic": "...", "claim_type": "...", "incident_date": "...", "incident_location": "...", "damage_description": "...", "contact_info": "...", "urgency": "...", "requests": "..."}}
            """
            
            # Call Gemini API
            response_text = await self.generate_text(prompt)
            
            # Extract JSON from the response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                return json.loads(json_str)
            else:
                logger.warning("No valid JSON found in Gemini response for email analysis")
                return {
                    "topic": "Unknown",
                    "claim_type": "general",
                    "urgency": "medium",
                    "notes": response_text.strip()
                }
        except Exception as e:
            logger.error(f"Error analyzing email content: {str(e)}")
            return {
                "topic": "Error analyzing email",
                "claim_type": "unknown",
                "urgency": "medium",
                "notes": "Failed to analyze email content"
            }