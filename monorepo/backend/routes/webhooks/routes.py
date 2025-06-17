from fastapi import APIRouter, Depends, Query, HTTPException, status
from starlette.requests import Request
import logging
import os
from dotenv import load_dotenv

from schemas.webhooks import MailgunWebhook, WebhookResponse
from services import GeminiService

# Get environment variables
load_dotenv()
MAILGUN_AUTH_TOKEN = os.getenv("MAILGUN_BASIC_AUTH_TOKEN", "default_token_for_dev")
MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY", "")

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/mailgun", response_model=WebhookResponse)
async def mailgun_webhook(
    request: Request,
    auth_token: str = Query(..., description="Authentication token for Mailgun webhooks"),
    gemini_service: GeminiService = Depends(lambda: GeminiService()),
):
    """
    Webhook endpoint for receiving email data from Mailgun.
    Logs attachment filenames and URLs, and uses Gemini to analyze email content.
    
    Parameters:
    - request: The request containing form data
    - auth_token: Authentication token for verifying webhook source
    - gemini_service: Service for AI-powered analysis
    
    Returns:
    - WebhookResponse object with success status and message
    """
    # Verify auth token
    if auth_token != MAILGUN_AUTH_TOKEN:
        logger.warning(f"Invalid auth token used: {auth_token}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    
    try:
        # Parse form data
        form = await request.form()
        mailgun_data = MailgunWebhook(**form)
        
        # Log information about the email
        logger.info(f"Received email from {mailgun_data.sender} to {mailgun_data.recipient}")
        logger.info(f"Subject: {mailgun_data.subject}")
        
        # Extract and log attachment filenames and URLs
        attachment_names = []
        attachment_urls = []
        attachment_analysis = []
        
        if mailgun_data.attachments:
            for attachment in mailgun_data.attachments:
                attachment_name = attachment.name
                attachment_url = str(attachment.url)
                
                # Add authentication to URL if MAILGUN_API_KEY is available
                authenticated_url = attachment_url
                if MAILGUN_API_KEY and attachment_url.startswith('https://'):
                    authenticated_url = attachment_url.replace(
                        "https://",
                        f"https://api:{MAILGUN_API_KEY}@",
                    )
                
                attachment_names.append(attachment_name)
                attachment_urls.append(authenticated_url)
                
                # Log attachment details
                logger.info(f"Attachment: {attachment_name} ({attachment.content_type}, {attachment.size} bytes)")
                logger.info(f"Attachment URL: {authenticated_url}")
                
                # Use Gemini to analyze the attachment type based on filename
                try:
                    analysis = await gemini_service.analyze_attachment_type(attachment_name)
                    attachment_analysis.append({
                        "filename": attachment_name,
                        "url": authenticated_url,
                        "content_type": attachment.content_type,
                        "size": attachment.size,
                        "analysis": analysis
                    })
                    logger.info(f"Analyzed attachment: {attachment_name} - Type: {analysis.get('document_type', 'unknown')}")
                except Exception as e:
                    logger.error(f"Error analyzing attachment {attachment_name}: {str(e)}")
        
        # If there's email body content, analyze it with Gemini
        email_analysis = None
        if mailgun_data.body_plain:
            try:
                email_analysis = await gemini_service.extract_email_data(mailgun_data.body_plain)
                logger.info(f"Analyzed email content. Topic: {email_analysis.get('topic', 'unknown')}")
            except Exception as e:
                logger.error(f"Error analyzing email content: {str(e)}")
        
        return WebhookResponse(
            success=True,
            message="Webhook received and processed successfully",
            attachments_processed=attachment_names,
            metadata={
                "email": {
                    "sender": mailgun_data.sender,
                    "recipient": mailgun_data.recipient,
                    "subject": mailgun_data.subject,
                    "timestamp": mailgun_data.timestamp,
                },
                "attachments": [
                    {
                        "name": name,
                        "url": url
                    } for name, url in zip(attachment_names, attachment_urls)
                ],
                "email_analysis": email_analysis,
                "attachment_analysis": attachment_analysis
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process webhook: {str(e)}"
        )