from pydantic import BaseModel
from typing import Any, Dict

class AnalyzeRequest(BaseModel):
    """
    Модель запроса на анализ.
    Соответствует спецификации в API_INTEGRATION.md.
    """
    widgetType: str
    data: Any

class AnalyzeResponse(BaseModel):
    """
    Модель ответа с результатом анализа.
    """
    analysis: str
