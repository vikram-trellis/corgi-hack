from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
import asyncio
from dotenv import load_dotenv
from sqlmodel import SQLModel
import os

# Local imports
from routes import api_router
from database import db_manager

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Corgi Hack API",
    description="API for the Corgi Hack monorepo project",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routes
app.include_router(api_router)

@app.on_event("startup")
async def on_startup():
    """
    Initialize database tables and perform startup tasks.
    """
    # Create tables
    async with db_manager.async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    
    logger.info("Database tables created")

@app.on_event("shutdown")
async def on_shutdown():
    """
    Clean up resources on application shutdown.
    """
    logger.info("Shutting down application")

# Root endpoint that redirects to docs
@app.get("/")
async def root():
    """
    Root endpoint that provides basic API information.
    """
    return {
        "message": "Welcome to the Corgi Hack API",
        "docs": "/docs",
        "version": "0.1.0",
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)