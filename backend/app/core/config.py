from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    ASYNC_DATABASE_URL: str = ""

    # Auth
    AUTH_SECRET: str
    AUTH_TOKEN_LIFETIME_SECONDS: int = 3600

    ENVIRONMENT: str = "development"

    # Frontend (used in email links)
    FRONTEND_URL: str = "http://localhost:3000"

    # Email (Lettermint)
    LETTERMINT_API_KEY: str = ""
    MAIL_FROM: str = "noreply@example.com"

    class Config:
        env_file = ".env"

    def model_post_init(self, __context):
        if not self.ASYNC_DATABASE_URL:
            self.ASYNC_DATABASE_URL = self.DATABASE_URL.replace(
                "postgresql+psycopg2://", "postgresql+asyncpg://"
            )


settings = Settings()