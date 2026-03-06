from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    ASYNC_DATABASE_URL: str = ""

    class Config:
        env_file = ".env"

    def model_post_init(self, __context):
        if not self.ASYNC_DATABASE_URL:
            self.ASYNC_DATABASE_URL = self.DATABASE_URL.replace(
                "postgresql+psycopg2://", "postgresql+asyncpg://"
            )


settings = Settings()