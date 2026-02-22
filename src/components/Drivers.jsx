import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const DriverPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [driverName, setDriverName] = useState("");
  const [driverMobile, setDriverMobile] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all drivers
  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      alert("Failed to fetch drivers");
      console.error(error);
    } else {
      setDrivers(data);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Add or Update driver
  const handleSave = async () => {
    if (!driverName.trim() || !driverMobile.trim()) {
      alert("Please enter both driver name and mobile number");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // Update existing driver
        const { error } = await supabase
          .from("drivers")
          .update({ driver_name: driverName, driver_mobile: driverMobile })
          .eq("id", editingId);

        if (error) throw error;
        alert("Driver updated successfully!");
      } else {
        // Insert new driver
        const { error } = await supabase
          .from("drivers")
          .insert([{ driver_name: driverName, driver_mobile: driverMobile }]);
        if (error) throw error;
        alert("Driver added successfully!");
      }
      // Reset form
      setDriverName("");
      setDriverMobile("");
      setEditingId(null);
      fetchDrivers();
    } catch (err) {
      console.error(err);
      alert("Failed to save driver");
    } finally {
      setLoading(false);
    }
  };

  // Edit driver
  const handleEdit = (driver) => {
    setDriverName(driver.driver_name);
    setDriverMobile(driver.driver_mobile);
    setEditingId(driver.id);
  };

  // Delete driver
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      const { error } = await supabase.from("drivers").delete().eq("id", id);
      if (error) alert("Failed to delete driver");
      else fetchDrivers();
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-100">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-6 text-center">
        Manage Drivers
      </h2>

      {/* Add / Edit Form */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg mb-6 space-y-4">
        <input
          type="text"
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
          placeholder="Enter driver name"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#D4AF37]"
        />
        <input
          type="text"
          value={driverMobile}
          onChange={(e) => setDriverMobile(e.target.value)}
          placeholder="Enter driver mobile"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#D4AF37]"
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#D4AF37] text-white py-2 rounded font-semibold hover:bg-yellow-500 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : editingId ? "Update Driver" : "Add Driver"}
        </button>
      </div>

      {/* Driver List */}
      <div className="max-w-md mx-auto bg-white p-4 rounded-lg shadow-lg">
        {drivers.length === 0 ? (
          <p className="text-gray-500 text-center">No drivers found.</p>
        ) : (
          <ul className="space-y-2">
            {drivers.map((driver) => (
              <li
                key={driver.id}
                className="flex justify-between items-center bg-gray-100 p-3 rounded shadow-sm"
              >
                <div>
                  <p className="font-medium">{driver.driver_name}</p>
                  <p className="text-gray-600 text-sm">{driver.driver_mobile}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(driver)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(driver.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DriverPage;