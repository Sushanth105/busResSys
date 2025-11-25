from pydantic import BaseModel
from models.bookingStatus import BookingStatus
from models.busType import BusAirType, BusSeatType
from datetime import datetime,time

class AddBookingDetail(BaseModel):
    trip_id: int
    passenger_count: int
    price: int
    
class CompleteBookingDetail(BaseModel):
    id: int
    booking_status: BookingStatus
    operator: str
    air_type: BusAirType
    seat_type: BusSeatType
    start_city: str
    end_city: str
    date: datetime
    departure_time: time
    arrival_time: time
    total_price: int
    passenger_count: int