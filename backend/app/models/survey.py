import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import (
    UUID,
    Boolean,
    CheckConstraint,
    Enum as SQLEnum,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.participant import Participant
    from app.models.study import Level


class Designation(str, enum.Enum):
    must_have = "must_have"
    unacceptable = "unacceptable"


class ScreeningConcept(TimestampMixin, Base):
    __tablename__ = "screening_concepts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    participant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("participants.id", ondelete="CASCADE"), nullable=False
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    accepted: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    # Relationships
    participant: Mapped["Participant"] = relationship(
        "Participant", back_populates="screening_concepts"
    )
    concept_levels: Mapped[list["ConceptLevel"]] = relationship(
        "ConceptLevel",
        primaryjoin="ConceptLevel.screening_concept_id == ScreeningConcept.id",
        back_populates="screening_concept",
        cascade="all, delete-orphan",
    )


class MustHaveUnacceptable(TimestampMixin, Base):
    __tablename__ = "must_have_unacceptables"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    participant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("participants.id", ondelete="CASCADE"), nullable=False
    )
    level_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("levels.id", ondelete="RESTRICT"), nullable=False
    )
    designation: Mapped[Designation] = mapped_column(
        SQLEnum(Designation, name="designation"), nullable=False
    )

    # Relationships
    participant: Mapped["Participant"] = relationship(
        "Participant", back_populates="must_have_unacceptables"
    )
    level: Mapped["Level"] = relationship("Level")


class ChoiceTask(TimestampMixin, Base):
    __tablename__ = "choice_tasks"
    __table_args__ = (
        ForeignKeyConstraint(
            ["chosen_concept_id"],
            ["choice_task_concepts.id"],
            use_alter=True,
            name="fk_choice_tasks_chosen_concept",
            ondelete="SET NULL",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    participant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("participants.id", ondelete="CASCADE"), nullable=False
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    chosen_concept_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )

    # Relationships
    participant: Mapped["Participant"] = relationship(
        "Participant", back_populates="choice_tasks"
    )
    concepts: Mapped[list["ChoiceTaskConcept"]] = relationship(
        "ChoiceTaskConcept",
        primaryjoin="ChoiceTaskConcept.choice_task_id == ChoiceTask.id",
        back_populates="choice_task",
        cascade="all, delete-orphan",
        foreign_keys="ChoiceTaskConcept.choice_task_id",
    )
    chosen_concept: Mapped["ChoiceTaskConcept | None"] = relationship(
        "ChoiceTaskConcept",
        primaryjoin="ChoiceTask.chosen_concept_id == ChoiceTaskConcept.id",
        foreign_keys="ChoiceTask.chosen_concept_id",
        post_update=True,
    )


class ChoiceTaskConcept(TimestampMixin, Base):
    __tablename__ = "choice_task_concepts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    choice_task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("choice_tasks.id", ondelete="CASCADE"),
        nullable=False,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    choice_task: Mapped["ChoiceTask"] = relationship(
        "ChoiceTask",
        primaryjoin="ChoiceTaskConcept.choice_task_id == ChoiceTask.id",
        back_populates="concepts",
        foreign_keys=[choice_task_id],
    )
    concept_levels: Mapped[list["ConceptLevel"]] = relationship(
        "ConceptLevel",
        primaryjoin="ConceptLevel.choice_task_concept_id == ChoiceTaskConcept.id",
        back_populates="choice_task_concept",
        cascade="all, delete-orphan",
    )


class ConceptLevel(TimestampMixin, Base):
    """Shared junction table linking either a ScreeningConcept or a ChoiceTaskConcept to a Level.

    Exactly one of screening_concept_id / choice_task_concept_id must be non-null.
    """

    __tablename__ = "concept_levels"
    __table_args__ = (
        CheckConstraint(
            "(screening_concept_id IS NOT NULL)::int + "
            "(choice_task_concept_id IS NOT NULL)::int = 1",
            name="ck_concept_levels_exactly_one_parent",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    level_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("levels.id", ondelete="RESTRICT"), nullable=False
    )
    screening_concept_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("screening_concepts.id", ondelete="CASCADE"),
        nullable=True,
    )
    choice_task_concept_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("choice_task_concepts.id", ondelete="CASCADE"),
        nullable=True,
    )

    # Relationships
    level: Mapped["Level"] = relationship("Level")
    screening_concept: Mapped["ScreeningConcept | None"] = relationship(
        "ScreeningConcept",
        primaryjoin="ConceptLevel.screening_concept_id == ScreeningConcept.id",
        back_populates="concept_levels",
        foreign_keys=[screening_concept_id],
    )
    choice_task_concept: Mapped["ChoiceTaskConcept | None"] = relationship(
        "ChoiceTaskConcept",
        primaryjoin="ConceptLevel.choice_task_concept_id == ChoiceTaskConcept.id",
        back_populates="concept_levels",
        foreign_keys=[choice_task_concept_id],
    )
