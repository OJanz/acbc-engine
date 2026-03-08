import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import UUID, Enum as SQLEnum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.study import Study, Attribute, Level
    from app.models.survey import ScreeningConcept, MustHaveUnacceptable, ChoiceTask
    from app.models.results import UtilityEstimate


class SurveyPhase(str, enum.Enum):
    byo = "byo"
    screening = "screening"
    must_have = "must_have"
    choice = "choice"
    calibration = "calibration"
    complete = "complete"


class Participant(TimestampMixin, Base):
    __tablename__ = "participants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    study_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("studies.id", ondelete="RESTRICT"), nullable=False
    )
    token: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    current_phase: Mapped[SurveyPhase] = mapped_column(
        SQLEnum(SurveyPhase, name="surveyphase"),
        default=SurveyPhase.byo,
        nullable=False,
    )
    phase_position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    study: Mapped["Study"] = relationship("Study", back_populates="participants")
    byo_responses: Mapped[list["BYOResponse"]] = relationship(
        "BYOResponse", back_populates="participant", cascade="all, delete-orphan"
    )
    screening_concepts: Mapped[list["ScreeningConcept"]] = relationship(
        "ScreeningConcept", back_populates="participant", cascade="all, delete-orphan"
    )
    must_have_unacceptables: Mapped[list["MustHaveUnacceptable"]] = relationship(
        "MustHaveUnacceptable", back_populates="participant", cascade="all, delete-orphan"
    )
    choice_tasks: Mapped[list["ChoiceTask"]] = relationship(
        "ChoiceTask", back_populates="participant", cascade="all, delete-orphan"
    )
    utility_estimates: Mapped[list["UtilityEstimate"]] = relationship(
        "UtilityEstimate", back_populates="participant", cascade="all, delete-orphan"
    )


class BYOResponse(TimestampMixin, Base):
    __tablename__ = "byo_responses"
    __table_args__ = (
        UniqueConstraint("participant_id", "attribute_id", name="uq_byo_participant_attribute"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    participant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("participants.id", ondelete="CASCADE"), nullable=False
    )
    attribute_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("attributes.id", ondelete="RESTRICT"), nullable=False
    )
    level_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("levels.id", ondelete="RESTRICT"), nullable=False
    )

    # Relationships
    participant: Mapped["Participant"] = relationship("Participant", back_populates="byo_responses")
    attribute: Mapped["Attribute"] = relationship("Attribute")
    level: Mapped["Level"] = relationship("Level")
