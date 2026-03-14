import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.participant import BYOResponse, Participant, SurveyPhase
from app.models.study import Attribute, Study, StudyStatus
from app.schemas.attribute import AttributeRead

router = APIRouter()


class SurveyEntryResponse(BaseModel):
    study_id: uuid.UUID
    study_name: str
    welcome_message: str | None
    byo_instruction_title: str | None
    byo_instruction_text: str | None


class StartResponse(BaseModel):
    participant_id: uuid.UUID


class ByoSubmission(BaseModel):
    selections: dict[str, str]  # attribute_id → level_id (UUID strings)


@router.get("/{study_id}", response_model=SurveyEntryResponse)
async def get_survey_entry(
    study_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Study).where(Study.id == study_id))
    study = result.scalar_one_or_none()

    if study is None or study.status != StudyStatus.active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found")

    return SurveyEntryResponse(
        study_id=study.id,
        study_name=study.name,
        welcome_message=study.welcome_message,
        byo_instruction_title=study.byo_instruction_title,
        byo_instruction_text=study.byo_instruction_text,
    )


@router.post("/{study_id}/start", response_model=StartResponse)
async def start_survey(
    study_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Study).where(Study.id == study_id))
    study = result.scalar_one_or_none()

    if study is None or study.status != StudyStatus.active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Study is not active")

    # TODO: optional email verification

    session_token = str(uuid.uuid4())
    participant = Participant(
        study_id=study.id,
        token=session_token,
        current_phase=SurveyPhase.byo,
    )
    db.add(participant)
    await db.commit()
    await db.refresh(participant)

    response = JSONResponse(content={"participant_id": str(participant.id)})
    response.set_cookie(
        key="survey_session",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=604800,
        path="/api/v1/survey",
    )
    return response


@router.get("/{study_id}/attributes", response_model=list[AttributeRead])
async def get_survey_attributes(
    study_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Study).where(Study.id == study_id))
    study = result.scalar_one_or_none()

    if study is None or study.status != StudyStatus.active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found")

    attrs_result = await db.execute(
        select(Attribute)
        .options(selectinload(Attribute.levels))
        .where(Attribute.study_id == study_id)
        .order_by(Attribute.order)
    )
    attributes = attrs_result.scalars().all()

    for attr in attributes:
        attr.levels.sort(key=lambda lv: lv.order)

    return attributes


@router.post("/{study_id}/byo", status_code=status.HTTP_204_NO_CONTENT)
async def submit_byo(
    study_id: uuid.UUID,
    body: ByoSubmission,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    token = request.cookies.get("survey_session")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No session")

    participant_result = await db.execute(
        select(Participant).where(
            Participant.token == token,
            Participant.study_id == study_id,
        )
    )
    participant = participant_result.scalar_one_or_none()
    if participant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found")

    attrs_result = await db.execute(
        select(Attribute).where(Attribute.study_id == study_id)
    )
    attributes = attrs_result.scalars().all()
    attr_ids = {str(a.id) for a in attributes}

    if attr_ids != set(body.selections.keys()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide exactly one level per attribute",
        )

    await db.execute(
        delete(BYOResponse).where(BYOResponse.participant_id == participant.id)
    )

    for attr_id, level_id in body.selections.items():
        db.add(BYOResponse(
            participant_id=participant.id,
            attribute_id=uuid.UUID(attr_id),
            level_id=uuid.UUID(level_id),
        ))

    participant.current_phase = SurveyPhase.screening
    await db.commit()
