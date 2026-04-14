from core.database import engine, Base
import core.models  # Required to register tables before Base.metadata.create_all


def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")


if __name__ == "__main__":
    init_db()
