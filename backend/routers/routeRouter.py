from fastapi import APIRouter,Depends,HTTPException,Response,Request,status
from sqlmodel import Session,text
from database import getSession
from models.Routes import Routes
from dto.routeDto import GetRouteDetail,AddRouteDetail

router = APIRouter(prefix="/routes",tags=['Routes'])

@router.get("/{routeId}")
def getRouteById(routeId: int, session: Session = Depends(getSession)):
    try:
        result = session.exec(text("select * from routes where id = :rId"), params={"rId": routeId})
        route: Routes = result.first()
        
        if not route:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Route with ID {routeId} not found")

        return {
            "message": "route fetched",
            "data": GetRouteDetail(
                id=route.id,
                start_city=route.start_city,
                end_city=route.end_city,
                distance_km=route.distance_km
            )
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
@router.get("/")
def getRouteBySE(start_city: str,end_city: str, session: Session = Depends(getSession)):
    try:
        result = session.exec(text("select * from route_details_view where start_city = :sCity and end_city = :eCity"), params={"sCity": start_city.lower(),"eCity": end_city.lower()})
        route: Routes = result.first()
        
        if not route:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Route with this destination is not found")

        return {
            "message": "route fetched",
            "data": GetRouteDetail(
                id=route.id,
                start_city=route.start_city,
                end_city=route.end_city,
                distance_km=route.distance_km
            )
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
@router.post('/add')
def addRoute(routeDeatil: AddRouteDetail, session: Session = Depends(getSession)):
    try:
        session.exec(
            text("insert into routes(start_city,end_city,distance_km) values(:e1,:e2,:e3)"),
            params={
                'e1': routeDeatil.start_city.lower(),
                'e2': routeDeatil.end_city.lower(),
                'e3': routeDeatil.distance_km,
            }
        )
        session.commit()
        return {"message": "route data added", 'data': routeDeatil}
    
    except Exception as e:
        # Important: Rollback the session if an error occurs (e.g., duplicate entry)
        session.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to add route: {str(e)}")