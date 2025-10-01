from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ВАЖНО: Замените на реальные данные для подключения к вашей базе данных PostgreSQL
DATABASE_URL = "postgresql://user:password@postgresserver/db"

# Создаем движок SQLAlchemy
engine = create_engine(DATABASE_URL)

# Создаем фабрику сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для декларативных моделей
Base = declarative_base()

# Зависимость для получения сессии в FastAPI-маршрутах
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
