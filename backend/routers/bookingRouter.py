from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, text
from database import getSession
from dto.busDto import GetBusDetail
from dto.routeDto import GetRouteDetail
from models.Trips import Trips
from models.Bookings import Bookings
from models.Users import Users
from models.bookingStatus import BookingStatus
from dto.bookingDto import AddBookingDetail, CompleteBookingDetail
from routers.authApi import get_current_user
import routers.busRouter as bRouter
import routers.routeRouter as rRouter
from typing import List

router = APIRouter(prefix="/booking", tags=['Booking'])

@router.post("/add")
def addBooking(
    detail: List[AddBookingDetail],
    session: Session = Depends(getSession),
    email: str = Depends(get_current_user)
):
    try:
        # This is fine because it is a SQLModel select
        user = session.exec(
            select(Users).where(Users.email == email)
        ).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        for d in detail:
            # 1. Check if already booked
            # Use session.execute() for raw SQL with parameters
            seat_exists = session.execute(
                text("""
                SELECT id FROM tripseats 
                WHERE seat_id = :s AND trip_id = :t
                """),
                params={"s": d.seat_id, "t": d.trip_id}
            ).first()

            if seat_exists:
                raise HTTPException(
                    status_code=400,
                    detail=f"Seat {d.seat_id} is already booked for trip {d.trip_id}"
                )

            # 2. Insert TripSeat and RETURN ID
            # Use session.execute()
            trip_seat_id = session.execute(
                text("""
                INSERT INTO tripseats(seat_id, trip_id)
                VALUES (:s, :t)
                RETURNING id
                """),
                params={"s": d.seat_id, "t": d.trip_id}
            ).one()[0]
            # Get seat label for booking record
            sl = session.exec(
                text("select seat_label from seats where id = :sId"),
                params={"sId": d.seat_id}
            ).first().seat_label

            # 3. Insert booking
            # Use session.execute()
            session.execute(
                text("""
                INSERT INTO bookings(user_id, trip_id, trip_seat_id,seat_label, price, date, booking_status)
                VALUES (:u, :t, :ts,:sl, :p, :d, :bs)
                """),
                params={
                    "u": user.id,
                    "t": d.trip_id,
                    "ts": trip_seat_id,
                    "sl": sl,
                    "p": d.price,
                    "d": datetime.now(),
                    "bs": BookingStatus.UPCOMING.value
                }
            )

        # Commit ONCE (atomic)
        session.commit()

        return {"message": "Booking data added", "data": detail}

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        # It's good practice to log the error here
        print(f"Error: {e}") 
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add booking: {str(e)}"
        )



@router.get('/get')
def getBooking(email:str = Depends(get_current_user),session: Session = Depends(getSession)):
    try:
        
        user = session.exec(
            select(Users).where(Users.email == email)
        ).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        data: List[Bookings] = session.exec(
            text("select * from bookings where user_id=:uId"),
            params={'uId': user.id}
            ).all()
        
        bookingDetail: List[CompleteBookingDetail] = []
        
        for d in data:
            trip: Trips = session.exec(text("select * from trips where id=:tId"), params={'tId': d.trip_id}).first()
            
            if not trip:
                continue # Skip if trip data is missing
            
            bus_response = bRouter.getBusById(trip.bus_id, session)
            bus: GetBusDetail = bus_response['data']
            
            route_response = rRouter.getRouteById(trip.route_id, session)
            route: GetRouteDetail = route_response['data']
            
            cBDetail = CompleteBookingDetail(
                id=d.id,
                booking_status=d.booking_status,
                operator=bus.operator,
                air_type=bus.air_type,
                seat_type=bus.seat_type,
                start_city=route.start_city,
                end_city=route.end_city,
                date=d.date,
                departure_time=trip.departure_time,
                arrival_time=trip.arrival_time,
                price=d.price,
                seat_label=d.seat_label
            )
            
            bookingDetail.append(cBDetail)
            
        return {"message": "Booking data fetched", 'data': bookingDetail}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
@router.post("/cancel/{bId}")
def cancelBook(bId: int, session: Session = Depends(getSession),email: str = Depends(get_current_user)):
    # Execute the raw update query
    result = session.exec(
        text("UPDATE bookings SET booking_status = :status WHERE id = :bId"),
        params={
            "status": BookingStatus.CANCELLED.value, # Fixed typo: CACELLED -> CANCELLED
            "bId": bId
        }
    )
    
    session.exec(
        text("delete from tripseats where id = (select trip_seat_id from bookings where id = :bId)"),
        params={"bId": bId}
    )
    
    session.commit()

    # Check if the database actually found and updated a row
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Booking ID {bId} not found."
        )

    return {"message": "Booking cancelled successfully"}