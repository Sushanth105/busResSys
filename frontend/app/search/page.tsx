"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, BusFront, Star, Wifi, Coffee, BatteryCharging, 
  Loader2, AlertCircle, X, CheckCircle, Ticket, Armchair
} from 'lucide-react';
import Link from 'next/link';

// --- Interfaces ---

interface Bus {
  id: number;          // This is the TRIP ID
  bus_id: number;      // We need the actual BUS ID to fetch seat layout
  operator: string;
  air_type: string;     
  seat_type: string;    
  departure_time: string; 
  arrival_time: string;  
  rating: number;
  price: number;
  seatsAvailable: number;
}

interface Seat {
  id: number;
  bus_id: number;
  seat_label: string;
}

interface BookedSeat {
  id: number;
  trip_id: number;
  seat_id: number;
}

interface ApiResponse {
  message: string;
  data: Bus[];
}

const API_BASE_URL = "http://localhost:8000";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const fromCity = searchParams.get('from') || 'Mangalore';
  const toCity = searchParams.get('to') || 'Bangalore';
  const date = searchParams.get('date') || 'Today';

  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // --- Booking Modal State ---
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  
  // Seat States
  const [allSeats, setAllSeats] = useState<Seat[]>([]);
  const [bookedSeatIds, setBookedSeatIds] = useState<number[]>([]); // IDs of seats already taken
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]); // IDs of seats user is selecting
  const [seatsLoading, setSeatsLoading] = useState(false);

  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState<string>("");

  // --- 1. Fetch Buses ---
  useEffect(() => {
    const fetchBuses = async () => {
      setLoading(true);
      setError(null);
      try {
        let response = await fetch(`${API_BASE_URL}/trips/get?start_city=${fromCity}&end_city=${toCity}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
        });

        if (response.status === 403 || response.status === 401) {
           const refreshRes = await fetch(`${API_BASE_URL}/refresh`, { method: "POST", credentials: "include" });
           if (!refreshRes.ok) { router.push("/login"); return; }
           response = await fetch(`${API_BASE_URL}/trips/get?start_city=${fromCity}&end_city=${toCity}`, {
               method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: "include",
           });
        }
        
        if (!response.ok) throw new Error('Failed to fetch buses');
        const jsonData: ApiResponse = await response.json();
        setBuses(jsonData.data); 
      } catch (err) {
        console.error(err);
        setError("Unable to load buses. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, [fromCity, toCity, date, router]);

  // --- 2. Filter & Sort Logic ---
  const handleFilterChange = (filterType: string) => {
    setSelectedFilters(prev => {
      if (prev.includes(filterType)) return prev.filter(f => f !== filterType);
      return [...prev, filterType];
    });
  };

  const displayBuses = useMemo(() => {
    let result = [...buses];

    if (selectedFilters.length > 0) {
      result = result.filter(bus => {
        const airFilters = selectedFilters.filter(f => ['AC', 'Non-AC'].includes(f));
        const seatFilters = selectedFilters.filter(f => ['Sleeper', 'Seater'].includes(f));
        const matchesAir = airFilters.length === 0 || airFilters.includes(bus.air_type);
        const matchesSeat = seatFilters.length === 0 || seatFilters.includes(bus.seat_type);
        return matchesAir && matchesSeat;
      });
    }

    if (sortBy === 'price_low') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_high') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [buses, selectedFilters, sortBy]);

  // --- 3. Booking Logic ---

  const openBookingModal = async (bus: Bus) => {
    setSelectedBus(bus);
    setBookingStatus('idle');
    setBookingError("");
    setAllSeats([]);
    setBookedSeatIds([]);
    setSelectedSeatIds([]);
    setSeatsLoading(true);

    try {
        // A. Fetch All Seats for this Bus
        // Note: Assuming `bus.bus_id` exists. If the previous API only returns `id` (trip_id), 
        // ensure the backend also sends `bus_id` in the trip details.
        const seatRes = await fetch(`${API_BASE_URL}/seat/${bus.bus_id}`, { credentials: "include" });
        if(!seatRes.ok) throw new Error("Failed to load seat map");
        const seatData = await seatRes.json();
        setAllSeats(seatData.data || []);

        // B. Fetch Booked Seats for this Trip
        const bookedRes = await fetch(`${API_BASE_URL}/tripSeat/${bus.id}`, { credentials: "include" });
        
        if (bookedRes.status === 404) {
            // No seats booked yet
            setBookedSeatIds([]);
        } else if (bookedRes.ok) {
            const bookedData = await bookedRes.json();
            // Extract just the seat_ids from the response
            const bookedIds = (bookedData.data || []).map((item: BookedSeat) => item.seat_id);
            setBookedSeatIds(bookedIds);
        } else {
            // Handle other errors gracefully
            console.error("Error fetching booked seats");
        }

    } catch (err) {
        setBookingError("Could not load seat map. Please try again.");
    } finally {
        setSeatsLoading(false);
    }
  };

  const closeBookingModal = () => {
    if (bookingStatus === 'submitting') return;
    setSelectedBus(null);
  };

  const toggleSeatSelection = (seatId: number) => {
      setSelectedSeatIds(prev => {
          if (prev.includes(seatId)) {
              return prev.filter(id => id !== seatId);
          } else {
              // Optional: Limit max seats (e.g., max 6 per booking)
              if (prev.length >= 6) return prev; 
              return [...prev, seatId];
          }
      });
  };

  const handleConfirmBooking = async () => {
    if (!selectedBus || selectedSeatIds.length === 0) return;

    setBookingStatus('submitting');
    setBookingError("");

    // Prepare Payload: Array of objects
    const payload = selectedSeatIds.map(seatId => ({
        trip_id: selectedBus.id,
        price: selectedBus.price,
        seat_id: seatId
    }));

    try {
      let response = await fetch(`${API_BASE_URL}/booking/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.status === 403 || response.status === 401) {
           const refreshRes = await fetch(`${API_BASE_URL}/refresh`, { method: "POST", credentials: "include" });
           if (!refreshRes.ok) { router.push("/login"); return; }
           
           // Retry
           response = await fetch(`${API_BASE_URL}/booking/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
          });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Booking failed");
      }

      setBookingStatus('success');
      
    } catch (err: unknown) {
      setBookingStatus('error');
      if (err instanceof Error) {
        setBookingError(err.message);
      } else {
        setBookingError("An error occurred while booking.");
      }
    }
  };

  // --- Helpers ---
  const formatTime = (timeString: string) => timeString ? timeString.substring(0, 5) : "--:--";
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return "";
    const parseTime = (t: string) => {
      const [h, m] = t.substring(0, 5).split(':').map(Number);
      return h * 60 + m;
    };
    const startMins = parseTime(start);
    const endMins = parseTime(end);
    let diff = endMins - startMins;
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };

  const renderAmenityIcon = (index: number) => {
    const icons = [
      <Wifi size={14} className="text-gray-500" key="wifi" />,
      <BatteryCharging size={14} className="text-gray-500" key="charge" />,
      <Coffee size={14} className="text-gray-500" key="water" />
    ];
    return icons.slice(0, (index % 3) + 1); 
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="text-gray-600" size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <BusFront className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 hidden md:block">BusGo</span>
            </div>
          </div>
          <div className="flex-1 mx-4 md:mx-12 text-center">
            <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
              <span className="font-bold text-gray-900">{fromCity}</span>
              <span className="mx-2 text-gray-400">→</span>
              <span className="font-bold text-gray-900">{toCity}</span>
              <span className="mx-3 text-gray-300">|</span>
              <span className="text-gray-600 font-medium">{date}</span>
              <Link href="/">
                <button className="ml-4 text-xs text-blue-600 font-bold hover:underline uppercase">Modify</button>
              </Link>
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          <aside className="w-full lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Filters</h3>
                <button 
                  onClick={() => setSelectedFilters([])}
                  className="text-xs text-blue-600 cursor-pointer uppercase font-bold hover:underline"
                >
                  Clear All
                </button>
              </div>
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-3 text-gray-500 uppercase">Bus Type</h4>
                <div className="space-y-2">
                  {['AC', 'Non-AC', 'Sleeper', 'Seater'].map((type) => (
                    <label key={type} className="flex items-center space-x-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.includes(type)}
                        onChange={() => handleFilterChange(type)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4" 
                      />
                      <span className="text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="w-full lg:w-3/4">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4 flex justify-between items-center">
              <span className="font-bold text-gray-700">
                {loading ? 'Searching...' : `${displayBuses.length} Buses found`}
              </span>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">Sort by:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-none font-bold text-gray-900 focus:ring-0 cursor-pointer bg-transparent"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_low">Cheapest First</option>
                  <option value="price_high">Price High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500">Fetching available buses...</p>
              </div>
            )}

            {!loading && error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 flex flex-col items-center">
                <AlertCircle className="h-10 w-10 mb-2" />
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && displayBuses.length === 0 && (
              <div className="bg-white rounded-xl p-10 text-center text-gray-500">
                <p>No buses found matching your criteria.</p>
              </div>
            )}

            <div className="space-y-4">
              {!loading && displayBuses.map((bus) => (
                <div key={bus.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-transparent hover:border-blue-100">
                  <div className="p-5 flex flex-col md:flex-row gap-4 md:gap-0">
                    
                    <div className="md:w-1/3 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          {bus.operator}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                           {bus.air_type} {bus.seat_type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                          {renderAmenityIcon(bus.id)}
                          <span className="text-xs text-gray-400">Live Tracking</span>
                      </div>
                    </div>

                    <div className="md:w-1/3 flex items-center justify-center md:justify-start">
                      <div className="flex items-center w-full">
                        <div className="text-center">
                           <p className="text-xl font-bold text-gray-800">{formatTime(bus.departure_time)}</p>
                           <p className="text-xs text-gray-500">{fromCity}</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center px-4">
                          <span className="text-xs text-gray-400 mb-1">
                            {calculateDuration(bus.departure_time, bus.arrival_time)}
                          </span>
                          <div className="w-full h-[2px] bg-gray-300 relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-400"></div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-400"></div>
                          </div>
                        </div>
                        <div className="text-center">
                           <p className="text-xl font-bold text-gray-800">{formatTime(bus.arrival_time)}</p>
                           <p className="text-xs text-gray-500">{toCity}</p>
                        </div>
                      </div>
                    </div>

                    <div className="md:w-1/3 flex flex-col items-end justify-between border-l-0 md:border-l md:pl-6 border-gray-100">
                      <div className="text-right mb-2 md:mb-0">
                          <p className="text-sm text-gray-400">Starting from</p>
                          <p className="text-2xl font-bold text-gray-900">₹ {bus.price}</p>
                      </div>
                      
                      <div className="flex flex-col items-end w-full gap-2">
                        <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold flex items-center">
                          <Star size={10} className="mr-1 fill-current" />
                          {bus.rating}
                        </div>
                        
                        <button 
                          onClick={() => openBookingModal(bus)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
                        >
                          Select Seats
                        </button>
                        <p className={`text-xs font-medium ${bus.seatsAvailable < 5 ? 'text-red-500' : 'text-gray-500'}`}>
                          {bus.seatsAvailable} Seats left
                        </p>
                      </div>
                    </div>

                  </div>
                  
                  <div className="bg-gray-50 px-5 py-2 border-t border-gray-100 flex justify-end items-center gap-4 text-xs text-blue-600 font-medium">
                      <button className="hover:underline">Boarding & Dropping Points</button>
                      <button className="hover:underline">Cancellation Policy</button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* --- BOOKING MODAL --- */}
      {selectedBus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold">Select Seats</h2>
                <p className="text-blue-100 text-sm mt-1">{selectedBus.operator} - {selectedBus.air_type} {selectedBus.seat_type}</p>
              </div>
              <button 
                onClick={closeBookingModal}
                className="p-2 bg-blue-500 hover:bg-blue-400 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {bookingStatus === 'success' ? (
                // Success View
                <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                  <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-500 mb-8 max-w-sm">
                    Your tickets for {selectedSeatIds.length} passenger(s) have been booked successfully.
                  </p>
                  <button 
                    onClick={closeBookingModal}
                    className="bg-gray-900 text-white font-bold py-3 px-12 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                // Selection View
                <div className="flex flex-col md:flex-row gap-8 h-full">
                  
                  {/* Left: Seat Map */}
                  <div className="flex-1 border-r border-gray-100 pr-0 md:pr-6">
                     <h4 className="text-sm font-bold text-gray-500 uppercase mb-4 text-center">Lower Deck</h4>
                     
                     {seatsLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="animate-spin text-blue-600"/>
                        </div>
                     ) : (
                         <div className="flex justify-center">
                            {/* Simple Grid Layout for Seats (4 columns) */}
                            <div className="grid grid-cols-4 gap-x-4 gap-y-4 max-w-[240px]">
                                {allSeats.map((seat, index) => {
                                    const isBooked = bookedSeatIds.includes(seat.id);
                                    const isSelected = selectedSeatIds.includes(seat.id);
                                    
                                    // Add aisle spacer after every 2 seats if needed by layout logic
                                    // For simplicity, we just use grid-cols-4. 
                                    // CSS Grid automatically handles the rows.
                                    
                                    return (
                                        <button
                                            key={seat.id}
                                            disabled={isBooked}
                                            onClick={() => toggleSeatSelection(seat.id)}
                                            className={`
                                                relative w-10 h-10 rounded-lg flex items-center justify-center border transition-all
                                                ${isBooked 
                                                    ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed' 
                                                    : isSelected
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500'
                                                }
                                            `}
                                            title={`Seat ${seat.seat_label}`}
                                        >
                                            <Armchair size={20} />
                                            <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-white shadow-sm border px-1 rounded">
                                                {seat.seat_label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                         </div>
                     )}

                     <div className="flex justify-center gap-4 mt-8 text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 border border-gray-300 rounded bg-white"></div> Available</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 border border-blue-600 rounded bg-blue-600"></div> Selected</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 border border-gray-300 rounded bg-gray-200"></div> Booked</div>
                     </div>
                  </div>

                  {/* Right: Summary & Pay */}
                  <div className="w-full md:w-64 flex flex-col">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Route</p>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-4">
                            <span>{fromCity}</span>
                            <ArrowLeft className="rotate-180 h-3 w-3 text-gray-400" />
                            <span>{toCity}</span>
                        </div>

                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Selected Seats</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {selectedSeatIds.length > 0 ? (
                                selectedSeatIds.map(id => {
                                    const seatLabel = allSeats.find(s => s.id === id)?.seat_label;
                                    return (
                                        <span key={id} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                                            {seatLabel}
                                        </span>
                                    )
                                })
                            ) : (
                                <span className="text-sm text-gray-400 italic">No seats selected</span>
                            )}
                        </div>

                        <div className="border-t border-dashed border-gray-200 py-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600 text-sm">Unit Price</span>
                                <span className="font-medium">₹ {selectedBus.price}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold text-gray-900 mt-2">
                                <span>Total</span>
                                <span>₹ {selectedBus.price * selectedSeatIds.length}</span>
                            </div>
                        </div>
                    </div>

                    {bookingError && (
                      <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
                         <AlertCircle size={14} className="shrink-0" />
                         {bookingError}
                      </div>
                    )}

                    <button 
                        onClick={handleConfirmBooking}
                        disabled={bookingStatus === 'submitting' || selectedSeatIds.length === 0}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        {bookingStatus === 'submitting' ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5" />
                            Processing...
                        </>
                        ) : (
                        <>
                            Book Ticket
                            <Ticket size={18} />
                        </>
                        )}
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SearchPage;