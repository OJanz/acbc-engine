import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.study import AttributeType, MediaType


class LevelCreate(BaseModel):
    label: str
    order: int
    media_type: MediaType | None = None
    media_url: str | None = None


class LevelUpdate(BaseModel):
    label: str | None = None
    order: int | None = None
    media_type: MediaType | None = None
    media_url: str | None = None


class LevelRead(BaseModel):
    id: uuid.UUID
    attribute_id: uuid.UUID
    label: str
    order: int
    media_type: MediaType | None
    media_url: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AttributeCreate(BaseModel):
    name: str
    order: int
    type: AttributeType = AttributeType.text


class AttributeUpdate(BaseModel):
    name: str | None = None
    order: int | None = None
    type: AttributeType | None = None


class AttributeRead(BaseModel):
    id: uuid.UUID
    study_id: uuid.UUID
    name: str
    order: int
    type: AttributeType
    levels: list[LevelRead] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReorderAttributesRequest(BaseModel):
    attribute_ids: list[uuid.UUID]


class ReorderLevelsRequest(BaseModel):
    level_ids: list[uuid.UUID]
