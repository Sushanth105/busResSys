"use client"

import React, { JSX } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Shield, Globe, Award, Target, Heart } from 'lucide-react';

// Interfaces for data structures
interface StatItem {
  label: string;
  value: string;
  icon: JSX.Element;
}

interface ValueItem {
  title: string;
  desc: string;
  icon: JSX.Element;
}

const AboutPage = () => {
  const stats: StatItem[] = [
    { label: 'Happy Travelers', value: '2M+', icon: <Users className="text-blue-200" size={24} /> },
    { label: 'Bus Operators', value: '1,500+', icon: <Globe className="text-blue-200" size={24} /> },
    { label: 'Routes Covered', value: '5,000+', icon: <Target className="text-blue-200" size={24} /> },
    { label: 'Years of Service', value: '10+', icon: <Award className="text-blue-200" size={24} /> },
  ];

  const values: ValueItem[] = [
    { 
      title: "Safety First", 
      desc: "We prioritize your safety above all else. Every operator is verified and every bus is tracked.", 
      icon: <Shield className="text-blue-600" size={32} /> 
    },
    { 
      title: "Customer Obsession", 
      desc: "Our 24/7 support team is always ready to help you with any queries or issues during your journey.", 
      icon: <Heart className="text-blue-600" size={32} /> 
    },
    { 
      title: "Global Standards", 
      desc: "We bring world-class travel standards to local routes, ensuring comfort and punctuality.", 
      icon: <Globe className="text-blue-600" size={32} /> 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 1. Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="text-gray-600" size={24} />
          </Link>
          <span className="text-xl font-bold text-gray-900">About Us</span>
        </div>
      </header>

      <main>
        {/* 2. Hero Section */}
        <section className="bg-blue-900 text-white py-20 px-4 text-center">
          <div className="container mx-auto max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Redefining the Way You Travel</h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
              BusGo is India&apos;s fastest-growing bus ticketing platform. We are on a mission to make bus travel seamless, transparent, and comfortable for everyone.
            </p>
          </div>
        </section>

        {/* 3. Stats Section */}
        <section className="container mx-auto px-4 -mt-10 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg text-center transform hover:-translate-y-1 transition-transform duration-300">
                <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  {stat.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Our Story / Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800" 
                alt="Our Office" 
                className="rounded-2xl shadow-xl w-full object-cover h-[400px]"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Who We Are</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Founded in 2024, BusGo started with a simple idea: why does booking a bus ticket have to be complicated? We saw the chaos of manual bookings and decided to build a digital bridge between travelers and operators.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Today, we connect thousands of cities across the country, offering real-time tracking, verified reviews, and secure payments. We aren&apos;t just selling tickets; we are selling a promise of a better journey.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <p className="italic text-gray-700 font-medium">
                  &quot;Our goal is not just to get you from A to B, but to make you enjoy the distance in between.&quot;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Core Values */}
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((val, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-4">{val.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{val.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. CTA */}
        <section className="py-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to travel with us?</h2>
          <Link href="/" className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-colors">
            Book Your Ticket
          </Link>
        </section>

      </main>
    </div>
  );
};

export default AboutPage;