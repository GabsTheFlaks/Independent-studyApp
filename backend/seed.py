import os
from dotenv import load_dotenv

# Load environment variables before importing core.security
load_dotenv()

from core.database import SessionLocal
from core.models import Course, User, Enrollment
from core.security import get_password_hash


def run_seed():
    db = SessionLocal()

    try:
        # Verifica se já existem cursos para evitar duplicação
        existing_courses = db.query(Course).count()
        if existing_courses > 0:
            print(
                "O banco de dados já possui cursos cadastrados. Pulando o seeding para evitar duplicações."
            )
            return

        print("Iniciando o seeding de dados fictícios...")

        courses_to_add = [
            Course(
                title="Fundamentos de Python e Algoritmos",
                description="Uma introdução acadêmica aos fundamentos da programação utilizando Python. Ideal para iniciantes.",
                category="Programação",
                link_drive="COLE_O_LINK_AQUI",
                file_type="pdf",
                thumbnail_url="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&q=80",
            ),
            Course(
                title="Arquitetura de Software Moderna",
                description="Estudo aprofundado sobre padrões de design, microsserviços e sistemas distribuídos.",
                category="Engenharia de Software",
                link_drive="COLE_O_LINK_AQUI",
                file_type="pdf",
                thumbnail_url="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
            ),
            Course(
                title="Machine Learning em Prática",
                description="Modelos preditivos, regressões e redes neurais explicadas com exemplos práticos.",
                category="Inteligência Artificial",
                link_drive="COLE_O_LINK_AQUI",
                file_type="pdf",
                thumbnail_url="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=80",
            ),
            Course(
                title="Introdução ao React e Tailwind",
                description="Aula gravada mostrando passo a passo como construir interfaces limpas e responsivas.",
                category="Frontend",
                link_drive="COLE_O_LINK_AQUI",
                file_type="video",
                thumbnail_url="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80",
            ),
        ]

        db.add_all(courses_to_add)
        db.commit()

        for course in courses_to_add:
            db.refresh(course)

        # Add a default student user for testing
        default_user = db.query(User).filter(User.username == "student_seed").first()
        if not default_user:
            default_user = User(
                username="student_seed",
                email="student@example.com",
                password_hash=get_password_hash("password123"),
                firstname="Student",
                lastname="Seed",
                role="student"
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)

        # Add enrollments for the first 2 courses
        if len(courses_to_add) >= 2:
            enrollment1 = Enrollment(user_id=default_user.id, course_id=courses_to_add[0].id)
            enrollment2 = Enrollment(user_id=default_user.id, course_id=courses_to_add[1].id)
            db.add_all([enrollment1, enrollment2])
            db.commit()

        print("Seeding concluído com sucesso! 4 cursos, 1 usuário e 2 matrículas foram adicionados.")

    except Exception as e:
        db.rollback()
        print(f"Erro ao executar o seeding: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
