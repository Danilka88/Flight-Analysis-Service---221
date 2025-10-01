# Коннектор Аутентификации (OpenID Connect)

Этот модуль представляет собой самодостаточный коннектор для реализации аутентификации и авторизации через OpenID Connect (OIDC) с использованием Authlib.

## Назначение

Модуль предоставляет API-маршруты для входа в систему, обработки колбэка от провайдера OIDC (например, Keycloak) и защиты эндпоинтов.

## Конфигурация

Для работы модуля необходимо настроить параметры OIDC-провайдера в файле `auth_connector/config.py`.

```python
KEYCLOAK_CLIENT_ID = "your-client-id"
KEYCLOAK_CLIENT_SECRET = "your-client-secret"
KEYCLOAK_DISCOVERY_URL = "https://your-keycloak-server/realms/your-realm/.well-known/openid-configuration"
```

## Запуск

Модуль автоматически подключается к основному приложению `main.py`.
