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
    detail: AddBookingDetail, 
    session: Session = Depends(getSession),
    email: str = Depends(get_current_user)
):
    try:
        # 1. Get User (Keep this ORM as per your snippet)
        user = session.exec(select(Users).where(Users.email == email)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # 2. GET TRIP DATA FIRST (Validation)
        # We must check if seats are available BEFORE we insert the booking.
        # Using raw SQL as requested.
        trip_row = session.exec(
            text("select seatsAvailable from trips where id=:tId"),
            params={'tId': detail.trip_id}
        ).first()

        if not trip_row:
            raise HTTPException(status_code=404, detail="Trip not found")

        # Access the column from the raw row
        current_seats = trip_row.seatsAvailable 

        if current_seats < detail.passenger_count:
            raise HTTPException(status_code=400, detail="Not enough seats available")

        # 3. INSERT BOOKING (Raw SQL)
        session.exec(
            text("insert into bookings(user_id, trip_id, total_price, passenger_count, date, booking_status) values(:e1, :e2, :e3, :e4, :e5, :e6)"),
            params={
                'e1': user.id,
                'e2': detail.trip_id,
                'e3': detail.price * detail.passenger_count,
                'e4': detail.passenger_count,
                'e5': datetime.now(),
                'e6': BookingStatus.UPCOMING.value # Ensure we insert the value (string), not the Enum object
            }
        )

        # 4. UPDATE TRIPS (Raw SQL)
        # We update the seats using the value we fetched earlier.
        session.exec(
            text("Update trips set seatsAvailable=:data where id=:tId"),
            params={
                'data': current_seats - detail.passenger_count,
                'tId': detail.trip_id
            }
        )

        # 5. COMMIT FINAL TRANSACTION
        # Only commit AFTER both the Insert and Update are successful.
        session.commit()
        
        return {"message": "Booking data added", 'data': detail}
    
    except HTTPException as he:
        # Re-raise HTTP exceptions (like 400 or 404) so the frontend gets the right message
        raise he
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to add booking: {str(e)}")


@router.get('/get')
def getBooking(session: Session = Depends(getSession),email: str = Depends(get_current_user)):
    try:
        data: List[Bookings] = session.exec(text("select * from bookings")).all()
        
        bookingDetail: List[CompleteBookingDetail] = []
        
        for b in data:
            trip: Trips = session.exec(text("select * from trips where id=:tId"), params={'tId': b.trip_id}).first()
            
            if not trip:
                continue # Skip if trip data is missing
            
            bus_response = bRouter.getBusById(trip.bus_id, session)
            bus: GetBusDetail = bus_response['data']
            
            route_response = rRouter.getRouteById(trip.route_id, session)
            route: GetRouteDetail = route_response['data']
            
            cBDetail = CompleteBookingDetail(
                id=b.id,
                booking_status=b.booking_status,
                operator=bus.operator,
                air_type=bus.air_type,
                seat_type=bus.seat_type,
                start_city=route.start_city,
                end_city=route.end_city,
                date=b.date,
                departure_time=trip.departure_time,
                arrival_time=trip.arrival_time,
                total_price=b.total_price,
                passenger_count=b.passenger_count
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
    
    session.commit()

    # Check if the database actually found and updated a row
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Booking ID {bId} not found."
        )

    return {"message": "Booking cancelled successfully"}