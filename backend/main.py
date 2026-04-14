from dotenv import load_dotenv

# Carrega as variáveis de ambiente antes de qualquer configuração que dependa delas
load_dotenv()

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from api import auth, courses
from core.security import get_current_user

# Inicializa a aplicação FastAPI
app = FastAPI(
    title="Independent Study App API",
    description="MVP de uma plataforma educacional independente",
)

# Configura o CORS para permitir requisições com cookies do frontend
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]  # Porta padrão do Vite

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra os roteadores
app.include_router(auth.router, tags=["Authentication"])
app.include_router(courses.router, prefix="/api", tags=["Courses and Activities"])


@app.get("/")
def read_root():
    """
    Endpoint raiz que retorna uma mensagem de boas-vindas.
    Usado para verificar se o serviço está online.
    """
    return {"message": "Hello World"}


@app.get("/users/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    """
    Endpoint protegido para validar se o token JWT está funcionando.
    Retorna os dados do usuário contidos no token.
    """
    return {"user": current_user}
