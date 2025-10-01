from fastapi import APIRouter, HTTPException
from .models import AnalyzeRequest, AnalyzeResponse
from .logic import get_ollama_analysis

router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI Analysis"],
)

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_data(request: AnalyzeRequest):
    """
    Универсальный эндпоинт для получения аналитических сводок от языковой модели (LLM).
    - Принимает `widgetType` и `data`.
    - Формирует промпт для LLM.
    - Отправляет запрос в Ollama (с fallback на мок-данные).
    - Возвращает HTML-ответ с результатом анализа.
    """
    try:
        analysis_result = get_ollama_analysis(request.widgetType, request.data)
        return AnalyzeResponse(analysis=analysis_result)
    except Exception as e:
        # Общая обработка ошибок на случай, если что-то пойдет не так внутри логики
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
