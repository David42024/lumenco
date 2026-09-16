"""
Router de autenticación: registro y login.
POST /api/auth/register
POST /api/auth/login
"""
from fastapi import APIRouter, HTTPException, status

from app.auth import create_token, hash_password, verify_password
from app.database import fetch_one, execute
from app.models.schemas import AuthResponse, LoginRequest, RegisterRequest, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_out(row) -> UserOut:
    return UserOut(
        id=str(row["id"]),
        nombre=row["nombre"],
        email=row["email"],
        rol=row["rol"],
        creadoEn=row["creado_en"].strftime("%Y-%m-%d"),
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    # Verificar email duplicado
    existing = await fetch_one("SELECT id FROM usuarios WHERE email = $1", body.email.lower())
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta registrada con ese correo.",
        )

    hashed = hash_password(body.password)
    row = await fetch_one(
        """
        INSERT INTO usuarios (nombre, email, password_hash, rol)
        VALUES ($1, $2, $3, 'client')
        RETURNING id, nombre, email, rol, creado_en
        """,
        body.nombre,
        body.email.lower(),
        hashed,
    )
    user = _user_out(row)
    token = create_token(user.id, user.rol)
    return AuthResponse(user=user, token=token)


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    row = await fetch_one(
        "SELECT id, nombre, email, password_hash, rol, creado_en FROM usuarios WHERE email = $1",
        body.email.lower(),
    )
    if not row or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas. Verifica tu correo y contraseña.",
        )
    user = _user_out(row)
    token = create_token(user.id, user.rol)
    return AuthResponse(user=user, token=token)
