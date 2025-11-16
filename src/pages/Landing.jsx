import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Creative_upaay_logo.jpeg";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <img 
        src={logo} 
        alt="Creative Upaay Logo" 
        className="w-32 h-32 rounded-full mb-6 shadow-lg"
      />

      <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">
        Creative Upaay Assignment
      </h1>

      <button
        onClick={() => navigate("/login")}
        className="px-10 py-3 rounded-xl font-medium bg-blue-600 text-white text-lg hover:bg-blue-700 transition shadow-md"
      >
        Get Started
      </button>
    </div>
  );
}
