from fastapi import APIRouter,Depends,HTTPException,Response,Request
from sqlmodel import Session,select
from database import getSession
from models.Users import Users
from models.userRole import UserRole
from models.RefreshToken import RefreshToken
from dto.userDto import UserCreate,UserLogin
from utils.authUtil import create_access_token,create_refresh_token,hash_password,verify_password,verify_token

router = APIRouter()

def get_current_user(request: Request ):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Access token missing")
    
    return verify_token(token)

@router.post("/register")
def register(user: UserCreate,session: Session = Depends(getSession)):
    existing_user = session.exec(select(Users).where(Users.email == user.email)).first()
    if existing_user :
        if(not existing_user.password):
            existing_user.password = hash_password(user.password)
            session.add(existing_user)
            session.commit()
            session.refresh(existing_user)
            return {'message' : 'User registered success!!'}
        else:
            raise HTTPException(status_code=400, detail="Username already exists")
    role: UserRole  = UserRole.USER if user.role == 'user' else UserRole.ADMIN
    dbUser = Users(name=user.name,email=user.email,password=hash_password(user.password),role=role)
    session.add(dbUser)
    session.commit()
    session.refresh(dbUser)
    return {'message' : 'User registered success!!'}

@router.post("/login")
def login(user: UserLogin , response: Response, session: Session = Depends(getSession)):
    db_user = session.exec(select(Users).where(Users.email == user.email)).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    aToken = create_access_token({'sub' : db_user.email})
    rToken = create_refresh_token({'sub' : db_user.email})
    
    existing_rToken = session.exec(select(RefreshToken).where(RefreshToken.email == user.email)).first()
    
    if existing_rToken:
        existing_rToken.token = hash_password(rToken)
        session.add(existing_rToken)
        session.commit()
        session.refresh(existing_rToken)
    else:
        newRToken = RefreshToken(email=user.email,token=hash_password(rToken))
        session.add(newRToken)
        session.commit()
        session.refresh(newRToken)
        
    
    response.set_cookie(
        key="access_token",
        value=aToken,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=15*60
    )
    
    response.set_cookie(
        key="refresh_token",
        value=rToken,
        httponly=True,
        secure=True,
        path="/refresh",
        samesite="none",
        max_age=60*60*24*7
    )
    
    return {"message" : "Login successful","data" : {'id' : db_user.id,'name' : db_user.name, 'email' : db_user.email}}

@router.post("/refresh")
def refresh(request: Request , response: Response,session: Session = Depends(getSession)):
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token"
        )
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    email = verify_token(refresh_token)
    
    existing_rToken = session.exec(select(RefreshToken).where(RefreshToken.email == email)).first()
    
    if existing_rToken is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token"
        )
        
    if not verify_password(refresh_token,existing_rToken.token) :
        raise HTTPException(status_code=401, detail="Unauthorised Refresh token")
    
    aToken = create_access_token({'sub' : email})
    rToken = create_refresh_token({'sub' : email})
    
    existing_rToken.token = hash_password(rToken)
    session.add(existing_rToken)
    session.commit()
    session.refresh(existing_rToken)
    
    response.set_cookie(
        key="access_token",
        value=aToken,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=15*60
    )
    
    response.set_cookie(
        key="refresh_token",
        value=rToken,
        httponly=True,
        secure=True,
        path="/refresh",
        samesite="none",
        max_age=60*60*24*7
    )
    
    return {'message' : "Refreshing the token is Success"}

@router.post("/logout")
def logout(response : Response):
    response.set_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="none",
    )
    
    response.set_cookie(
        key="refresh_token",
        httponly=True,
        secure=True,
        path="/refresh",
        samesite="none",
    )
    
    return {'message' : "LogOut Success"}
