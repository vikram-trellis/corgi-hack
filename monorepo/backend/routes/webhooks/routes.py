from fastapi import APIRouter, Depends, Query, HTTPException, status
from starlette.requests import Request
import logging
import os
from dotenv import load_dotenv
from datetime import date, datetime

from schemas.webhooks import MailgunWebhook, WebhookResponse
from schemas.inbox.schemas import InboxCreate
from schemas.documents.schemas import DocumentCreate
from services import GeminiService
from services.supabase import SupabaseService
from repositories.inbox import InboxRepository
from repositories.document import DocumentRepository

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
    supabase_service: SupabaseService = Depends(lambda: SupabaseService()),
    inbox_repo: InboxRepository = Depends(),
    document_repo: DocumentRepository = Depends(),
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
        supabase_urls = []
        
        # Create inbox item with dummy data
        inbox_data = InboxCreate(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1980, 1, 1),
            event_type="collision",
            event_date=date.today(),
            event_location="123 Main St, Anytown, USA",
            damage_description="Vehicle was involved in a minor fender-bender while parked.",
            contact_email=mailgun_data.sender,
            photos=[],  # Will be updated with Supabase URLs
            raw_email_content=mailgun_data.body_plain,
            email_subject=mailgun_data.subject,
            email_sender=mailgun_data.sender,
            claim_metadata={
                "source": "mailgun_webhook",
                "received_at": datetime.utcnow().isoformat(),
                "recipient": mailgun_data.recipient
            }
        )
        
        # Create the inbox item
        inbox_item = await inbox_repo.create_inbox_item(inbox_data.dict())
        logger.info(f"Created inbox item with ID: {inbox_item.id}")
        
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
                
                # Upload file to Supabase
                try:
                    supabase_url = await supabase_service.upload_file_from_url(
                        authenticated_url, 
                        f"{inbox_item.id}_{attachment_name}"
                    )
                    
                    if supabase_url:
                        supabase_urls.append(supabase_url)
                        logger.info(f"Uploaded to Supabase: {supabase_url}")
                        
                        # Create document entry
                        document_data = DocumentCreate(
                            file_name=attachment_name,
                            file_type=attachment.content_type,
                            file_url=supabase_url,
                            inbox_id=inbox_item.id
                        )
                        
                        document = await document_repo.create_document(document_data)
                        logger.info(f"Created document entry with ID: {document.id}")
                except Exception as e:
                    logger.error(f"Error uploading file to Supabase: {str(e)}")


                # Use Gemini to analyze the attachment type based on filename
                try:
                    analysis = await gemini_service.analyze_attachment_type(attachment_name)
                    attachment_analysis.append({
                        "filename": attachment_name,
                        "url": authenticated_url,
                        "supabase_url": supabase_url if 'supabase_url' in locals() else None,
                        "content_type": attachment.content_type,
                        "size": attachment.size,
                        "analysis": analysis
                    })
                    logger.info(f"Analyzed attachment: {attachment_name} - Type: {analysis.get('document_type', 'unknown')}")
                except Exception as e:
                    logger.error(f"Error analyzing attachment {attachment_name}: {str(e)}")
            
            # Update inbox item with photo URLs if any were uploaded
            if supabase_urls:
                await inbox_repo.update(inbox_item.id, {"photos": supabase_urls})
        
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
                "inbox_item": {
                    "id": inbox_item.id,
                    "claim_id": inbox_item.claim_id
                },
                "attachments": [
                    {
                        "name": name,
                        "url": url,
                        "supabase_url": supabase_url if idx < len(supabase_urls) else None
                    } for idx, (name, url, supabase_url) in enumerate(zip(attachment_names, attachment_urls, supabase_urls + [None] * (len(attachment_names) - len(supabase_urls))))
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