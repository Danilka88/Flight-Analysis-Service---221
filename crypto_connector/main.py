from fastapi import APIRouter, Body
from pydantic import BaseModel
import base64
from . import utils

router = APIRouter(
    prefix="/api/v2/crypto",
    tags=["Crypto Connector (PGP)"],
)

class CryptoRequest(BaseModel):
    data: str # Данные для шифрования/дешифрования в формате Base64

class EncryptResponse(BaseModel):
    encrypted_data: str

class DecryptResponse(BaseModel):
    decrypted_data: str

@router.get("/public-key", summary="Получить публичный ключ для шифрования (демо)")
def get_public_key():
    """Возвращает демонстрационный публичный ключ в формате PEM."""
    return {
        "message": "Публичный ключ для шифрования данных. Используйте его для вызова /encrypt.",
        "public_key": utils.get_public_key_pem()
    }

@router.post("/encrypt", response_model=EncryptResponse, summary="Зашифровать данные (демо)")
def encrypt_data(data: str = Body(..., embed=True)):
    """
    Принимает строку, шифрует ее и возвращает в формате Base64.
    """
    encrypted_bytes = utils.encrypt_message(data)
    encrypted_base64 = base64.b64encode(encrypted_bytes).decode('utf-8')
    return EncryptResponse(encrypted_data=encrypted_base64)

@router.post("/decrypt", response_model=DecryptResponse, summary="Расшифровать данные (демо)")
def decrypt_data(encrypted_data: str = Body(..., embed=True)):
    """
    Принимает зашифрованную строку в Base64, расшифровывает и возвращает оригинал.
    """
    try:
        encrypted_bytes = base64.b64decode(encrypted_data)
        decrypted_string = utils.decrypt_message(encrypted_bytes)
        return DecryptResponse(decrypted_data=decrypted_string)
    except Exception as e:
        return {"error": f"Decryption failed. The data may be corrupt or encrypted with a different key. Details: {e}"}
