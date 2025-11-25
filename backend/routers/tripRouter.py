from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, text
from database import getSession
from models.Trips import Trips
from models.Buses import Buses
from dto.busDto import AddBusDetail
from dto.tripDetail import GetTripDetails, AddBusTripDetail
import routers.busRouter as bRouter
import routers.routeRouter as rRouter
import random
from typing import List

router = APIRouter(prefix="/trips", tags=['Trips'])

@router.post("/")
def addBusTripDetail(detail: AddBusTripDetail, session: Session = Depends(getSession)):
    try:
        # 1. Prepare Bus Data
        addBusDetail = AddBusDetail(
            operator=detail.operator,
            bus_number=detail.bus_number,
            air_type=detail.air_type,
            seat_type=detail.seat_type,
            total_seat=detail.total_seat,
            rating=random.randint(3, 5)
        )
        
        # 2. Add Bus 
        bRouter.addBus(addBusDetail, session)
        
        # 3. Retrieve the newly added/existing Bus
        bus_response = bRouter.getBusByNumber(detail.bus_number, session)
        bus_id = bus_response['data'].id 
        
        # 4. Retrieve Route
        route_response = rRouter.getRouteBySE(detail.start_city, detail.end_city, session)
        route_id = route_response['data'].id

        # 5. Calculate Available Seats
        seats_available = random.randint(int(detail.total_seat / 2), detail.total_seat)

        # 6. Insert Trip - FIX APPLIED HERE
        session.exec(
            text("insert into trips(bus_id,route_id,departure_time,arrival_time,price,seatsAvailable) values(:e1,:e2,:e3,:e4,:e5,:e6)"),
            params={
                'e1': bus_id,
                'e2': route_id,
                # FIX: Convert time objects to strings for SQLite
                'e3': str(detail.departure_time), 
                'e4': str(detail.arrival_time),
                'e5': detail.price,
                'e6': seats_available
            }
        )
        session.commit()
        return {"message": "trip data added", 'data': detail}

    except HTTPException as he:
        raise he
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to add trip: {str(e)}")
    
@router.get("/get")
def getBusTripDetails(start_city: str, end_city: str, session: Session = Depends(getSession)):
    try:
        busTripDetails: List[GetTripDetails] = [] # Fixed type hint
        
        # 1. Get Route ID
        route_response = rRouter.getRouteBySE(start_city, end_city, session)
        route_id = route_response['data'].id
        
        # 2. Get Trips for this Route
        data = session.exec(text("select * from trips where route_id=:rId"), params={'rId': route_id})
        trips: List[Trips] = data.all()
        
        if not trips:
             return {"message": "No trips found for this route", 'data': []}

        # 3. Build DTOs
        for trip in trips:
            # Fetch Bus Details for this trip
            bus_response = bRouter.getBusById(trip.bus_id, session)
            bus_data = bus_response['data'] # This is the Pydantic Object

            btDetail = GetTripDetails(
                id=trip.id,
                operator=bus_data.operator,
                air_type=bus_data.air_type,
                seat_type=bus_data.seat_type,
                departure_time=trip.departure_time,
                arrival_time=trip.arrival_time,
                rating=bus_data.rating,
                price=trip.price,
                seatsAvailable=trip.seatsAvailable
            )
            busTripDetails.append(btDetail)
        
        return {"message": "trip data fetched", 'data': busTripDetails}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))