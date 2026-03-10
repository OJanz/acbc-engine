"""add_welcome_message_to_studies

Revision ID: a1b2c3d4e5f6
Revises: 50db6ed15459
Create Date: 2026-03-10 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '50db6ed15459'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('studies', sa.Column('welcome_message', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('studies', 'welcome_message')
