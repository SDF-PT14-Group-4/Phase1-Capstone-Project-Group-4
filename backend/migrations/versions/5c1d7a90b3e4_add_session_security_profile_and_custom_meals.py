"""add session security, profile fields and custom meals

Revision ID: 5c1d7a90b3e4
Revises: e760222b1107
Create Date: 2026-10-31 21:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5c1d7a90b3e4'
down_revision = 'e760222b1107'
branch_labels = None
depends_on = None


def upgrade():
    # Profile and session fields on users. Server defaults let existing rows migrate.
    op.add_column('users', sa.Column('display_name', sa.String(length=60), nullable=True))
    op.add_column('users', sa.Column('dietary_preferences', sa.JSON(), nullable=False, server_default=sa.text("'[]'")))
    op.add_column('users', sa.Column('token_version', sa.Integer(), nullable=False, server_default='0'))

    # Tokens ended by logout before their natural expiry.
    op.create_table('revoked_tokens',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('jti', sa.String(length=64), nullable=False),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_revoked_tokens_jti'), 'revoked_tokens', ['jti'], unique=True)
    op.create_index(op.f('ix_revoked_tokens_expires_at'), 'revoked_tokens', ['expires_at'], unique=False)

    # Counted attempts used for login lockout and registration limits.
    op.create_table('rate_limit_events',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('bucket', sa.String(length=320), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_rate_limit_events_bucket'), 'rate_limit_events', ['bucket'], unique=False)
    op.create_index(op.f('ix_rate_limit_events_created_at'), 'rate_limit_events', ['created_at'], unique=False)

    # User-written meals.
    op.create_table('custom_meals',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('category', sa.String(length=120), nullable=False),
    sa.Column('cuisine', sa.String(length=120), nullable=False),
    sa.Column('image', sa.String(length=500), nullable=False),
    sa.Column('ingredients', sa.JSON(), nullable=False),
    sa.Column('instructions', sa.Text(), nullable=False),
    sa.Column('is_public', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_custom_meals_user_id'), 'custom_meals', ['user_id'], unique=False)
    op.create_index(op.f('ix_custom_meals_is_public'), 'custom_meals', ['is_public'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_custom_meals_is_public'), table_name='custom_meals')
    op.drop_index(op.f('ix_custom_meals_user_id'), table_name='custom_meals')
    op.drop_table('custom_meals')
    op.drop_index(op.f('ix_rate_limit_events_created_at'), table_name='rate_limit_events')
    op.drop_index(op.f('ix_rate_limit_events_bucket'), table_name='rate_limit_events')
    op.drop_table('rate_limit_events')
    op.drop_index(op.f('ix_revoked_tokens_expires_at'), table_name='revoked_tokens')
    op.drop_index(op.f('ix_revoked_tokens_jti'), table_name='revoked_tokens')
    op.drop_table('revoked_tokens')
    op.drop_column('users', 'token_version')
    op.drop_column('users', 'dietary_preferences')
    op.drop_column('users', 'display_name')
