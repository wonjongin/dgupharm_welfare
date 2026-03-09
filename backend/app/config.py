import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY: str = os.environ.get("SECRET_KEY", "default-secret-key-change-in-production")
DATABASE_URL: str = os.environ.get("DATABASE_URL", "sqlite:///./welfare.db")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
