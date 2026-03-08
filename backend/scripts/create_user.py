"""
CLI-Script zum Anlegen von Usern.

Verwendung (aus dem backend/ Verzeichnis):
    python scripts/create_user.py --email user@example.com --password Passwort123! --role researcher
    python scripts/create_user.py --email admin@example.com --password Passwort123! --role admin --superuser

Rollen: admin, researcher, participant
"""
import asyncio
import argparse
import sys

sys.path.insert(0, ".")

from app.db.session import async_session
from app.models.user import User, UserRole
from app.api.v1.auth import get_user_db, get_user_manager, UserManager
from fastapi_users.db import SQLAlchemyUserDatabase
from app.schemas.user import UserCreate


async def create_user(email: str, password: str, role: UserRole, superuser: bool) -> None:
    async with async_session() as session:
        user_db = SQLAlchemyUserDatabase(session, User)
        manager = UserManager(user_db)

        existing = await user_db.get_by_email(email)
        if existing:
            print(f"Fehler: Ein User mit der E-Mail '{email}' existiert bereits.")
            sys.exit(1)

        user = await manager.create(
            UserCreate(email=email, password=password, is_superuser=superuser)
        )

        # Rolle und Verifikation direkt setzen
        user.role = role
        user.is_verified = True
        await session.commit()

        print(f"User erfolgreich angelegt:")
        print(f"  E-Mail:     {user.email}")
        print(f"  Rolle:      {user.role.value}")
        print(f"  Superuser:  {user.is_superuser}")
        print(f"  ID:         {user.id}")


def main():
    parser = argparse.ArgumentParser(description="ACBC User anlegen")
    parser.add_argument("--email", required=True, help="E-Mail-Adresse")
    parser.add_argument("--password", required=True, help="Passwort")
    parser.add_argument(
        "--role",
        choices=["admin", "researcher", "participant"],
        default="researcher",
        help="Rolle (default: researcher)",
    )
    parser.add_argument(
        "--superuser",
        action="store_true",
        help="User als Superuser anlegen",
    )
    args = parser.parse_args()

    role = UserRole(args.role)
    asyncio.run(create_user(args.email, args.password, role, args.superuser))


if __name__ == "__main__":
    main()
