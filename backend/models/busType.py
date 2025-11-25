from enum import Enum

class BusAirType(str, Enum):
    AC = "AC"
    NON_AC = "NON_AC"
    
class BusSeatType(str, Enum):   # Use `str` for JSON compatibility in FastAPI
    SLEEPER = "Sleeper"
    SEATER = "Seater"