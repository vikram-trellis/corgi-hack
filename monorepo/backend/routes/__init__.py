from fastapi import APIRouter

from .policyholders import router as policyholders_router
from .health import router as health_router
from .webhooks import router as webhooks_router
from .autoupload_email import router as autoupload_email_router
from .ai import router as ai_router
from .claims import router as claims_router
from .inbox import router as inbox_router
from .documents import router as documents_router

api_router = APIRouter(prefix="/api")

# Include all route modules
api_router.include_router(policyholders_router)
api_router.include_router(health_router)
api_router.include_router(webhooks_router)
api_router.include_router(autoupload_email_router)
api_router.include_router(ai_router)
api_router.include_router(claims_router)
api_router.include_router(inbox_router)
api_router.include_router(documents_router)

__all__ = ["api_router"]