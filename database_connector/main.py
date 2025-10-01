from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models
from .database import get_db, engine

# Создаем таблицы в БД (если их нет). В реальном приложении лучше использовать Alembic.
# models.Base.metadata.create_all(bind=engine)

router = APIRouter(
    prefix="/api/v2/db",
    tags=["Database Connector"],
)

@router.get("/flights", summary="Получить список полетов из БД (демо)")
def get_flights_from_db(db: Session = Depends(get_db)):
    """
    Демонстрационный эндпоинт.
    В реальной реализации здесь будет запрос к БД для получения списка полетов.
    `db.query(models.FlightRecord).offset(skip).limit(limit).all()`
    """
    return {
        "message": "Эндпоинт для получения списка полетов из БД. Коннектор готов к работе.",
        "data_source": "PostgreSQL (демонстрация)",
        "example_data": [
            {"sid": "DEMO001", "atc_center": "Московский"},
            {"sid": "DEMO002", "atc_center": "Санкт-Петербургский"}
        ]
    }

@router.get("/flights/{sid}", summary="Получить полет по SID из БД (демо)")
def get_flight_by_sid_from_db(sid: str, db: Session = Depends(get_db)):
    """
    Демонстрационный эндпоинт.
    В реальной реализации здесь будет запрос к БД для получения одного полета.
    `db.query(models.FlightRecord).filter(models.FlightRecord.sid == sid).first()`
    """
    if not sid.startswith("DEMO"):
        raise HTTPException(status_code=404, detail="Это демонстрационный эндпоинт. Попробуйте SID вида DEMO001.")
    
    return {
        "message": f"Эндпоинт для получения полета {sid} из БД. Коннектор готов к работе.",
        "data_source": "PostgreSQL (демонстрация)",
        "data": {"sid": sid, "atc_center": "Московский", "flight_duration_minutes": 120}
    }
