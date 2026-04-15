from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from core.database import get_db
from core.models import Course
from core.security import get_current_user, get_admin_user

router = APIRouter()


class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    link_drive: str
    file_type: Optional[str] = None
    thumbnail_url: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseResponse(CourseBase):
    id: int

    class Config:
        from_attributes = True


@router.get("/courses", response_model=List[CourseResponse])
async def get_courses(
    current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    Lista todos os cursos ativos na plataforma.
    """
    courses = db.query(Course).all()
    return courses


@router.get("/courses/{course_id}", response_model=CourseResponse)
async def get_course_by_id(
    course_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retorna os detalhes de um curso específico.
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Curso não encontrado."
        )
    return course


@router.post(
    "/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED
)
async def create_course(
    course_data: CourseCreate,
    admin_user: dict = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """
    Cadastra um novo curso na plataforma (Apenas Admin).
    """
    new_course = Course(**course_data.model_dump())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course
