from sqlmodel import Field, SQLModel, Column
from sqlalchemy import DateTime, text
from datetime import datetime, timezone

class TimestampModel(SQLModel):
    """Base model with timestamp functionality for created_at and updated_at fields"""
    
    def __init__(self):
        super().__init__()

    def set_datetime(self) -> Field:
        """Creates a Field for timestamps with default and server_default"""
        return Field(
            default_factory=lambda: datetime.now(timezone.utc),
            sa_column=Column(
                DateTime(timezone=True),
                server_default=text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
        )