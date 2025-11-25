from fastapi import FastAPI,Depends
from routers.authApi import router as authRouter , get_current_user
from routers.busRouter import router as busRouter
from routers.routeRouter import router as routeRouter
from routers.tripRouter import router as tripRouter
from routers.bookingRouter import router as bookingRouter
from database import create_db_and_tables
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session,select
from database import getSession
from models.Users import Users
from dto.userDto import GetUser

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
    
app.include_router(authRouter)
app.include_router(busRouter)
app.include_router(routeRouter)
app.include_router(tripRouter)
app.include_router(bookingRouter)

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

@app.get('/Profile')
def getProfile(email: str = Depends(get_current_user),session: Session = Depends(getSession)):
    user: Users = session.exec(select(Users).where(Users.email == email)).first()
    return GetUser(name=user.name,email=user.email,role=user.role.value)

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