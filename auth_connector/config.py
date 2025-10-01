# --- Конфигурация OpenID Connect (Keycloak) ---
# ВАЖНО: Замените на реальные данные вашего OIDC-провайдера

KEYCLOAK_CLIENT_ID = "your-client-id"
KEYCLOAK_CLIENT_SECRET = "your-client-secret"

# URL для автоматического обнаружения эндпоинтов OIDC
KEYCLOAK_DISCOVERY_URL = "https://your-keycloak-server/realms/your-realm/.well-known/openid-configuration"
