from fastapi import FastAPI,Depends
from routers.authApi import router , get_current_user
from database import create_db_and_tables
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    
app.include_router(router)

student = [
    {
        'id' : 1,
        'name' : "name1"
    },
    {
        'id' : 2,
        'name' : "name2"
    },
    {
        'id' : 3,
        'name' : "name3"
    }
]

@app.get('/')
def greeting():
    return "Hello World!!"

@app.get("/student")
def getStudent(email: str = Depends(get_current_user)):
    return student

@app.post("/student")
def addStudent(id: int,name : str , email: str=Depends(get_current_user)):
    student.append({
        'id' : id,
        'name' : name
    })
    
    return {'message' : "Student Added"}