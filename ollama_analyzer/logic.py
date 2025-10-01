import ollama
import bleach
from typing import Any, Dict

# --- Безопасность: Настройка HTML-санитайзера --- #
ALLOWED_TAGS = ['p', 'ul', 'li', 'strong', 'em', 'b', 'i']

def sanitize_html(dirty_html: str) -> str:
    """Очищает HTML-строку, оставляя только разрешенные теги."""
    return bleach.clean(dirty_html, tags=ALLOWED_TAGS, strip=True)

# --- Логика для демонстрационных данных (Fallback) --- #

def get_mock_analysis(widgetType: str, data: Any) -> str:
    """Возвращает демонстрационный (захардкоженный) анализ, если Ollama недоступна."""
    # Эта логика полностью повторяет то, что было в Dashboard.tsx
    analysis_map = {
        'map': "<p><strong>Ключевые инсайты:</strong></p><ul><li><strong>Централизация:</strong> Москва и Санкт-Петербург остаются абсолютными лидерами, концентрируя основной объем полетов.</li><li><strong>Южный хаб:</strong> Краснодарский край демонстрирует высокую активность, вероятно, связанную с агросектором и туризмом.</li><li><strong>Дальний Восток:</strong> Самая высокая средняя длительность полетов указывает на мониторинговые миссии на больших территориях.</li></ul>",
        'timeseries': "<p><strong>Ключевые инсайты:</strong></p><ul><li><strong>Положительный тренд:</strong> Наблюдается стабильный рост числа полетов в течение месяца.</li><li><strong>Эффект выходного дня:</strong> Заметно небольшое снижение активности в субботу и воскресенье.</li></ul>",
        'hourly': "<p><strong>Ключевые инсайты:</strong></p><ul><li><strong>Деловая активность:</strong> Пик полетов приходится на рабочие часы (11:00-14:00).</li><li><strong>Ночные операции:</strong> Минимальная активность ночью говорит о преобладании дневных задач.</li></ul>",
        'totalFlights': f"<p>Значение <strong>{data.get('totalFlights', 'N/A')}</strong> указывает на высокий уровень общей полетной активности в системе. Это свидетельствует о зрелости и широком использовании БПЛА в анализируемых регионах.</p>",
        'avgDuration': f"<p>Средняя длительность полета в <strong>{data.get('avgFlightDuration', 'N/A')} минут</strong> говорит о том, что большинство миссий являются среднесрочными. Это типично для задач инспекции, аэрофотосъемки или мониторинга объектов.</p>",
        'default': "<p>Анализ для данного виджета находится в разработке.</p>"
    }
    return analysis_map.get(widgetType, analysis_map['default'])

# --- Логика для взаимодействия с Ollama --- #

def _create_prompt(widgetType: str, data: Any) -> str:
    """Создает системный и пользовательский промпт для LLM."""
    system_prompt = (
        "Ты — эксперт-аналитик по полетным данным гражданских БПЛА. "
        "Твоя задача — предоставлять краткие, но содержательные аналитические сводки на русском языке. "
        "Выделяй 2-3 ключевых инсайта. Ответ должен быть отформатирован в виде компактного HTML "
        "с использованием только тегов <p>, <ul>, <li>, <strong>, <em>, <b>, <i>. "
        "Не используй markdown. Не оборачивай ответ в ```html ... ```."
    )

    user_prompt = f"Проанализируй следующие данные для виджета '{widgetType}':\n\n{str(data)}"
    
    return system_prompt, user_prompt

def get_ollama_analysis(widgetType: str, data: Any) -> str:
    """Основная функция для получения анализа от Ollama с fallback-логикой."""
    system_prompt, user_prompt = _create_prompt(widgetType, data)
    
    try:
        # Проверяем доступность сервиса Ollama
        ollama.ps()

        response = ollama.chat(
            model='gemma3:1b', # Как и просил пользователь
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ]
        )
        analysis_html = response['message']['content']
        return sanitize_html(analysis_html)

    except Exception as e:
        print(f"[Ollama Analyzer] Ошибка при обращении к Ollama: {e}")
        print("[Ollama Analyzer] Возвращаю демонстрационные данные.")
        return get_mock_analysis(widgetType, data)
