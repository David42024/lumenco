"""
Servicio cliente para la API de seguridad Promption.
Implementa filtrado de entrada (input filter) y verificación de salida (output guard)
con política fail-closed.
"""
import logging
from typing import Dict, Any, Optional
import httpx
from app.config import settings

logger = logging.getLogger("promption")


async def filter_input(
    text: str,
    role: str = "guest",
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Evalúa el mensaje del usuario con Promption antes de enviarlo al LLM / base de conocimiento.
    Retorna un diccionario con formato:
    {
        "blocked": bool,
        "decision": str ("ALLOWED" | "BLOCKED"),
        "confidence": float,
        "reason": str,
        "sanitized": str,
        ...
    }
    """
    if not settings.promption_api_key:
        logger.warning("PROMPTION_API_KEY no configurada. Saltando filtro de entrada.")
        return {"blocked": False, "decision": "ALLOWED", "confidence": 0.0, "reason": "No API key configured"}

    url = f"{settings.filter_api_url.rstrip('/')}/api/v1/filter"
    headers = {
        "X-Promption-API-Key": settings.promption_api_key,
        "Authorization": f"Bearer {settings.promption_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "roles": [role],
        "user_id": user_id or "guest",
        "context": {
            "role": role,
            "tenant_id": settings.tenant_id,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                return data
            else:
                logger.error(f"Error desde Promption Filter API: HTTP {resp.status_code} - {resp.text}")
                # Fail-closed
                return {
                    "blocked": True,
                    "decision": "BLOCKED",
                    "confidence": 1.0,
                    "reason": f"Promption HTTP {resp.status_code}",
                    "response": "Tu mensaje no pudo ser procesado debido a un error en el servicio de seguridad.",
                }
    except Exception as e:
        logger.exception(f"Falla de conexión con Promption Filter API: {e}")
        # Fail-closed
        return {
            "blocked": True,
            "decision": "BLOCKED",
            "confidence": 1.0,
            "reason": "Error de red al conectar con el servicio de seguridad",
            "response": "El servicio de verificación de seguridad no está disponible en este momento. Intenta de nuevo más tarde.",
        }


async def guard_output(
    response_text: str,
    role: str = "guest",
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Valida y sanitiza la respuesta generada por el LLM / base de conocimiento antes de enviarla al usuario.
    Retorna un diccionario con formato:
    {
        "action": "ALLOW" | "PASS" | "REDACT" | "BLOCK",
        "redacted_response": str | None,
        "risk": float,
        "categories": list
    }
    """
    if not settings.promption_api_key:
        logger.warning("PROMPTION_API_KEY no configurada. Saltando Output Guard.")
        return {"action": "ALLOW", "risk": 0.0, "redacted_response": None}

    url = f"{settings.filter_api_url.rstrip('/')}/api/v1/output-guard"
    headers = {
        "X-Promption-API-Key": settings.promption_api_key,
        "Authorization": f"Bearer {settings.promption_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "text": response_text,
        "roles": [role],
        "user_id": user_id or "guest",
        "context": {
            "role": role,
            "tenant_id": settings.tenant_id,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                action = data.get("action", "PASS").upper()
                if action == "PASS":
                    data["action"] = "ALLOW"
                return data
            else:
                logger.error(f"Error desde Promption Output Guard API: HTTP {resp.status_code} - {resp.text}")
                # Fail-closed
                return {
                    "action": "BLOCK",
                    "risk": 1.0,
                    "redacted_response": None,
                    "reason": f"Promption HTTP {resp.status_code}",
                }
    except Exception as e:
        logger.exception(f"Falla de conexión con Promption Output Guard API: {e}")
        # Fail-closed
        return {
            "action": "BLOCK",
            "risk": 1.0,
            "redacted_response": None,
            "reason": "Error de red al conectar con el servicio de verificación de salida",
        }
