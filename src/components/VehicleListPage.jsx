import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { FaTools, FaTrash } from "react-icons/fa";

const VehicleListPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch vehicles with maintenance + trips + profit
  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select(
        `
        *,
        vehicle_maintenance(cost),
        trips(id, net_profit)
        `
      )
      .order("id", { ascending: true });

    if (error) {
      console.error("Fetch Error:", error.message);
      return;
    }

    if (data) {
      const formatted = data.map((v) => {
        // ✅ Total Maintenance Expense
        const totalExpense = (v.vehicle_maintenance || []).reduce(
          (sum, item) => sum + Number(item.cost || 0),
          0
        );

        // ✅ Total Trips Count
        const totalTrips = (v.trips || []).length;

        // ✅ Total Trip Profit
        const totalTripProfit = (v.trips || []).reduce(
          (sum, trip) => sum + Number(trip.net_profit || 0),
          0
        );

        // ✅ Net Profit (After Expense)
        const netProfit = totalTripProfit - totalExpense;

        return {
          ...v,
          totalExpense,
          totalTrips,
          totalTripProfit,
          netProfit,
        };
      });

      setVehicles(formatted);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // ✅ Add Vehicle
  const handleAddVehicle = async () => {
    if (!name || !number) return alert("Enter vehicle details");

    const { error } = await supabase
      .from("vehicles")
      .insert([{ vehicle_name: name, vehicle_number: number, odometer: 0 }]);

    if (error) {
      console.error("Insert Error:", error.message);
      return;
    }

    setName("");
    setNumber("");
    fetchVehicles();
  };

  // ✅ Delete Vehicle
  const handleDelete = async (id) => {
    if (!window.confirm("Delete vehicle?")) return;

    const { error } = await supabase.from("vehicles").delete().eq("id", id);

    if (error) {
      console.error("Delete Error:", error.message);
      return;
    }

    fetchVehicles();
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Vehicle Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your vehicles, expenses and trips
        </p>
      </div>

      {/* Add Vehicle Button */}
      <div className="max-w-2xl text-end mb-8">
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
        >
          + Add New Vehicle
        </button>
      </div>

      {/* ================= VEHICLE MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Add New Vehicle
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500">
                  Vehicle Name
                </label>
                <input
                  type="text"
                  placeholder="Enter vehicle name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border mt-1 p-2.5 text-sm rounded-lg focus:ring-2 focus:ring-black outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  placeholder="Enter vehicle number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value.toUpperCase())}
                  className="w-full border mt-1 p-2.5 text-sm rounded-lg uppercase focus:ring-2 focus:ring-black outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                handleAddVehicle();
                setShowModal(false);
              }}
              className="mt-6 w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              Add Vehicle
            </button>
          </div>
        </div>
      )}

      {/* Vehicle Cards */}
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition duration-200"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {v.vehicle_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {v.vehicle_number}
                </p>
              </div>
            </div>

            <div className="border-t my-4"></div>

            {/* Info Section */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Odometer</span>
                <span className="font-medium text-gray-700">
                  {v.odometer || 0} KM
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Trip Profit</span>
                <span className="font-semibold text-green-600">
                  ₹ {v.totalTripProfit || 0}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Maintenance Expense
                </span>
                <span className="font-semibold text-red-500">
                  ₹ {v.totalExpense || 0}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Total Trips</span>
                <span className="font-semibold text-blue-600">
                  {v.totalTrips || 0}
                </span>
              </div>

              <div className="border-t pt-2 flex justify-between text-sm">
                <span className="font-semibold">Net Profit</span>
                <span
                  className={`font-bold ${
                    v.netProfit >= 0
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  ₹ {v.netProfit || 0}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => navigate(`/vehicle/${v.id}`)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-xs hover:bg-blue-700 transition"
              >
                <FaTools size={12} />
                Manage
              </button>

              <button
                onClick={() => handleDelete(v.id)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg text-xs hover:bg-red-600 transition"
              >
                <FaTrash size={12} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleListPage;