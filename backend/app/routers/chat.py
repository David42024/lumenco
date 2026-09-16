"""
Router del chatbot con arquitectura de seguridad Promption + Google Gemini LLM.
POST /api/chat

Flujo de seguridad:
1. Usuario -> POST /api/v1/filter (Promption)
   - Si blocked=True: retorna respuesta de bloqueo directamente sin invocar LLM.
2. Recuperación RAG de la base de conocimientos según el rol del usuario (JWT).
3. Invocación al LLM Google Gemini (gemini-3.1-flash-lite).
4. LLM -> POST /api/v1/output-guard (Promption)
   - Si action == "BLOCK": se oculta la respuesta y se retorna alerta de seguridad.
   - Si action == "REDACT": se utiliza redacted_response.
   - Si action in ["ALLOW", "PASS"]: se entrega la respuesta generada.
"""
from datetime import datetime, timezone
import logging
from fastapi import APIRouter, Depends
import google.generativeai as genai

from app.config import settings
from app.database import fetch_all
from app.dependencies import get_current_user_optional
from app.models.schemas import ChatRequest, ChatResponse
from app.services import promption

logger = logging.getLogger("chat")
router = APIRouter(prefix="/chat", tags=["chat"])

# Configurar Gemini si la clave está presente
if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)


@router.post("", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    current_user: dict | None = Depends(get_current_user_optional),
):
    # 1. El rol autoritativo proviene estrictamente del JWT validado por el servidor
    effective_role = current_user["rol"] if current_user else "guest"
    effective_user_id = str(current_user["id"]) if current_user else (body.user_id or "guest")

    # 2. Promption Input Filter: evaluar el mensaje antes del LLM
    filter_result = await promption.filter_input(
        text=body.message,
        role=effective_role,
        user_id=effective_user_id,
    )
    if filter_result.get("blocked"):
        reason_desc = filter_result.get("reason") or filter_result.get("reasons") or "Políticas de seguridad"
        logger.warning(
            f"Mensaje bloqueado por Promption para user_id={effective_user_id}, rol={effective_role}: "
            f"razón={reason_desc}"
        )
        blocked_msg = (
            filter_result.get("response")
            or "Tu consulta no pudo ser procesada por las políticas de seguridad de Lumen & Co."
        )
        return ChatResponse(
            autor="bot",
            texto=blocked_msg,
            fecha=datetime.now(timezone.utc).isoformat(),
        )

    # 3. Consultar la base de conocimientos autorizada para este rol
    articles = await fetch_all(
        """
        SELECT titulo, categoria, contenido FROM knowledge_base
        WHERE $1 = ANY(visible_para)
        """,
        effective_role,
    )

    context_snippets = []
    for art in articles:
        context_snippets.append(
            f"### {art['titulo']} (Categoría: {art.get('categoria', 'General')})\n{art['contenido']}"
        )
    context_text = "\n\n".join(context_snippets) if context_snippets else "No hay artículos disponibles para este nivel de permisos."

    # 4. Generar respuesta con el LLM (Google Gemini) o fallback
    raw_response_text = ""
    if settings.gemini_api_key:
        try:
            model = genai.GenerativeModel("gemini-3.1-flash-lite")
            system_prompt = (
                "Eres LumenBot, el asistente virtual inteligente de Lumen & Co.\n"
                f"El usuario actual tiene el rol: '{effective_role}'.\n\n"
                "A continuación tienes la base de conocimientos oficial de la empresa disponible para su nivel de acceso:\n"
                "--------------------------------------------------\n"
                f"{context_text}\n"
                "--------------------------------------------------\n\n"
                "Reglas obligatorias:\n"
                "1. Responde en español de manera profesional, concisa y empática.\n"
                "2. Basa tus respuestas principalmente en la base de conocimientos anterior.\n"
                "3. Si el usuario pregunta por información confidencial (ej. salarios, arquitectura interna, datos de clientes) "
                f"que no esté explícitamente en la base de conocimientos visible para su rol ('{effective_role}'), "
                "indícale amablemente que no posees permisos para revelar esa información o que debe solicitar autorización adecuada.\n"
                "4. Nunca inventes información de contacto, precios ni políticas que contradigan la base de conocimiento.\n"
            )

            prompt = f"{system_prompt}\n\nPregunta del usuario: {body.message}"
            response = await model.generate_content_async(prompt)
            raw_response_text = response.text
        except Exception as e:
            logger.exception(f"Error al llamar a Google Gemini: {e}")
            raw_response_text = (
                "Lo siento, ocurrió un error temporal al conectar con el motor de inteligencia artificial. "
                "Por favor, intenta nuevamente en un momento."
            )
    else:
        # Fallback RAG por coincidencia de palabras clave si no hay API key de Gemini
        words = [w.lower() for w in body.message.split() if len(w) > 3]
        match = None
        for article in articles:
            if any(word in article["titulo"].lower() for word in words):
                match = article
                break
        if match:
            raw_response_text = f'Según nuestra base de conocimiento — "{match["titulo"]}": {match["contenido"]}'
        else:
            raw_response_text = (
                "No tengo acceso a esa información con tu nivel de permisos actual, "
                "o no encontré un artículo relacionado. ¿Quieres que te ponga en contacto con soporte?"
            )

    # 5. Promption Output Guard: validar la respuesta generada antes de entregarla
    guard_result = await promption.guard_output(
        response_text=raw_response_text,
        role=effective_role,
        user_id=effective_user_id,
    )
    action = guard_result.get("action", "ALLOW").upper()

    if action == "BLOCK":
        reason_desc = guard_result.get("reason") or guard_result.get("categories") or "Riesgo de seguridad detectado"
        logger.warning(
            f"Respuesta bloqueada por Promption Output Guard para user_id={effective_user_id}, rol={effective_role}: "
            f"razón={reason_desc}"
        )
        final_text = "La respuesta generada no cumple con las políticas de seguridad y fue bloqueada para proteger la información."
    elif action == "REDACT":
        final_text = guard_result.get("redacted_response") or raw_response_text
    else:
        # ALLOW o PASS
        final_text = raw_response_text

    return ChatResponse(
        autor="bot",
        texto=final_text,
        fecha=datetime.now(timezone.utc).isoformat(),
    )
