import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status, Request
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# Configurações de segurança que idealmente vêm do .env
# Removemos os fallbacks para garantir que um erro claro ocorra
# caso as variáveis obrigatórias não estejam setadas.
SECRET_KEY = os.environ["JWT_SECRET_KEY"]
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Instância para hashear e validar senhas usando bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha em texto claro bate com o hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Retorna o hash de uma senha."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Cria um token JWT codificando os dados fornecidos.
    Se um tempo de expiração não for passado, utiliza o padrão definido nas configurações.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    # PyJWT.encode retorna uma string no pyjwt>2.0
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(request: Request) -> dict:
    """
    Dependência que injeta o usuário atual a partir do token.
    Decodifica o token presente no cookie 'access_token' e retorna
    um dicionário contendo o username ('sub') e o 'user_id'.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
    )

    token = request.cookies.get("access_token")
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        role: str = payload.get("role")

        if username is None or user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        # Pega erros como Token Expired, Signature Invalid, etc.
        raise credentials_exception

    return {"username": username, "user_id": user_id, "role": role}


def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependência de segurança que garante que o usuário atual tenha a role 'admin'.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Privilégios insuficientes para acessar este recurso.",
        )
    return current_user
