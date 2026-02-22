import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    full_name: "",
    mobile: "",
    email: "",
    address: "",
    aadhaar: "",
    pan: "",
    license_number: "",
    profile_photo: "",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase.from("profile").select("*").single();
    if (data) setProfile(data);
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase.from("profile").upsert([profile]);

    setLoading(false);

    if (error) alert("Failed to save profile");
    else alert("Profile updated successfully!");
  };

  // ✅ Change Password
  const handlePasswordChange = async () => {
    if (!newPassword) {
      alert("Enter new password");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      alert("Failed to change password");
    } else {
      alert("Password updated successfully!");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg">

        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">
          Profile Settings
        </h2>

        {/* Profile Photo */}
       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input name="full_name" value={profile.full_name || ""} onChange={handleChange} placeholder="Full Name" className="input-style" />
          <input name="mobile" value={profile.mobile || ""} onChange={handleChange} placeholder="Mobile Number" className="input-style" />
          <input name="email" value={profile.email || ""} onChange={handleChange} placeholder="Email" className="input-style" />
          <input name="address" value={profile.address || ""} onChange={handleChange} placeholder="Address" className="input-style" />

          <input name="aadhaar" value={profile.aadhaar || ""} onChange={handleChange} placeholder="Aadhaar Number" className="input-style" />
          <input name="pan" value={profile.pan || ""} onChange={handleChange} placeholder="PAN Number" className="input-style" />
          <input name="license_number" value={profile.license_number || ""} onChange={handleChange} placeholder="Driving License Number" className="input-style" />

        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#D4AF37] text-white px-8 py-2 rounded-xl font-semibold hover:bg-yellow-500 transition"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-gray-800 text-white px-6 py-2 rounded-xl hover:bg-gray-900 transition"
          >
            Change Password
          </button>
        </div>

      </div>

      {/* ✅ Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-2xl shadow-xl w-96">

            <h3 className="text-xl font-semibold mb-4 text-center">
              Change Password
            </h3>

            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="input-style mb-3"
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-style mb-4"
            />

            <div className="flex justify-between">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg"
              >
                Submit
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default ProfilePage;