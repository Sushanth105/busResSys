from pydantic import BaseModel
from models.busType import BusAirType,BusSeatType

class GetBusDetail(BaseModel):
    id: int
    operator: str
    bus_number: str
    air_type: BusAirType
    seat_type: BusSeatType
    total_seat: int
    rating: float

class AddBusDetail(BaseModel):
    operator: str
    bus_number: str
    air_type: BusAirType
    seat_type: BusSeatType
    total_seat: int
    rating: float