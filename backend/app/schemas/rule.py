import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, model_validator


class ConditionIn(BaseModel):
    role: Literal["if", "then"]
    level_id: uuid.UUID


class RuleIn(BaseModel):
    description: str | None = None
    conditions: list[ConditionIn]

    @model_validator(mode="after")
    def validate_conditions(self) -> "RuleIn":
        roles = [c.role for c in self.conditions]
        if "if" not in roles:
            raise ValueError("Mindestens eine 'if'-Bedingung erforderlich")
        if "then" not in roles:
            raise ValueError("Mindestens eine 'then'-Bedingung erforderlich")
        return self


class ConditionOut(BaseModel):
    id: uuid.UUID
    role: str
    level_id: uuid.UUID
    level_label: str
    attribute_id: uuid.UUID
    attribute_name: str

    model_config = ConfigDict(from_attributes=True)


class RuleOut(BaseModel):
    id: uuid.UUID
    study_id: uuid.UUID
    description: str | None
    conditions: list[ConditionOut]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
