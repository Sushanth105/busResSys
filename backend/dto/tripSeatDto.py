from pydantic import BaseModel

class TripSeatDetail(BaseModel):
    id: int
    trip_id: int
    seat_id: int