"""
FastAPI dependencies para inyección de usuario y verificación de roles.

Uso:
  - get_current_user: requiere JWT válido, retorna dict con id/rol
  - get_current_user_optional: retorna None si no hay JWT (para rutas guest)
  - require_role("employee"): dependency factory que valida rol mínimo
"""
from __future__ import annotations

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError

from app.auth import decode_token

# Jerarquía de roles — misma que el frontend (authStore.ts)
ROLE_HIERARCHY = ["guest", "client", "employee", "admin"]


def _role_index(role: str) -> int:
    try:
        return ROLE_HIERARCHY.index(role)
    except ValueError:
        return -1


async def get_current_user(
    authorization: str = Header(default=""),
) -> dict:
    """Extrae y valida el JWT del header Authorization: Bearer <token>.
    Retorna {"id": str, "rol": str}."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación requerido.",
        )
    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = decode_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
        )
    user_id = payload.get("sub")
    rol = payload.get("rol", "guest")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sin identificador de usuario.",
        )
    return {"id": user_id, "rol": rol}


async def get_current_user_optional(
    authorization: str = Header(default=""),
) -> dict | None:
    """Igual que get_current_user pero retorna None en vez de 401 si
    no hay token. Útil para rutas que aceptan guest."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None


def require_role(min_role: str):
    """Dependency factory: valida que el usuario tenga al menos `min_role`.

    Ejemplo:
        @router.get("/admin/stuff", dependencies=[Depends(require_role("admin"))])
    """
    async def dependency(
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        if _role_index(current_user["rol"]) < _role_index(min_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere rol '{min_role}' o superior.",
            )
        return current_user
    return dependency
