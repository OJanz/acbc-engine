import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import UUID, Enum as SQLEnum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, backref, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.participant import Participant
    from app.models.rule import ConceptRule


class StudyStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    closed = "closed"


class AttributeType(str, enum.Enum):
    text = "text"
    image = "image"
    mixed = "mixed"


class MediaType(str, enum.Enum):
    text = "text"
    image = "image"
    gif = "gif"


class Study(TimestampMixin, Base):
    __tablename__ = "studies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[StudyStatus] = mapped_column(
        SQLEnum(StudyStatus, name="studystatus"),
        default=StudyStatus.draft,
        nullable=False,
    )
    n_screening_concepts: Mapped[int] = mapped_column(Integer, default=12, nullable=False)
    n_choice_tasks: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    concepts_per_choice_task: Mapped[int] = mapped_column(Integer, default=3, nullable=False)

    # Relationships
    # backref adds User.studies dynamically without modifying user.py
    user: Mapped["User"] = relationship("User", backref=backref("studies", lazy="select"))
    attributes: Mapped[list["Attribute"]] = relationship(
        "Attribute", back_populates="study", cascade="all, delete-orphan"
    )
    participants: Mapped[list["Participant"]] = relationship(
        "Participant", back_populates="study"
    )
    rules: Mapped[list["ConceptRule"]] = relationship(
        "ConceptRule", cascade="all, delete-orphan"
    )


class Attribute(TimestampMixin, Base):
    __tablename__ = "attributes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    study_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("studies.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    type: Mapped[AttributeType] = mapped_column(
        SQLEnum(AttributeType, name="attributetype"),
        default=AttributeType.text,
        nullable=False,
    )

    # Relationships
    study: Mapped["Study"] = relationship("Study", back_populates="attributes")
    levels: Mapped[list["Level"]] = relationship(
        "Level", back_populates="attribute", cascade="all, delete-orphan"
    )


class Level(TimestampMixin, Base):
    __tablename__ = "levels"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    attribute_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("attributes.id", ondelete="CASCADE"),
        nullable=False,
    )
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    media_type: Mapped[MediaType | None] = mapped_column(
        SQLEnum(MediaType, name="mediatype"), nullable=True
    )
    media_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    # Relationships
    attribute: Mapped["Attribute"] = relationship("Attribute", back_populates="levels")
