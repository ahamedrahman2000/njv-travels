import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, User, Truck, LogOut, MessageCircle } from "lucide-react";
import { supabase } from "../supabaseClient";
import logo from "../assets/logo.png"; // Import your logo

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => navigate("/dashboard")}
          className="cursor-pointer flex items-center gap-3"
        >
          <img
            src={logo}
            alt="NJV Travels"
            className="h-7 w-auto object-contain"
          />
        </div>

        {/* Settings */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <Settings className="w-6 h-6 text-gray-700" />
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute -right-3 mt-3 w-48 bg-white backdrop-blur-md rounded-xl shadow-xl border border-gray-200 animate-fadeIn">
              <button
                onClick={() => {
                  navigate("/profile");
                  setOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 w-full text-left"
              >
                <User size={18} /> Profile
              </button>

              <button
                onClick={() => {
                  navigate("/enquiry");
                  setOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 w-full text-left"
              >
                <MessageCircle size={18} /> Enquiry
              </button>

              <button
                onClick={() => {
                  navigate("/vehicleList");
                  setOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 w-full text-left"
              >
                <Truck size={18} /> Vehicles
              </button>

              <hr />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 w-full text-left"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
