import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import current_active_user
from app.db.session import get_db
from app.models.rule import ConceptRule, ConceptRuleCondition, ConditionRole
from app.models.study import Attribute, Level, Study
from app.models.user import User
from app.schemas.rule import ConditionOut, RuleIn, RuleOut

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


async def _get_rule(study_id: uuid.UUID, rule_id: uuid.UUID, db: AsyncSession) -> ConceptRule:
    result = await db.execute(
        select(ConceptRule)
        .where(ConceptRule.id == rule_id, ConceptRule.study_id == study_id)
        .options(
            selectinload(ConceptRule.conditions).selectinload(
                ConceptRuleCondition.level
            ).selectinload(Level.attribute)
        )
    )
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    return rule


def _build_condition_out(cond: ConceptRuleCondition) -> ConditionOut:
    return ConditionOut(
        id=cond.id,
        role=cond.role.value,
        level_id=cond.level_id,
        level_label=cond.level.label,
        attribute_id=cond.level.attribute.id,
        attribute_name=cond.level.attribute.name,
    )


def _build_rule_out(rule: ConceptRule) -> RuleOut:
    return RuleOut(
        id=rule.id,
        study_id=rule.study_id,
        description=rule.description,
        conditions=[_build_condition_out(c) for c in rule.conditions],
        created_at=rule.created_at,
        updated_at=rule.updated_at,
    )


async def _validate_and_build_conditions(
    study_id: uuid.UUID,
    conditions_in: list,
    db: AsyncSession,
) -> list[ConceptRuleCondition]:
    """
    Validates that:
    - All level_ids belong to the given study
    - IF-group: no two levels share the same attribute
    - THEN-group: no level shares an attribute with any IF-level
    - THEN-group: multiple levels may share the same attribute (e.g. two price levels)
    Returns new ConceptRuleCondition instances (unsaved).
    """
    level_ids = [c.level_id for c in conditions_in]
    result = await db.execute(
        select(Level)
        .where(Level.id.in_(level_ids))
        .options(selectinload(Level.attribute))
    )
    levels_map: dict[uuid.UUID, Level] = {lvl.id: lvl for lvl in result.scalars().all()}

    # Step 1: verify ownership for all levels
    for cond_in in conditions_in:
        level = levels_map.get(cond_in.level_id)
        if not level:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Level {cond_in.level_id} nicht gefunden",
            )
        if level.attribute.study_id != study_id:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Level {cond_in.level_id} gehört nicht zu dieser Studie",
            )

    # Step 2: IF-group — no duplicate attributes
    if_attr_ids: set[uuid.UUID] = set()
    for cond_in in conditions_in:
        if cond_in.role != "if":
            continue
        attr_id = levels_map[cond_in.level_id].attribute.id
        if attr_id in if_attr_ids:
            name = levels_map[cond_in.level_id].attribute.name
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Attribut '{name}' darf im WENN-Block nur einmal vorkommen",
            )
        if_attr_ids.add(attr_id)

    # Step 3: THEN-group — must not share an attribute with any IF-level
    for cond_in in conditions_in:
        if cond_in.role != "then":
            continue
        attr_id = levels_map[cond_in.level_id].attribute.id
        if attr_id in if_attr_ids:
            name = levels_map[cond_in.level_id].attribute.name
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Attribut '{name}' wird bereits im WENN-Block verwendet",
            )

    conditions: list[ConceptRuleCondition] = []
    for cond_in in conditions_in:
        role_enum = ConditionRole.if_ if cond_in.role == "if" else ConditionRole.then
        conditions.append(ConceptRuleCondition(role=role_enum, level_id=cond_in.level_id))
    return conditions


# --- Endpoints ---

@router.get("/{study_id}/rules", response_model=list[RuleOut])
async def list_rules(
    study_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    await _get_study_for_user(study_id, user, db)
    result = await db.execute(
        select(ConceptRule)
        .where(ConceptRule.study_id == study_id)
        .options(
            selectinload(ConceptRule.conditions).selectinload(
                ConceptRuleCondition.level
            ).selectinload(Level.attribute)
        )
        .order_by(ConceptRule.created_at)
    )
    rules = result.scalars().all()
    return [_build_rule_out(r) for r in rules]


@router.post("/{study_id}/rules", response_model=RuleOut, status_code=status.HTTP_201_CREATED)
async def create_rule(
    study_id: uuid.UUID,
    data: RuleIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    await _get_study_for_user(study_id, user, db)
    conditions = await _validate_and_build_conditions(study_id, data.conditions, db)
    rule = ConceptRule(study_id=study_id, description=data.description, conditions=conditions)
    db.add(rule)
    await db.commit()
    return _build_rule_out(await _get_rule(study_id, rule.id, db))


@router.put("/{study_id}/rules/{rule_id}", response_model=RuleOut)
async def update_rule(
    study_id: uuid.UUID,
    rule_id: uuid.UUID,
    data: RuleIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    await _get_study_for_user(study_id, user, db)
    rule = await _get_rule(study_id, rule_id, db)
    new_conditions = await _validate_and_build_conditions(study_id, data.conditions, db)
    rule.description = data.description
    # Explicitly delete old conditions and flush before inserting new ones,
    # to avoid UniqueConstraint violations when the same level/role appears again.
    rule.conditions.clear()
    await db.flush()
    rule.conditions = new_conditions
    await db.commit()
    return _build_rule_out(await _get_rule(study_id, rule.id, db))


@router.delete("/{study_id}/rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rule(
    study_id: uuid.UUID,
    rule_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    await _get_study_for_user(study_id, user, db)
    rule = await _get_rule(study_id, rule_id, db)
    await db.delete(rule)
    await db.commit()
