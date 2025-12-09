from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, text
from typing import List
from database import getSession
from dto.tripSeatDto import TripSeatDetail
from models.TripSeats import TripSeats

router = APIRouter(prefix="/tripSeat",tags=['TripSeats'])

@router.get("/{tripId}")
def getTripSeatsByTripId(tripId: int, session: Session = Depends(getSession)):
    try:
        result = session.exec(text("select * from tripseats where trip_id = :tId"), params={"tId": tripId})
        trip_seats: List[TripSeats] = result.all()
        
        if not trip_seats:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"TripSeats for Trip ID {tripId} not found")
        
        tsd: List[TripSeatDetail] = [TripSeatDetail(id=ts.id, trip_id=ts.trip_id, seat_id=ts.seat_id) for ts in trip_seats]
        
        return {
            "message": "trip seats fetched",
            "data": tsd
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))