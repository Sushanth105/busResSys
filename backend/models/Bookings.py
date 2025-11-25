from sqlmodel import SQLModel,Field,Relationship
from typing import Optional
from models.bookingStatus import BookingStatus
from datetime import datetime

class Bookings(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    user_id: int = Field(foreign_key="users.id", nullable=False)
    trip_id: int = Field(foreign_key="trips.id", nullable=False)
    
    total_price: int
    passenger_count: int
    date: datetime = Field(default_factory=datetime.utcnow)
    
    booking_status: BookingStatus = Field(default=BookingStatus.UPCOMING)
    
    user: Optional["Users"] = Relationship(back_populates="bookings") # type: ignore
    trip: Optional["Trips"] = Relationship(back_populates="bookings") # type: ignore