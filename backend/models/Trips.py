from sqlmodel import SQLModel,Field,Relationship
from typing import Optional,List
from datetime import time

class Trips(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bus_id: int = Field(foreign_key="buses.id", nullable=False)
    route_id: int = Field(foreign_key="routes.id", nullable=False)
    departure_time: time
    arrival_time: time
    price: int
    seatsAvailable: int
     
    bus: Optional["Buses"] = Relationship(back_populates="trips") # type: ignore
    route: Optional["Routes"] = Relationship(back_populates="trips") # type: ignore
    bookings: List['Bookings'] = Relationship(back_populates='trip',cascade_delete=True) # type: ignore
    trip_seats: List["TripSeats"] = Relationship(back_populates="trip" , cascade_delete=True) # type: ignore