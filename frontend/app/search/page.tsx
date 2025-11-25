"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, BusFront, Star, Wifi, Coffee, BatteryCharging, 
  Loader2, AlertCircle, X, CheckCircle, Users, Ticket 
} from 'lucide-react';
import Link from 'next/link';

interface Bus {
  id: number;
  operator: string;
  air_type: string;     
  seat_type: string;    
  departure_time: string; 
  arrival_time: string;  
  rating: number;
  price: number;
  seatsAvailable: number;
}

interface ApiResponse {
  message: string;
  data: Bus[];
}

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
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState<string>("");

  useEffect(() => {
    const fetchBuses = async () => {
      setLoading(true);
      setError(null);
      try {
        let response = await fetch(`http://localhost:8000/trips/get?start_city=${fromCity}&end_city=${toCity}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
        });

        if (response.status === 403 || response.status === 401) {
           const refreshRes = await fetch("http://localhost:8000/refresh", { method: "POST", credentials: "include" });
           if (!refreshRes.ok) { router.push("/login"); return; }
           response = await fetch(`http://localhost:8000/trips/get?start_city=${fromCity}&end_city=${toCity}`, {
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

  // --- Booking Logic ---

  const openBookingModal = (bus: Bus) => {
    setSelectedBus(bus);
    setPassengerCount(1);
    setBookingStatus('idle');
    setBookingError("");
  };

  const closeBookingModal = () => {
    if (bookingStatus === 'submitting') return;
    setSelectedBus(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedBus) return;

    setBookingStatus('submitting');
    setBookingError("");

    // UPDATED: We do NOT calculate total price here. We send the unit price.
    const payload = {
      trip_id: selectedBus.id,
      passenger_count: passengerCount,
      price: selectedBus.price // Sending unit price as requested
    };

    try {
      let response = await fetch('http://localhost:8000/booking/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.status === 403 || response.status === 401) {
           const refreshRes = await fetch("http://localhost:8000/refresh", { method: "POST", credentials: "include" });
           if (!refreshRes.ok) { router.push("/login"); return; }
           response = await fetch('http://localhost:8000/booking/add', {
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
      // Narrow the unknown error to extract a message safely
      if (err instanceof Error) {
        setBookingError(err.message);
      } else if (typeof err === 'string') {
        setBookingError(err);
      } else {
        setBookingError("An error occurred while booking.");
      }
    }
  };

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
                          Book
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-blue-600 p-6 text-white flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">Confirm Booking</h2>
                <p className="text-blue-100 text-sm mt-1">{selectedBus.operator}</p>
              </div>
              <button 
                onClick={closeBookingModal}
                className="p-1 bg-blue-500 hover:bg-blue-400 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              
              {bookingStatus === 'success' ? (
                // Success View
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-500 mb-6">Your ticket has been booked successfully.</p>
                  <button 
                    onClick={closeBookingModal}
                    className="bg-gray-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-gray-800 transition-colors w-full"
                  >
                    Done
                  </button>
                </div>
              ) : (
                // Form View
                <>
                  <div className="flex items-center gap-4 mb-6 bg-blue-50 p-4 rounded-xl">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Journey</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                        <span>{fromCity}</span>
                        <ArrowLeft className="rotate-180 h-4 w-4 text-gray-400" />
                        <span>{toCity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Date</p>
                      <p className="text-sm font-bold text-gray-800">{date}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Users size={16} /> Passengers
                    </label>
                    <div className="flex items-center border rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 font-bold text-lg text-gray-600 transition-colors"
                      >
                        -
                      </button>
                      <div className="flex-1 text-center font-bold text-xl text-gray-800 py-2">
                        {passengerCount}
                      </div>
                      <button 
                        onClick={() => setPassengerCount(Math.min(selectedBus.seatsAvailable, passengerCount + 1))}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 font-bold text-lg text-gray-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-right text-gray-400 mt-2">
                      Max available: {selectedBus.seatsAvailable}
                    </p>
                  </div>

                  <div className="border-t border-dashed border-gray-200 py-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 text-sm">Price per ticket</span>
                      <span className="font-medium">₹ {selectedBus.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold text-gray-900 mt-2">
                      <span>Total Amount</span>
                      {/* We visualize the total here for UX, but API sends unit price */}
                      <span>₹ {selectedBus.price * passengerCount}</span>
                    </div>
                  </div>

                  {bookingError && (
                     <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} />
                        {bookingError}
                     </div>
                  )}

                  <button 
                    onClick={handleConfirmBooking}
                    disabled={bookingStatus === 'submitting'}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {bookingStatus === 'submitting' ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm & Pay
                        <Ticket size={18} />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SearchPage;