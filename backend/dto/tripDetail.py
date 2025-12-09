from pydantic import BaseModel
from models.busType import BusAirType,BusSeatType
from datetime import time

class GetTripDetails(BaseModel):
    id: int
    operator: str
    bus_id: int
    air_type: BusAirType
    seat_type: BusSeatType
    departure_time: time
    arrival_time: time
    rating: int
    price: int
    seatsAvailable: int

class AddBusTripDetail(BaseModel):
    bus_number: str
    start_city: str
    end_city: str
    departure_time: time
    arrival_time: time
    price: int
    