"""add byo instructions to studies

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-03-10 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('studies', sa.Column('byo_instruction_title', sa.String(255), nullable=True))
    op.add_column('studies', sa.Column('byo_instruction_text', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('studies', 'byo_instruction_text')
    op.drop_column('studies', 'byo_instruction_title')
