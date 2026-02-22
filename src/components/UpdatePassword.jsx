import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // This is important — it detects recovery session
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery session detected");
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!password) {
      alert("Enter new password");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      console.error(error.message);
      alert(error.message);
    } else {
      alert("Password updated successfully!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Set New Password
        </h2>

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full p-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4AF37] text-white py-3 rounded"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;