import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Enter your email");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/update-password",
    });

    if (error) {
      setMessage("Error sending reset link");
    } else {
      setMessage("Reset link sent to your email");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Forgot Password
        </h2>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-[#D4AF37] text-white py-3 rounded"
          >
            Send Reset Link
          </button>
        </form>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;