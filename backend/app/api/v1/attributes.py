import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import current_active_user
from app.db.session import get_db
from app.models.study import Attribute, Level, Study
from app.models.user import User
from app.schemas.attribute import (
    AttributeCreate,
    AttributeRead,
    AttributeUpdate,
    LevelCreate,
    LevelRead,
    LevelUpdate,
    ReorderAttributesRequest,
    ReorderLevelsRequest,
)

router = APIRouter()


async def _get_study_for_user(
    study_id: uuid.UUID, user: User, db: AsyncSession
) -> Study:
    result = await db.execute(
        select(Study).where(Study.id == study_id, Study.user_id == user.id)
    )
    study = result.scalar_one_or_none()
    if not study:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found")
    return study


async def _get_attribute(
    study_id: uuid.UUID, attribute_id: uuid.UUID, db: AsyncSession
) -> Attribute:
    result = await db.execute(
        select(Attribute)
        .where(Attribute.id == attribute_id, Attribute.study_id == study_id)
        .options(selectinload(Attribute.levels))
    )
    attribute = result.scalar_one_or_none()
    if not attribute:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attribute not found")
    return attribute


# --- Attribute endpoints ---

@router.get("/{study_id}/attributes", response_model=list[AttributeRead])
async def list_attributes(
    study_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    await _get_study_for_user(study_id, user, db)
    result = await db.execute(
        select(Attribute)
        .where(Attribute.study_id == study_id)
        .options(selectinload(Attribute.levels))
        .order_by(Attribute.order)
    )
    return result.scalars().all()


@router.post("/{study_id}/attributes", response_model=AttributeRead, status_code=status.HTTP_201_CREATED)
async def create_attribute(
    study_id: uuid.UUID,
    data: AttributeCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    await _get_study_for_user(study_id, user, db)
    attribute = Attribute(study_id=study_id, **data.model_dump())
    db.add(attribute)
    await db.commit()
    await db.refresh(attribute, ["levels"])
    return attribute


@router.patch("/{study_id}/attributes/{attribute_id}", response_model=AttributeRead)
async def update_attribute(
    study_id: uuid.UUID,
    attribute_id: uuid.UUID,
    data: AttributeUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    await _get_study_for_user(study_id, user, db)
    attribute = await _get_attribute(study_id, attribute_id, db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(attribute, field, value)
    await db.commit()
    await db.refresh(attribute, ["levels"])
    return attribute


@router.delete("/{study_id}/attributes/{attribute_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attribute(
    study_id: uuid.UUID,
    attribute_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    await _get_study_for_user(study_id, user, db)
    attribute = await _get_attribute(study_id, attribute_id, db)
    await db.delete(attribute)
    await db.commit()


@router.post("/{study_id}/attributes/reorder", status_code=status.HTTP_204_NO_CONTENT)
async def reorder_attributes(
    study_id: uuid.UUID,
    data: ReorderAttributesRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    await _get_study_for_user(study_id, user, db)
    for order, attribute_id in enumerate(data.attribute_ids):
        result = await db.execute(
            select(Attribute).where(
                Attribute.id == attribute_id, Attribute.study_id == study_id
            )
        )
        attribute = result.scalar_one_or_none()
        if attribute:
            attribute.order = order
    await db.commit()


# --- Level endpoints ---

async def _get_level(attribute_id: uuid.UUID, level_id: uuid.UUID, db: AsyncSession) -> Level:
    result = await db.execute(
        select(Level).where(Level.id == level_id, Level.attribute_id == attribute_id)
    )
    level = result.scalar_one_or_none()
    if not level:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level not found")
    return level


@router.post(
    "/{study_id}/attributes/{attribute_id}/levels",
    response_model=LevelRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_level(
    study_id: uuid.UUID,
    attribute_id: uuid.UUID,
    data: LevelCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    await _get_study_for_user(study_id, user, db)
    await _get_attribute(study_id, attribute_id, db)
    level = Level(attribute_id=attribute_id, **data.model_dump())
    db.add(level)
    await db.commit()
    await db.refresh(level)
    return level


@router.patch(
    "/{study_id}/attributes/{attribute_id}/levels/{level_id}",
    response_model=LevelRead,
)
async def update_level(
    study_id: uuid.UUID,
    attribute_id: uuid.UUID,
    level_id: uuid.UUID,
    data: LevelUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    await _get_study_for_user(study_id, user, db)
    await _get_attribute(study_id, attribute_id, db)
    level = await _get_level(attribute_id, level_id, db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(level, field, value)
    await db.commit()
    await db.refresh(level)
    return level


@router.delete(
    "/{study_id}/attributes/{attribute_id}/levels/{level_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_level(
    study_id: uuid.UUID,
    attribute_id: uuid.UUID,
    level_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    await _get_study_for_user(study_id, user, db)
    await _get_attribute(study_id, attribute_id, db)
    level = await _get_level(attribute_id, level_id, db)
    await db.delete(level)
    await db.commit()


@router.post(
    "/{study_id}/attributes/{attribute_id}/levels/reorder",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def reorder_levels(
    study_id: uuid.UUID,
    attribute_id: uuid.UUID,
    data: ReorderLevelsRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    await _get_study_for_user(study_id, user, db)
    await _get_attribute(study_id, attribute_id, db)
    for order, level_id in enumerate(data.level_ids):
        result = await db.execute(
            select(Level).where(Level.id == level_id, Level.attribute_id == attribute_id)
        )
        level = result.scalar_one_or_none()
        if level:
            level.order = order
    await db.commit()
