"use client"

import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, BusFront, Ticket, Star, Handshake, Headphones, Globe, Facebook, Instagram, Twitter } from 'lucide-react';

// Main App component representing the entire homepage
const App = () => {
  // State to manage search form inputs
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('');

  // Function to handle the bus search
  const handleSearch = () => {
    console.log('Searching for buses:', { from, to, date, passengers });
    // In a real application, this would trigger an API call
  };

  // State to simulate user login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Data for popular routes
  const popularRoutes = [
    { from: 'Mangalore', to: 'Bangalore', image: 'https://placehold.co/400x200/4F46E5/ffffff?text=Mangalore' },
    { from: 'Mysore', to: 'Chennai', image: 'https://placehold.co/400x200/3B82F6/ffffff?text=Mysore' },
    { from: 'Udupi', to: 'Hyderabad', image: 'https://placehold.co/400x200/2563EB/ffffff?text=Udupi' },
  ];

  // Data for features
  const features = [
    { title: 'Instant Booking', description: 'Book your tickets in seconds with our seamless process.', icon: <Ticket className="text-blue-600" size={32} /> },
    { title: 'Real-Time Availability', description: 'Check live seat updates and book your preferred seat.', icon: <BusFront className="text-blue-600" size={32} /> },
    { title: 'Secure Payments', description: 'We support UPI, cards, and net banking for secure transactions.', icon: <Handshake className="text-blue-600" size={32} /> },
    { title: 'Booking History', description: 'Easily manage and view your past and current bookings.', icon: <Star className="text-blue-600" size={32} /> },
    { title: '24/7 Support', description: 'Our customer support team is available around the clock.', icon: <Headphones className="text-blue-600" size={32} /> },
    { title: 'Global Routes', description: 'Travel to any destination with our wide network of routes.', icon: <Globe className="text-blue-600" size={32} /> },
  ];

  return (
    <div className="bg-gray-50 font-sans text-gray-800">

      {/* --------------------
        1. HEADER / NAVBAR
        --------------------
      */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <BusFront className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">BusGo</span>
          </div>

          {/* Navigation Links (Hidden on small screens) */}
          <nav className="hidden md:flex flex-1 justify-center space-x-8 lg:space-x-12">
            <a href="#" className="font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200">Home</a>
            <a href="#" className="font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200">Search Buses</a>
            <a href="#" className="font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200">My Bookings</a>
            <a href="#" className="font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200">Contact Us</a>
            <a href="#" className="font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200">About Us</a>
          </nav>

          {/* Login / Register / User Profile */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <a href="#" className="flex items-center space-x-2 p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors duration-200">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">JD</div>
              </a>
            ) : (
              <>
                <button className="hidden sm:inline-block px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200">
                  Login
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200">
                  Register
                </button>
              </>
            )}
            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* --------------------
        2. HERO SECTION
        --------------------
      */}
      <section className="relative w-full min-h-screen flex items-center justify-center pt-24 pb-16 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544620302-38d783dbd636?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80')" }}>
        <div className="absolute inset-0 bg-blue-900 bg-opacity-70 backdrop-blur-sm"></div>
        
        {/* Search Box */}
        <div className="relative z-10 p-4 w-full max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white text-center mb-6">Your Journey Starts Here</h1>
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 transform transition-transform duration-300 hover:scale-105">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* From */}
              <div className="relative">
                <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="from"
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                    placeholder="Source City"
                  />
                </div>
              </div>

              {/* To */}
              <div className="relative">
                <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="to"
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                    placeholder="Destination City"
                  />
                </div>
              </div>

              {/* Date of Journey */}
              <div className="relative">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 text-gray-500"
                  />
                </div>
              </div>

              {/* Number of Passengers */}
              <div className="relative">
                <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-1">Passengers (Optional)</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="passengers"
                    type="number"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-6">
              <button
                onClick={handleSearch}
                className="w-full px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 transform hover:-translate-y-1"
              >
                Search Buses
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------
        3. POPULAR ROUTES
        --------------------
      */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Popular Routes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularRoutes.map((route, index) => (
            <div
              key={index}
              className="group cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              onClick={() => {
                setFrom(route.from);
                setTo(route.to);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <img src={route.image} alt={`${route.from} to ${route.to}`} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110" />
              <div className="p-6">
                <h3 className="text-xl font-semibold">{route.from} → {route.to}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------
        4. FEATURES SECTION
        --------------------
      */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg text-center transition-transform duration-300 hover:scale-105">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* --------------------
        5. OFFERS SECTION
        --------------------
      */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-blue-600 text-white rounded-2xl shadow-xl p-8 md:p-12 text-center transform transition-all duration-300 hover:scale-105">
          <h3 className="text-3xl font-bold mb-2">Get 10% OFF on your first booking!</h3>
          <p className="text-lg mb-6">Use code: FIRST10</p>
          <button className="px-8 py-4 text-lg font-bold bg-white text-blue-600 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-200">
            Book Now
          </button>
        </div>
      </section>

      {/* --------------------
        6. FOOTER
        --------------------
      */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors duration-200">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Customer Support</h4>
            <p className="text-sm mb-2">Email: support@busgo.com</p>
            <p className="text-sm">Phone: +91 98765 43210</p>
          </div>
          
          {/* Social Media */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="hover:text-white transition-colors duration-200"><Facebook size={24} /></a>
              <a href="#" aria-label="Instagram" className="hover:text-white transition-colors duration-200"><Instagram size={24} /></a>
              <a href="#" aria-label="Twitter" className="hover:text-white transition-colors duration-200"><Twitter size={24} /></a>
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-8">
          &copy; 2024 BusGo. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default App;
