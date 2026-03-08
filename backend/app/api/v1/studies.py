import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_active_user
from app.db.session import get_db
from app.models.study import Study
from app.models.user import User
from app.schemas.study import StudyCreate, StudyRead, StudyUpdate

router = APIRouter()


@router.get("/", response_model=list[StudyRead])
async def list_studies(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    result = await db.execute(select(Study).where(Study.user_id == user.id))
    return result.scalars().all()


@router.post("/", response_model=StudyRead, status_code=status.HTTP_201_CREATED)
async def create_study(
    data: StudyCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    study = Study(user_id=user.id, **data.model_dump())
    db.add(study)
    await db.commit()
    await db.refresh(study)
    return study


@router.get("/{study_id}", response_model=StudyRead)
async def get_study(
    study_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    result = await db.execute(
        select(Study).where(Study.id == study_id, Study.user_id == user.id)
    )
    study = result.scalar_one_or_none()
    if not study:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found")
    return study


@router.patch("/{study_id}", response_model=StudyRead)
async def update_study(
    study_id: uuid.UUID,
    data: StudyUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    result = await db.execute(
        select(Study).where(Study.id == study_id, Study.user_id == user.id)
    )
    study = result.scalar_one_or_none()
    if not study:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(study, field, value)

    await db.commit()
    await db.refresh(study)
    return study
