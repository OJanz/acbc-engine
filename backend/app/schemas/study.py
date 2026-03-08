import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.study import StudyStatus


class StudyBase(BaseModel):
    name: str
    description: str | None = None
    status: StudyStatus = StudyStatus.draft


class StudyCreate(StudyBase):
    pass


class StudyUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: StudyStatus | None = None
    n_screening_concepts: int | None = None
    n_choice_tasks: int | None = None
    concepts_per_choice_task: int | None = None


class StudyRead(StudyBase):
    id: uuid.UUID
    n_screening_concepts: int
    n_choice_tasks: int
    concepts_per_choice_task: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
