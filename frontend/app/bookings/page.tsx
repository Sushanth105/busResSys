"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BusFront, Clock, Ticket, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- Types ---

interface BackendBooking {
  id: number;
  booking_status: string;
  operator: string;
  air_type: string;
  seat_type: string;
  start_city: string;
  end_city: string;
  date: string;
  departure_time: string;
  arrival_time: string;
  total_price: number;
  passenger_count: number;
}

interface UIBooking {
  id: number;
  status: string;
  operator: string;
  busType: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  seatNumbers: string[];
  totalAmount: number;
  pnr: string;
  passengerCount: number;
}

const API_BASE_URL = "http://localhost:8000"; 

const MyBookingsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState<UIBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // --- Helpers for Date Formatting ---
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return dateString; }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      if(isNaN(date.getTime())) {
        return timeString.slice(0, 5); 
      }
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) { return timeString; }
  };

  // --- API Integration ---

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let response = await fetch(`${API_BASE_URL}/booking/get`,{
        method: 'GET',
        credentials: 'include'
      });

      if (response.status === 403 || response.status === 401) {
        const refreshRes = await fetch("http://localhost:8000/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!refreshRes.ok) {
          router.push("/login");
          return;
        }

        response = await fetch(`${API_BASE_URL}/booking/get`,{
          method: 'GET',
          credentials: 'include'
        });
      }
      
      if (!response.ok) throw new Error("Failed to fetch bookings");
      
      const result = await response.json();
      
      const mappedData: UIBooking[] = result.data.map((item: BackendBooking) => ({
        id: item.id,
        status: item.booking_status.toLowerCase(),
        operator: item.operator,
        busType: `${item.air_type} ${item.seat_type}`,
        from: item.start_city,
        to: item.end_city,
        date: formatDate(item.date),
        departureTime: formatTime(item.departure_time),
        arrivalTime: formatTime(item.arrival_time),
        totalAmount: item.total_price,
        passengerCount: item.passenger_count,
        seatNumbers: ["--"], 
        pnr: `PNR-${item.id}${Math.floor(Math.random() * 1000)}`
      }));

      setBookings(mappedData);
    } catch (err) {
      console.error(err);
      setError("Could not load booking history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- Actions ---

  const handleCancelTicket = async (bookingId: number) => {
    if(!confirm("Are you sure you want to cancel this ticket? This action cannot be undone.")) return;

    try {
      let response = await fetch(`${API_BASE_URL}/booking/cancel/${bookingId}`, {
        method: 'POST', 
        credentials: 'include'
      });

      if (response.status === 403 || response.status === 401) {
           const refreshRes = await fetch("http://localhost:8000/refresh", { method: "POST", credentials: "include" });
           if (!refreshRes.ok) { router.push("/login"); return; }
           response = await fetch(`${API_BASE_URL}/booking/cancel/${bookingId}`, {
              method: 'POST', 
              credentials: 'include'
          });
        }

      if (response.ok) {
        alert("Ticket cancelled successfully.");
        fetchBookings(); 
      } else {
        const err = await response.json();
        alert(`Failed to cancel: ${err.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert("Network error while cancelling ticket.");
    }
  };

  // --- Rendering Logic ---

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'upcoming') return booking.status === 'upcoming';
    return booking.status === 'completed' || booking.status === 'cancelled';
  });

  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'upcoming':
        return <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-bold flex items-center"><Clock size={12} className="mr-1"/> UPCOMING</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold flex items-center"><CheckCircle size={12} className="mr-1"/> COMPLETED</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-bold flex items-center"><AlertCircle size={12} className="mr-1"/> CANCELLED</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 1. Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="text-gray-600" size={24} />
          </Link>
          <div className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">My Bookings</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* 2. Tabs */}
        <div className="flex space-x-2 bg-white p-1 rounded-xl shadow-sm mb-6 w-fit mx-auto md:mx-0">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'upcoming' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            History
          </button>
        </div>

        {/* 3. Content Area */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">
            <AlertCircle className="mx-auto mb-2" size={32} />
            <p>{error}</p>
            <button onClick={fetchBookings} className="mt-4 text-blue-600 underline">Try Again</button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-transparent hover:border-blue-200 transition-all duration-300">
                  
                  {/* Card Header */}
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-900">{booking.operator}</h3>
                      <p className="text-xs text-gray-500 capitalize">{booking.busType}</p>
                    </div>
                    {renderStatusBadge(booking.status)}
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                      
                      {/* Route Info */}
                      <div className="flex items-center w-full md:w-auto flex-1">
                        <div className="text-center md:text-left min-w-[80px]">
                          <p className="text-2xl font-bold text-gray-800">{booking.departureTime}</p>
                          <p className="text-sm font-medium text-gray-600 capitalize">{booking.from}</p>
                        </div>
                        
                        <div className="flex-1 px-4 flex flex-col items-center">
                          <span className="text-xs text-gray-400 mb-1">{booking.date}</span>
                          <div className="w-full h-[2px] bg-gray-200 relative flex items-center justify-between">
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                            <BusFront size={16} className="text-gray-400" />
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          </div>
                        </div>

                        <div className="text-center md:text-right min-w-[80px]">
                          <p className="text-2xl font-bold text-gray-800">{booking.arrivalTime}</p>
                          <p className="text-sm font-medium text-gray-600 capitalize">{booking.to}</p>
                        </div>
                      </div>

                      {/* Divider for Mobile */}
                      <div className="w-full h-[1px] bg-gray-100 md:hidden"></div>

                      {/* Meta Info */}
                      <div className="flex flex-row md:flex-col justify-between w-full md:w-auto gap-4 md:gap-1 text-sm">
                          <div className="flex items-center text-gray-600">
                             <span className="font-semibold mr-2">Seat No:</span> 
                             <span className="text-gray-900 font-bold">{booking.seatNumbers.join(", ")}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                             <span className="font-semibold mr-2">PNR:</span> 
                             <span className="text-gray-900">{booking.pnr}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                             <span className="font-semibold mr-2">Total:</span> 
                             <span className="text-blue-600 font-bold">₹{booking.totalAmount}</span>
                          </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Actions (Only shown for Upcoming tickets now) */}
                  {booking.status === 'upcoming' && (
                    <div className="px-6 py-3 border-t border-dashed border-gray-200 flex flex-wrap gap-3 justify-end bg-gray-50/50">
                      <button 
                        onClick={() => handleCancelTicket(booking.id)}
                        className="text-sm text-red-500 font-semibold hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}

                </div>
              ))
            ) : (
              // Empty State
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-500 mb-6">You haven&apos;t made any bookings in this category yet.</p>
                <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                  Book a Ticket Now
                </Link>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default MyBookingsPage;