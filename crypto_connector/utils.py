from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding

# В реальной системе ключи должны безопасно храниться и управляться (например, в HSM или Vault)
_private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
)

_public_key = _private_key.public_key()

def get_public_key_pem() -> str:
    """Возвращает публичный ключ в формате PEM для демонстрации."""
    pem = _public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    return pem.decode('utf-8')

def encrypt_message(message: str) -> bytes:
    """
    Шифрует сообщение с использованием публичного ключа (демонстрация).
    Использует RSA с OAEP-padding, что является современной практикой.
    """
    encrypted = _public_key.encrypt(
        message.encode('utf-8'),
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return encrypted

def decrypt_message(encrypted_message: bytes) -> str:
    """
    Дешифрует сообщение с использованием приватного ключа (демонстрация).
    """
    original_message = _private_key.decrypt(
        encrypted_message,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return original_message.decode('utf-8')
