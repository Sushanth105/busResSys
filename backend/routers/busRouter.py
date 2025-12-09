from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, text
from database import getSession
from models.Buses import Buses
from dto.busDto import GetBusDetail, AddBusDetail
import random

router = APIRouter(prefix="/buses", tags=['Buses'])

@router.get('/{busId}')
def getBusById(busId: int, session: Session = Depends(getSession)):
    try:
        result = session.exec(text("select * from buses where id = :bId"), params={"bId": busId})
        bus: Buses = result.first()

        # Check if bus exists before accessing attributes
        if not bus:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bus with ID {busId} not found")

        return {
            "message": "bus fetched",
            "data": GetBusDetail(
                id=bus.id,
                operator=bus.operator,
                bus_number=bus.bus_number,
                air_type=bus.air_type,
                seat_type=bus.seat_type,
                total_seat=bus.total_seat,
                rating=bus.rating
            )
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get('/number/{busNumber}') 
def getBusByNumber(busNumber: str, session: Session = Depends(getSession)):
    try:
        result = session.exec(text("select * from buses where bus_number = :bNumber"), params={"bNumber": busNumber})
        bus: Buses = result.first()

        # Check if bus exists
        if not bus:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bus number {busNumber} not found")

        return {
            "message": "bus fetched",
            "data": GetBusDetail(
                id=bus.id,
                operator=bus.operator,
                bus_number=bus.bus_number,
                air_type=bus.air_type,
                seat_type=bus.seat_type,
                total_seat=bus.total_seat,
                rating=bus.rating
            )
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post('/add')
def addBus(busDeatil: AddBusDetail, session: Session = Depends(getSession)):
    try:
        session.exec(
            text("insert into buses(operator,bus_number,air_type,seat_type,total_seat,rating) values(:e1,:e2,:e3,:e4,:e5,:e6)"),
            params={
                'e1': busDeatil.operator,
                'e2': busDeatil.bus_number,
                'e3': busDeatil.air_type,
                'e4': busDeatil.seat_type,
                'e5': busDeatil.total_seat,
                'e6': busDeatil.rating
            }
        )
        session.commit()
    
        count = busDeatil.total_seat
        i=1
        while(count > 0):
            rand = random.randint(1, 2)
            if count == 1 or rand == 1 :
                seat_label = f"{i}A"
                i+=1
                count-=1
                session.exec(
                    text("insert into seats(seat_label,bus_id) values(:sLabel,(select id from buses where bus_number=:bNumber))"),
                    params={
                        'sLabel': seat_label,
                        'bNumber': busDeatil.bus_number
                    }
                )
            else:
                seat_label1 = f"{i}A"
                seat_label2 = f"{i}B"
                i+=1
                count-=2
                session.exec(
                    text("insert into seats(seat_label,bus_id) values(:sLabel1,(select id from buses where bus_number=:bNumber))"),
                    params={
                        'sLabel1': seat_label1,
                        'bNumber': busDeatil.bus_number
                    }
                )
                session.exec(
                    text("insert into seats(seat_label,bus_id) values(:sLabel2,(select id from buses where bus_number=:bNumber))"),
                    params={
                        'sLabel2': seat_label2,
                        'bNumber': busDeatil.bus_number
                    }
                )
        session.commit()
    
        return {"message": "bus data added", 'data': busDeatil}
    except Exception as e:
        # Important: Rollback the session if an error occurs (e.g., duplicate entry)
        session.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to add bus: {str(e)}")
    