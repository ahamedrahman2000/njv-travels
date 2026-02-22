import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const VehiclePage = () => {
  const [vehicleName, setVehicleName] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);

  // Fetch existing vehicles from Supabase
  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching vehicles:", error);
      alert("Failed to fetch vehicles");
    } else {
      setVehicles(data);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Add or update vehicle
  const handleSaveVehicle = async () => {
    if (!vehicleName.trim()) {
      alert("Please enter a vehicle name");
      return;
    }

    setLoading(true);

    if (editingVehicleId) {
      // Update vehicle
      const { error } = await supabase
        .from("vehicles")
        .update({ vehicle_name: vehicleName.trim() })
        .eq("id", editingVehicleId);

      setLoading(false);

      if (error) {
        console.error("Error updating vehicle:", error);
        alert("Failed to update vehicle");
      } else {
        alert("Vehicle updated successfully!");
        setVehicleName("");
        setEditingVehicleId(null);
        fetchVehicles();
      }
    } else {
      // Add new vehicle
      const { error } = await supabase
        .from("vehicles")
        .insert([{ vehicle_name: vehicleName.trim() }]);

      setLoading(false);

      if (error) {
        console.error("Error adding vehicle:", error);
        alert("Failed to add vehicle");
      } else {
        alert("Vehicle added successfully!");
        setVehicleName("");
        fetchVehicles();
      }
    }
  };

  // Edit vehicle
  const handleEdit = (vehicle) => {
    setVehicleName(vehicle.vehicle_name);
    setEditingVehicleId(vehicle.id);
  };

  // Delete vehicle
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    const { error } = await supabase.from("vehicles").delete().eq("id", id);

    if (error) {
      console.error("Error deleting vehicle:", error);
      alert("Failed to delete vehicle");
    } else {
      alert("Vehicle deleted successfully!");
      fetchVehicles();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-700 mb-6">
        Vehicle Management
      </h2>

      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-lg space-y-4">
        {/* Add/Edit Vehicle */}
        <div>
          <label className="block mb-1 font-medium text-gray-600">Vehicle Name</label>
          <input
            type="text"
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
            placeholder="Enter vehicle name"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#D4AF37]"
          />
        </div>

        <button
          onClick={handleSaveVehicle}
          disabled={loading}
          className="w-full bg-[#D4AF37] text-white px-4 py-2 rounded font-semibold hover:bg-yellow-500 transition disabled:opacity-50"
        >
          {loading ? (editingVehicleId ? "Updating..." : "Saving...") : editingVehicleId ? "Update Vehicle" : "Add Vehicle"}
        </button>

        {/* Vehicles List */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Existing Vehicles</h3>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {vehicles.length > 0 ? (
              vehicles.map((v) => (
                <li
                  key={v.id}
                  className="p-2 bg-gray-50 rounded border border-gray-200 flex justify-between items-center"
                >
                  <span>{v.vehicle_name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(v)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No vehicles added yet</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VehiclePage;