from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel

class WebhookResponse(SQLModel):
    """Response schema for webhook endpoints"""
    success: bool
    message: str
    attachments_processed: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None