"use client"

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

// Interface for form state
interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactPage = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Typed submit handler
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Simulate API call
    console.log(formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  // Typed change handler for both input and textarea
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 1. Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="text-gray-600" size={24} />
          </Link>
          <span className="text-xl font-bold text-gray-900">Contact Us</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-6xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Left Column: Contact Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Get in touch</h1>
              <p className="text-gray-600 text-lg">
                Have a question about your booking, refund, or just want to say hello? We are here to help you 24/7.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Phone Support</h3>
                  <p className="text-sm text-gray-500 mb-1">24/7 Available</p>
                  <p className="text-blue-600 font-semibold">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Email Us</h3>
                  <p className="text-sm text-gray-500 mb-1">For queries & grievances</p>
                  <p className="text-blue-600 font-semibold">support@busgo.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Head Office</h3>
                  <p className="text-sm text-gray-500 mb-1">Come visit us</p>
                  <p className="text-gray-700">
                    123, Tech Park, 4th Block,<br />
                    Koramangala, Bangalore - 560034
                  </p>
                </div>
              </div>
            </div>

            {/* Simple FAQ Link */}
            <div className="bg-blue-600 text-white rounded-xl p-6 flex justify-between items-center shadow-lg">
               <div>
                 <h3 className="font-bold text-lg">Frequently Asked Questions</h3>
                 <p className="text-blue-100 text-sm">Find answers instantly.</p>
               </div>
               <button className="bg-white text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                 <MessageSquare size={20} />
               </button>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Booking Issue / Refund / Feedback"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea 
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Tell us how we can help..."
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>Send Message</span>
                <Send size={18} />
              </button>

              {isSubmitted && (
                <div className="p-4 bg-green-50 text-green-700 text-center rounded-lg font-medium animate-pulse">
                  Message sent successfully! We&apos;ll get back to you soon.
                </div>
              )}
            </form>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ContactPage;