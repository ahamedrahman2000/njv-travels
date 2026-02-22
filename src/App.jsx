import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

import Dashboard from "./components/Dashboard";
import BookingForm from "./components/BookingForm";
import VehiclePage from "./components/VehiclePage";
import TripsPage from "./components/TripsPage";
import OrdersPage from "./components/OrdersPage";
import BottomNav from "./components/BottomNav";
import CashbookPage from "./components/CashBook";
import DriverPage from "./components/Drivers";
import Navbar from "./components/NavBar";
import ProfilePage from "./components/Profile";
import LoginPage from "./components/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./components/ForgetPassword";
import UpdatePassword from "./components/UpdatePassword";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-16 bg-gray-100">
      <Router>
        {/* Show Navbar only when logged in */}
        {session && <Navbar />}

        <Routes>
          {/* Login Route */}
          <Route
            path="/"
            element={
              session ? <Navigate to="/dashboard" replace /> : <LoginPage />
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <BookingForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <VehiclePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <TripsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cashBook"
            element={
              <ProtectedRoute>
                <CashbookPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/driversPage"
            element={
              <ProtectedRoute>
                <DriverPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* Catch all route */}
          <Route
            path="*"
            element={
              session ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>

        {/* Show BottomNav only when logged in */}
        {session && <BottomNav />}
      </Router>
    </div>
  );
}

export default App;