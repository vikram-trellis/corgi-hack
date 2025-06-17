import ssl
from asyncio import current_task
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Callable, Annotated

import os
from dotenv import load_dotenv
from fastapi import Depends
from sqlalchemy.ext.asyncio import (
    async_scoped_session,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool
from sqlmodel.ext.asyncio.session import AsyncSession

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Convert to async URL if needed
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
else:
    ASYNC_DATABASE_URL = DATABASE_URL

class DatabaseManager:
    def __init__(
        self,
        async_db_url: str,
        ssl_cert_path: str = "/etc/ssl/certs/ca-certificates.crt",
    ):
        try:
            self.ssl_context = ssl.create_default_context(cafile=ssl_cert_path)
            ssl_args = {"ssl": self.ssl_context}
        except:
            # If SSL context fails, try without SSL
            ssl_args = {}

        self.async_engine = create_async_engine(
            async_db_url,
            future=True,
            poolclass=NullPool,
            pool_pre_ping=True,
            echo=False,
            connect_args=ssl_args,
        )

        self.async_session_factory = async_sessionmaker(
            self.async_engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
        self.async_scoped_session = async_scoped_session(
            self.async_session_factory,
            scopefunc=current_task,
        )

    async def get_async_session(self) -> AsyncGenerator[AsyncSession, None]:
        async with self.async_scoped_session() as session:
            yield session

    @asynccontextmanager
    async def get_async_session_temp(self) -> AsyncGenerator[AsyncSession, None]:
        async_session_ = self.async_scoped_session()
        try:
            yield async_session_
        finally:
            await async_session_.close()


db_manager = DatabaseManager(
    async_db_url=ASYNC_DATABASE_URL,
)

get_async_session = db_manager.get_async_session
get_async_session_temp = db_manager.get_async_session_temp