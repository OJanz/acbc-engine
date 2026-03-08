import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, Text, UniqueConstraint, UUID, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.study import Level


class ConditionRole(str, enum.Enum):
    if_ = "if"
    then = "then"


class ConceptRule(TimestampMixin, Base):
    __tablename__ = "concept_rules"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    study_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("studies.id", ondelete="CASCADE"),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    conditions: Mapped[list["ConceptRuleCondition"]] = relationship(
        "ConceptRuleCondition", back_populates="rule", cascade="all, delete-orphan"
    )


class ConceptRuleCondition(Base):
    __tablename__ = "concept_rule_conditions"
    __table_args__ = (UniqueConstraint("rule_id", "level_id", "role"),)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    rule_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("concept_rules.id", ondelete="CASCADE"),
        nullable=False,
    )
    role: Mapped[ConditionRole] = mapped_column(
        SQLEnum(ConditionRole, name="conditionrole", values_callable=lambda e: [m.value for m in e]),
        nullable=False,
    )
    level_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("levels.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    rule: Mapped["ConceptRule"] = relationship("ConceptRule", back_populates="conditions")
    level: Mapped["Level"] = relationship("Level")
