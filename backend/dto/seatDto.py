from pydantic import BaseModel

class SeatDetail(BaseModel):
    id: int
    bus_id: int
    seat_label: str