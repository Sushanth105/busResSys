from sqlmodel import Session,create_engine,SQLModel

DATABASE_URL = "sqlite:///./project.db"
engine = create_engine(DATABASE_URL,echo=True)

def getSession():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)