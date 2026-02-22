import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, User, Truck, Users, LogOut } from "lucide-react";
import { supabase } from "../supabaseClient";

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
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
        
        {/* Logo */}
        <h1
          onClick={() => navigate("/dashboard")}
          className="text-xl font-bold cursor-pointer bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent"
        >
          NJV Travels
        </h1>

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
                onClick={() => { navigate("/profile"); setOpen(false); }}
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 w-full text-left"
              >
                <User size={18} /> Profile
              </button>

              <button
                onClick={() => { navigate("/driversPage"); setOpen(false); }}
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 w-full text-left"
              >
                <Users size={18} /> Drivers
              </button>

              <button
                onClick={() => { navigate("/vehicles"); setOpen(false); }}
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