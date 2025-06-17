from typing import Generic, TypeVar, Type, List, Optional, Dict, Any, Union
from sqlmodel import SQLModel, select, update
from sqlmodel.ext.asyncio.session import AsyncSession
from database import AsyncSessionDep

T = TypeVar('T', bound=SQLModel)

class BaseRepository(Generic[T]):
    def __init__(self, session: AsyncSession, model: Type[T]):
        self.session = session
        self.model = model

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        statement = select(self.model).offset(skip).limit(limit)
        result = await self.session.exec(statement)
        return result.all()

    async def get_by_id(self, id: Any) -> Optional[T]:
        statement = select(self.model).where(self.model.id == id)
        result = await self.session.exec(statement)
        return result.first()

    async def get_by_field(self, field_name: str, value: Any) -> Optional[T]:
        statement = select(self.model).where(getattr(self.model, field_name) == value)
        result = await self.session.exec(statement)
        return result.first()

    async def get_by_fields(self, filters: Dict[str, Any]) -> List[T]:
        statement = select(self.model)
        for field, value in filters.items():
            statement = statement.where(getattr(self.model, field) == value)
        result = await self.session.exec(statement)
        return result.all()

    async def create(self, data: Union[Dict[str, Any], SQLModel]) -> T:
        if isinstance(data, dict):
            db_obj = self.model(**data)
        else:
            db_obj = self.model(**data.model_dump())
            
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def update(self, id: Any, data: Union[Dict[str, Any], SQLModel]) -> Optional[T]:
        if isinstance(data, SQLModel):
            update_data = data.model_dump(exclude_unset=True)
        else:
            update_data = data

        db_obj = await self.get_by_id(id)
        if not db_obj:
            return None

        for key, value in update_data.items():
            if hasattr(db_obj, key):
                setattr(db_obj, key, value)

        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def delete(self, id: Any) -> bool:
        db_obj = await self.get_by_id(id)
        if not db_obj:
            return False

        await self.session.delete(db_obj)
        await self.session.commit()
        return True