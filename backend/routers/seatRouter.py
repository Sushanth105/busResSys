from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, text
from typing import List
from database import getSession
from dto.seatDto import SeatDetail
from models.Seats import Seats

router = APIRouter(prefix="/seat",tags=['Seats'])

@router.get("/{busId}")
def getSeatsByBusId(busId: int, session: Session = Depends(getSession)):
    try:
        result = session.exec(text("select * from seats where bus_id = :bId"), params={"bId": busId})
        seats: List[Seats] = result.all()
        
        if not seats:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Seats for Bus ID {busId} not found")
        
        sd: List[SeatDetail] = [SeatDetail(id=s.id,bus_id=s.bus_id,seat_label=s.seat_label) for s in seats]
        
        return {
            "message": "seats fetched",
            "data": sd
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))