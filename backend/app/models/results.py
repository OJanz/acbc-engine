import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import UUID, DateTime, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.participant import Participant
    from app.models.study import Level


class UtilityEstimate(TimestampMixin, Base):
    """HB-estimated part-worth utility for a participant/level combination.

    Populated in batch after data collection — not written during the survey.
    """

    __tablename__ = "utility_estimates"
    __table_args__ = (
        UniqueConstraint(
            "participant_id", "level_id", name="uq_utility_participant_level"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    participant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("participants.id", ondelete="CASCADE"), nullable=False
    )
    level_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("levels.id", ondelete="RESTRICT"), nullable=False
    )
    utility: Mapped[float] = mapped_column(Float, nullable=False)
    estimated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    # Relationships
    participant: Mapped["Participant"] = relationship(
        "Participant", back_populates="utility_estimates"
    )
    level: Mapped["Level"] = relationship("Level")
