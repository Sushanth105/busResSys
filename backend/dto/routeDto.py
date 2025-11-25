from pydantic import BaseModel

class GetRouteDetail(BaseModel):
    id: int
    start_city: str
    end_city: str
    distance_km: int

class AddRouteDetail(BaseModel):
    start_city: str
    end_city: str
    distance_km: int