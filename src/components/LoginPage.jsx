import  { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorModal, setErrorModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorModal(true);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      console.error(error.message);
      setErrorModal(true);
    } else {
      navigate("/dashboard");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email first");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://njv-travels.netlify.app/update-password",
    });

    if (error) {
      alert("Error sending reset email");
    } else {
      alert("Password reset link sent to your email");
    }
  };

  return (
  <div className="h-[100dvh] fixed inset-0  overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">

  <div className="bg-white p-8 rounded-3xl shadow-2xl w-[90%] max-w-md">
    <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 tracking-wide">
      NJV Travels
    </h2>

    <form onSubmit={handleLogin} className="space-y-5">

      <input
        type="email"
        placeholder="Email"
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white py-3 rounded-xl font-semibold shadow-md hover:opacity-90 transition"
      >
        {loading ? "Checking..." : "Login"}
      </button>

      <button
        type="button"
        onClick={handleForgotPassword}
        className="w-full text-sm text-[#D4AF37] hover:underline"
      >
        Forgot Password?
      </button>

    </form>
  </div>

  {errorModal && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl w-[85%] max-w-sm text-center shadow-2xl">
        <h3 className="text-lg font-semibold mb-3 text-red-600">
          Login Failed
        </h3>
        <p className="text-gray-600 mb-4">
          Contact developer to get password or reset password.
        </p>
        <button
          onClick={() => setErrorModal(false)}
          className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white px-6 py-2 rounded-lg"
        >
          OK
        </button>
      </div>
    </div>
  )}

</div>
  );
};

export default LoginPage;