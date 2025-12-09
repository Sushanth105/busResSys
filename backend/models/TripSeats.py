from sqlmodel import SQLModel,Field,Relationship
from typing import Optional

class TripSeats(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    trip_id: int = Field(foreign_key="trips.id", nullable=False)
    seat_id: int = Field(foreign_key="seats.id", nullable=False)
    
    trip: Optional["Trips"] = Relationship(back_populates="trip_seats") # type: ignore
    seat: Optional["Seats"] = Relationship(back_populates="trip_seats") # type: ignore
    booking: Optional["Bookings"] = Relationship(back_populates="trip_seat") # type: ignore