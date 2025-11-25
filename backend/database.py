from sqlmodel import Session,create_engine,SQLModel
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = "sqlite:///./project.db"
# DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL,echo=True)

def getSession():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)