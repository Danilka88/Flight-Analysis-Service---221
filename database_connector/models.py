from sqlalchemy import Column, Integer, String, DateTime, Float
from geoalchemy2 import Geometry
from .database import Base

class FlightRecord(Base):
    """
    Декларативная модель SQLAlchemy для хранения записей о полетах.
    """
    __tablename__ = "flight_records"

    id = Column(Integer, primary_key=True, index=True)
    sid = Column(String, unique=True, index=True, nullable=False)
    atc_center = Column(String, index=True)
    dep_time = Column(DateTime)
    arr_time = Column(DateTime)
    flight_duration_minutes = Column(Integer)
    aircraft_type = Column(String)
    
    # Пример использования GeoAlchemy2 для хранения геометрии маршрута
    # Для простоты здесь можно хранить точку, линию или полигон
    route_geometry = Column(Geometry(geometry_type='GEOMETRY', srid=4326), nullable=True)

    def __repr__(self):
        return f"<FlightRecord(sid='{self.sid}', atc_center='{self.atc_center}')>"
