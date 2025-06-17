from fastapi import APIRouter
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
def health_check():
    """
    Simple health check endpoint to verify the API is running.
    """
    return {"status": "healthy"}

@router.get("/hello")
def hello():
    """
    Simple hello endpoint that logs a message.
    """
    logger.info("hello")
    return {"message": "Hello from FastAPI!"}