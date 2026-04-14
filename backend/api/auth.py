from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from core.database import get_db
from core.models import User
from core.security import (
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
    get_password_hash,
    verify_password,
)

router = APIRouter()


class UserRegister(BaseModel):
    username: str
    password: str
    firstname: str
    lastname: str
    email: EmailStr


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    firstname: str
    lastname: str

    class Config:
        from_attributes = True


@router.post("/login")
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Endpoint de login consultando o banco SQLite local.
    """
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos.",
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=access_token_expires,
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Em produção deve ser True
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return {
        "message": "Login successful",
        "user": {"username": user.username, "user_id": user.id},
    }


@router.post("/refresh")
async def refresh_token(
    response: Response, current_user: dict = Depends(get_current_user)
):
    """
    Valida o token via cookie. Se válido, gera um novo token renovando a expiração.
    """
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        data={"sub": current_user["username"], "user_id": current_user["user_id"]},
        expires_delta=access_token_expires,
    )

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return {"user": current_user}


@router.post("/logout")
async def logout(response: Response):
    """
    Limpa o cookie de autenticação.
    """
    response.delete_cookie("access_token", httponly=True, samesite="lax")
    return {"message": "Logged out successfully"}


@router.post("/register")
async def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Cadastra um novo usuário no banco de dados local.
    """
    # Verifica se já existe username ou email
    db_user_by_username = (
        db.query(User).filter(User.username == user_data.username).first()
    )
    if db_user_by_username:
        raise HTTPException(status_code=400, detail="Username já está em uso.")

    db_user_by_email = db.query(User).filter(User.email == user_data.email).first()
    if db_user_by_email:
        raise HTTPException(status_code=400, detail="Email já está em uso.")

    hashed_password = get_password_hash(user_data.password)

    new_user = User(
        username=user_data.username,
        password_hash=hashed_password,
        email=user_data.email,
        firstname=user_data.firstname,
        lastname=user_data.lastname,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Usuário registrado com sucesso!", "user_id": new_user.id}
