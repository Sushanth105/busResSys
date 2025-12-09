"use client"

import React, { useEffect, useState } from 'react';
import { 
  Bus, MapPin, Clock, IndianRupee, Save, 
  ArrowLeft, CheckCircle, AlertCircle, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_BASE_URL = "http://localhost:8000";

export default function AddTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Auth State
  const [profile, setProfile] = useState({ name: "", email: "", role: "" });
  const [authChecked, setAuthChecked] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    bus_number: "",
    start_city: "",
    end_city: "",
    departure_time: "",
    arrival_time: "",
    price: ""
  });

  // --- 1. Check User Role & Auth ---
  const getProfile = async () => {
      try {
        let response = await fetch(`${API_BASE_URL}/Profile`,{
          method: "GET",
          credentials: "include",
        });
  
        if (response.status === 403 || response.status === 401) {
          const refreshRes = await fetch(`${API_BASE_URL}/refresh`, {
            method: "POST",
            credentials: "include",
          });
  
          if (!refreshRes.ok) {
            router.push("/login");
            return;
          }
  
          response = await fetch(`${API_BASE_URL}/Profile`, {
            method: "GET",
            credentials: "include",
          });
        }
  
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setAuthChecked(true);
      }
  }
  
  useEffect(() => {
    getProfile();
  }, []);

  // --- 2. Protect Route ---
  useEffect(() => {
    if (authChecked && profile.role === "user") {
        router.push('/');
    }
  }, [profile, authChecked, router]);

  // --- 3. Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Helper: Ensure time is sent as HH:MM:SS
      // HTML time input returns "14:30", backend usually needs "14:30:00"
      const formatTimeForBackend = (time: string) => {
        if (!time) return null;
        if (time.length === 5) return `${time}:00`; // Append seconds if missing
        return time;
      };

      // Prepare Payload
      const payload = {
        bus_number: formData.bus_number,
        start_city: formData.start_city,
        end_city: formData.end_city,
        departure_time: formatTimeForBackend(formData.departure_time),
        arrival_time: formatTimeForBackend(formData.arrival_time),
        price: Number(formData.price)
      };

      console.log("Sending Payload:", payload); 

      let response = await fetch(`${API_BASE_URL}/trips/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      // Handle Token Expiry / Refresh
      if (response.status === 401 || response.status === 403) {
         const refreshRes = await fetch(`${API_BASE_URL}/refresh`, { 
             method: "POST", 
             credentials: "include" 
         });
         
         if (!refreshRes.ok) { 
             router.push("/login"); 
             return; 
         }
         
         // Retry
         response = await fetch(`${API_BASE_URL}/trips/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
         });
      }

      if (!response.ok) {
        const err = await response.json();
        const errorDetails = err.detail ? JSON.stringify(err.detail) : "Failed to create trip";
        throw new Error(errorDetails);
      }

      setMessage({ type: 'success', text: "Trip created successfully!" });
      
      // Reset form
      setFormData({
        bus_number: "",
        start_city: "",
        end_city: "",
        departure_time: "",
        arrival_time: "",
        price: ""
      });

    } catch (error: unknown) {
        let displayError = error instanceof Error ? error.message : String(error);
        try {
           const errorMessage = error instanceof Error ? error.message : String(error);
           const parsed = JSON.parse(errorMessage);
           type PydanticError = { loc: (string | number)[]; msg: string; type?: string };
           if (Array.isArray(parsed)) {
               const parsedErrors = parsed as PydanticError[];
               displayError = parsedErrors
                 .map((e) => {
                   const field = Array.isArray(e.loc) && e.loc.length > 1 ? String(e.loc[1]) : String(e.loc[0] ?? 'field');
                   return `${field}: ${e.msg}`;
                 })
                 .join(', ');
           }
        } catch (e) {}
        setMessage({ type: 'error', text: displayError });
      } finally {
      setLoading(false);
    }
  };

  // --- 4. Render ---

  if (!authChecked) {
     return <div className="h-screen flex justify-center items-center"><Loader2 className="animate-spin text-blue-600"/></div>
  }

  if (profile.role === "user") {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 mr-4 transition">
            <ArrowLeft size={20} className="text-gray-600"/>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New Trip</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          
          {message && (
            <div className={`p-4 flex items-center text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.type === 'success' ? <CheckCircle size={20} className="mr-2 flex-shrink-0"/> : <AlertCircle size={20} className="mr-2 flex-shrink-0"/>}
              <span className="break-all">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Bus Identifier */}
            <div className="space-y-4">
              <h2 className="text-sm uppercase tracking-wide text-gray-500 font-bold border-b pb-2">Bus Identification</h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Bus size={16} className="mr-2 text-blue-600"/> Bus Number
                  </label>
                  <input 
                    type="text" 
                    name="bus_number" 
                    required 
                    placeholder="e.g. KA-19-AB-1234" 
                    value={formData.bus_number} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                  <p className="text-xs text-gray-500">Must match an existing bus in the system.</p>
                </div>
              </div>
            </div>

            {/* Route & Schedule */}
            <div className="space-y-4">
              <h2 className="text-sm uppercase tracking-wide text-gray-500 font-bold border-b pb-2">Route & Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Start City */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <MapPin size={16} className="mr-2 text-green-600"/> From (Start City)
                  </label>
                  <input 
                    type="text" 
                    name="start_city" 
                    required 
                    placeholder="e.g. Bangalore" 
                    value={formData.start_city} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* End City */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <MapPin size={16} className="mr-2 text-red-600"/> To (End City)
                  </label>
                  <input 
                    type="text" 
                    name="end_city" 
                    required 
                    placeholder="e.g. Mumbai" 
                    value={formData.end_city} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Departure Time */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Clock size={16} className="mr-2 text-blue-600"/> Departure Time
                  </label>
                  <input 
                    type="time" 
                    name="departure_time" 
                    required 
                    value={formData.departure_time} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Arrival Time */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Clock size={16} className="mr-2 text-blue-600"/> Arrival Time
                  </label>
                  <input 
                    type="time" 
                    name="arrival_time" 
                    required 
                    value={formData.arrival_time} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
               <h2 className="text-sm uppercase tracking-wide text-gray-500 font-bold border-b pb-2">Pricing</h2>
               <div className="w-full md:w-1/2 space-y-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <IndianRupee size={16} className="mr-2 text-blue-600"/> Ticket Price
                  </label>
                  <input 
                    type="number" 
                    name="price" 
                    required 
                    min="1" 
                    placeholder="e.g. 1200" 
                    value={formData.price} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
               </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={loading} className="flex items-center bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:bg-blue-300">
                {loading ? <><Loader2 className="animate-spin mr-2" size={20}/> Processing...</> : <><Save className="mr-2" size={20}/> Save Trip</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}