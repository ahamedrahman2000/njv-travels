import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { FaEdit, FaTrash } from "react-icons/fa";

const VehiclePage = () => {
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("id", { ascending: true });

    if (!error) setVehicles(data);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSaveVehicle = async () => {
    if (!vehicleName.trim() || !vehicleNumber.trim()) {
      alert("Please enter vehicle name and number");
      return;
    }

    setLoading(true);

    if (editingVehicleId) {
      const { error } = await supabase
        .from("vehicles")
        .update({
          vehicle_name: vehicleName.trim(),
          vehicle_number: vehicleNumber.trim().toUpperCase(),
        })
        .eq("id", editingVehicleId);

      if (error) alert("Failed to update vehicle");
      else {
        alert("Vehicle updated successfully!");
        resetForm();
        fetchVehicles();
      }
    } else {
      const { error } = await supabase.from("vehicles").insert([
        {
          vehicle_name: vehicleName.trim(),
          vehicle_number: vehicleNumber.trim().toUpperCase(),
        },
      ]);

      if (error) alert("Failed to add vehicle");
      else {
        alert("Vehicle added successfully!");
        resetForm();
        fetchVehicles();
      }
    }

    setLoading(false);
  };

  const handleEdit = (vehicle) => {
    setVehicleName(vehicle.vehicle_name);
    setVehicleNumber(vehicle.vehicle_number);
    setEditingVehicleId(vehicle.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;

    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", id);

    if (error) alert("Failed to delete");
    else fetchVehicles();
  };

  const resetForm = () => {
    setVehicleName("");
    setVehicleNumber("");
    setEditingVehicleId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-700 mb-6">
        Vehicle Management
      </h2>

      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow space-y-4">

        {/* Vehicle Name */}
        <input
          type="text"
          placeholder="Vehicle Name (Innova, Tempo, etc)"
          value={vehicleName}
          onChange={(e) => setVehicleName(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-[#D4AF37]"
        />

        {/* Vehicle Number */}
        <input
          type="text"
          placeholder="Vehicle Number (TN01AB1234)"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          className="w-full p-2 border rounded uppercase focus:ring-2 focus:ring-[#D4AF37]"
        />

        <button
          onClick={handleSaveVehicle}
          disabled={loading}
          className="w-full bg-[#D4AF37] text-white py-2 rounded font-semibold hover:bg-yellow-500 transition"
        >
          {loading
            ? "Saving..."
            : editingVehicleId
            ? "Update Vehicle"
            : "Add Vehicle"}
        </button>

        {/* Vehicle List */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Existing Vehicles</h3>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {vehicles.length === 0 && (
              <p className="text-gray-500 text-sm">No vehicles added</p>
            )}

            {vehicles.map((v) => (
              <div
                key={v.id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{v.vehicle_name}</p>
                  <p className="text-sm text-gray-500">
                    {v.vehicle_number}
                  </p>
                </div>

                <div className="flex gap-3 text-lg">
                  <FaEdit
                    className="text-blue-600 cursor-pointer hover:text-blue-800"
                    onClick={() => handleEdit(v)}
                  />
                  <FaTrash
                    className="text-red-600 cursor-pointer hover:text-red-800"
                    onClick={() => handleDelete(v.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default VehiclePage;