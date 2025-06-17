# Re-export all schemas for backward compatibility
from .policyholders import PolicyHolderBase, PolicyHolderCreate, PolicyHolderRead, PolicyHolderUpdate
from .webhooks import AttachmentInfo, MailgunWebhook, WebhookResponse
from .autoupload_email import (
    AutouploadEmailBase,
    AutouploadEmailCreate,
    AutouploadEmailRead,
    AutouploadEmailRowData,
    DeleteAutouploadEmailResponse,
    GetAutouploadEmailRowResponse,
    GetAutouploadEmailRowsResponse,
    UpsertAutouploadEmailResponse,
)
from .ai import (
    DocumentAnalysisRequest,
    DocumentAnalysisResponse,
    TextGenerationRequest,
    TextGenerationResponse,
)
from .claims import (
    ClaimBase,
    ClaimCreate,
    ClaimRead,
    ClaimUpdate,
    ClaimResponse,
    ClaimListResponse,
    ClaimDetailResponse,
)

__all__ = [
    # Policyholder schemas
    "PolicyHolderBase",
    "PolicyHolderCreate", 
    "PolicyHolderRead", 
    "PolicyHolderUpdate",
    
    # Webhook schemas
    "AttachmentInfo",
    "MailgunWebhook",
    "WebhookResponse",
    
    # Autoupload email schemas
    "AutouploadEmailBase",
    "AutouploadEmailCreate",
    "AutouploadEmailRead",
    "AutouploadEmailRowData",
    "DeleteAutouploadEmailResponse",
    "GetAutouploadEmailRowResponse",
    "GetAutouploadEmailRowsResponse",
    "UpsertAutouploadEmailResponse",
    
    # AI schemas
    "DocumentAnalysisRequest",
    "DocumentAnalysisResponse",
    "TextGenerationRequest",
    "TextGenerationResponse",
    
    # Claim schemas
    "ClaimBase",
    "ClaimCreate",
    "ClaimRead",
    "ClaimUpdate",
    "ClaimResponse",
    "ClaimListResponse",
    "ClaimDetailResponse",
]