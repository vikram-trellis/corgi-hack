import os
import logging
from typing import Optional, Dict, Any
from dotenv import load_dotenv
import base64
import httpx
import asyncio
import json

# Load environment variables
load_dotenv()

# Get Supabase credentials from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "corgi-hacks")

logger = logging.getLogger(__name__)

class SupabaseService:
    """Service for interacting with Supabase Storage"""
    
    def __init__(self):
        """Initialize the Supabase service with credentials"""
        if not SUPABASE_URL or not SUPABASE_KEY:
            logger.warning("Supabase credentials not found in environment variables")
        
        self.base_url = SUPABASE_URL
        self.api_key = SUPABASE_KEY
        self.bucket = SUPABASE_BUCKET
        
        logger.info(f"Supabase service initialized for bucket: {self.bucket}")
    
    async def upload_file_from_url(self, file_url: str, file_name: str) -> Optional[str]:
        """
        Download a file from a URL and upload it to Supabase Storage
        
        Args:
            file_url: URL of the file to download
            file_name: Name to give the file in Supabase
            
        Returns:
            Public URL of the uploaded file, or None if upload failed
        """
        if not self.base_url or not self.api_key:
            logger.error("Supabase credentials not configured")
            return None
        
        try:
            # Download the file from the URL
            async with httpx.AsyncClient() as client:
                response = await client.get(file_url)
                response.raise_for_status()
                file_content = response.content
            
            # Upload to Supabase
            return await self.upload_file_content(file_content, file_name)
        
        except Exception as e:
            logger.error(f"Error uploading file from URL {file_url}: {str(e)}")
            return None
    
    async def upload_file_content(self, file_content: bytes, file_name: str) -> Optional[str]:
        """
        Upload file content to Supabase Storage using direct HTTP API

        Args:
            file_content: Binary content of the file
            file_name: Name to give the file in Supabase

        Returns:
            Public URL of the uploaded file, or None if upload failed
        """
        if not self.base_url or not self.api_key:
            logger.error("Supabase credentials not configured")
            return None

        try:
            # Sanitize file name to avoid directory traversal issues
            safe_file_name = os.path.basename(file_name)
            
            # Create storage endpoint URL for upload
            upload_url = f"{self.base_url}/storage/v1/object/{self.bucket}/{safe_file_name}"
            
            # Set up headers for authentication and content type
            headers = {
                "apikey": self.api_key,
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/octet-stream",
                "x-upsert": "true"  # Enable upsert (overwrite if exists)
            }
            
            # Upload file to Supabase using PUT request
            async with httpx.AsyncClient() as client:
                response = await client.put(
                    upload_url,
                    content=file_content,
                    headers=headers
                )
                response.raise_for_status()
            
            # Construct the public URL for the file
            public_url = f"{self.base_url}/storage/v1/object/public/{self.bucket}/{safe_file_name}"
            logger.info(f"File uploaded successfully: {public_url}")
            return public_url

        except Exception as e:
            logger.error(f"Error uploading file {file_name} to Supabase: {e}")
            return None
    
    async def get_file_public_url(self, file_path: str) -> str:
        """
        Get the public URL for a file in Supabase Storage
        
        Args:
            file_path: Path to the file in the bucket
            
        Returns:
            Public URL of the file
        """
        if not self.base_url:
            logger.error("Supabase URL not configured")
            return ""
            
        # Sanitize file path
        safe_file_path = os.path.basename(file_path)
        
        # Construct the public URL for the file
        return f"{self.base_url}/storage/v1/object/public/{self.bucket}/{safe_file_path}"
