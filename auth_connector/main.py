from fastapi import APIRouter, Depends
from starlette.requests import Request
from authlib.integrations.starlette_client import OAuth
from .config import KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET, KEYCLOAK_DISCOVERY_URL

router = APIRouter(
    prefix="/api/v2/auth",
    tags=["Auth Connector (OIDC)"],
)

# Создаем OAuth клиент
oauth = OAuth()

# Регистрируем OIDC-провайдера (Keycloak)
# В реальном приложении это нужно делать на старте FastAPI
oauth.register(
    name='keycloak',
    client_id=KEYCLOAK_CLIENT_ID,
    client_secret=KEYCLOAK_CLIENT_SECRET,
    server_metadata_url=KEYCLOAK_DISCOVERY_URL,
    client_kwargs={
        'scope': 'openid email profile'
    }
)

@router.get("/login", summary="Перенаправление на страницу входа OIDC-провайдера (демо)")
async def login(request: Request):
    """
    Создает URL для редиректа на страницу входа провайдера (Keycloak).
    В реальном приложении будет выполнен редирект.
    """
    redirect_uri = request.url_for('auth_callback')
    # В реальном приложении здесь был бы редирект:
    # return await oauth.keycloak.authorize_redirect(request, redirect_uri)
    return {
        "message": "Это эндпоинт для OIDC-аутентификации. Коннектор готов к работе.",
        "description": "В реальном приложении здесь был бы редирект на страницу логина Keycloak.",
        "oidc_provider_name": "keycloak",
        "redirect_uri_for_provider": str(redirect_uri)
    }

@router.get("/callback", summary="Обработка колбэка от OIDC-провайдера (демо)")
async def auth_callback(request: Request):
    """
    Обрабатывает редирект от OIDC-провайдера после успешного входа.
    """
    # В реальном приложении здесь будет обмен кода на токен:
    # token = await oauth.keycloak.authorize_access_token(request)
    # user = token.get('userinfo')
    return {
        "message": "Это эндпоинт для обработки колбэка от OIDC. Коннектор готов к работе.",
        "description": "Здесь происходит обмен кода авторизации на access_token и получение данных пользователя.",
        "received_params": dict(request.query_params)
    }

@router.get("/me", summary="Пример защищенного эндпоинта (демо)")
async def get_current_user(request: Request):
    """
    Пример эндпоинта, который должен быть доступен только аутентифицированным пользователям.
    """
    # В реальном приложении здесь была бы проверка токена
    # active_user = request.session.get('user')
    return {
        "message": "Это пример защищенного эндпоинта.",
        "description": "Доступ к нему должен быть разрешен только после успешной OIDC-аутентификации.",
        "user_info_placeholder": {"sub": "123-456-789", "name": "John Doe", "email": "johndoe@example.com"}
    }
