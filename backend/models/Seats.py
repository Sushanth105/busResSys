from sqlmodel import SQLModel,Field,Relationship
from typing import Optional,List

class Seats(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bus_id: int = Field(foreign_key="buses.id", nullable=False)
    seat_label: str = Field(max_length=100)
    
    bus: Optional["Buses"] = Relationship(back_populates="seats") # type: ignore
    trip_seats: List["TripSeats"] = Relationship(back_populates="seat" , cascade_delete=True) # type: ignore