 

import  { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { Eye, EyeOff } from "lucide-react";
import { AiOutlineDelete } from "react-icons/ai";

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [expandedTripId, setExpandedTripId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("all");

  const [vehicleMap, setVehicleMap] = useState({}); // vehicle_id -> vehicle_name
  const dateInputRef = useRef(null);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch vehicles for mapping
  useEffect(() => {
    const fetchVehicles = async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, vehicle_name");
      if (!error && data) {
        const map = {};
        data.forEach((v) => (map[v.id] = v.vehicle_name));
        setVehicleMap(map);
      }
    };
    fetchVehicles();
  }, []);

  // Fetch trips
  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .order("id", { ascending: false });

    if (!error) setTrips(data);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Unique vehicles for dropdown
  const vehicles = useMemo(() => {
    return ["all", ...new Set(trips.map((t) => t.vehicle_id).filter(Boolean))];
  }, [trips]);

  // Delete trip
  const handleDelete = async () => {
    await supabase.from("trips").delete().eq("id", deleteId);
    setDeleteId(null);
    fetchTrips();
  };

  // Search + Date + Vehicle Filter
  const filteredTrips = trips.filter((trip) => {
    const vehicleName = vehicleMap[trip.vehicle_id] || "";
    const matchesSearch =
      trip.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      vehicleName.toLowerCase().includes(search.toLowerCase());

    const matchesDate = filterDate
      ? trip.from_date?.slice(0, 10) === filterDate
      : true;

    const matchesVehicle =
      selectedVehicle === "all" || trip.vehicle_id === Number(selectedVehicle);

    return matchesSearch && matchesDate && matchesVehicle;
  });

  return (
    <div className="p-2 min-h-screen bg-gray-100">
      <h2 className="text-xl text-center sm:text-2xl font-bold mb-6 text-gray-800">
        Completed Trips
      </h2>

      {/* Search + Calendar + Vehicle Filter */}
      <div className="flex flex-rpw sm:flex-row gap-1 justify-between items-center mb-6 max-w-4xl mx-auto">
        {/* Search + Calendar */}
        <div className="relative w-full sm:flex-1">
          <input
            type="text"
            placeholder="Search by customer or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 px-4 pr-12 border border-gray-300 rounded-lg shadow-sm 
                 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
          />

          {/* Hidden Date Input */}
          <input
            type="date"
            ref={dateInputRef}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="absolute opacity-0 pointer-events-none"
          />
        </div>

        {/* Vehicle Dropdown */}
        <div className="w-full sm:w-52">
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full h-11 px-3 border border-gray-300 rounded-lg shadow-sm 
                 focus:ring-2 focus:ring-blue-400 focus:outline-none 
                 bg-white text-sm"
          >
            {vehicles.map((vehicleId, index) => (
              <option key={index} value={vehicleId}>
                {vehicleId === "all" ? "All Vehicles" : vehicleMap[vehicleId]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trips List */}
      <ul className="space-y-3 max-w-3xl mx-auto">
        {filteredTrips.map((trip) => {
          const vehicleName = vehicleMap[trip.vehicle_id] || "-";
          return (
            <li
              key={trip.id}
              className="bg-white py-2 px-4 rounded-lg shadow border"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">
                    {trip.id} - {trip.customer_name}-{" "}
                    <span className="text-sm text-gray-500">{vehicleName}</span>
                  </p>

                  <p className="text-sm text-gray-500">
                    {trip.from_date
                      ? new Date(trip.from_date).toLocaleDateString([], {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "-"}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setExpandedTripId(
                        expandedTripId === trip.id ? null : trip.id,
                      )
                    }
                    className="p-2 bg-blue-100 rounded-full"
                  >
                    {expandedTripId === trip.id ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                  <button
                    onClick={() => setDeleteId(trip.id)}
                    className="p-2 bg-red-500 text-white rounded-full"
                  >
                    <AiOutlineDelete size={18} />
                  </button>
                </div>
              </div>

              {expandedTripId === trip.id && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm space-y-1">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-blue-700">
                      {trip.from_date
                        ? new Date(trip.from_date).toLocaleDateString([], {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })
                        : "-"}
                    </span>{" "}
                    <span className="text-gray-400">at</span>
                    <span>
                      {trip.from_date
                        ? new Date(trip.from_date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "-"}
                    </span>
                    {" | "}
                    <span className="font-medium  text-red-700">
                      {trip.to_date
                        ? new Date(trip.to_date).toLocaleDateString([], {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })
                        : "-"}
                    </span>{" "}
                    <span className="text-gray-400">at</span>
                    <span>
                      {trip.to_date
                        ? new Date(trip.to_date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "-"}
                    </span>
                  </p>
                  <div className="flex justify-between">
                    <p>
                      <strong>Driver:</strong> {trip.driver}
                    </p>
                    <p>
                      <strong>KMs:</strong> {trip.kms}
                    </p>
                  </div>

                  <p>
                    <strong>Route:</strong>{" "}
                    <span className="text-blue-600 font-medium">
                      {trip.destination_from} →{" "}
                      <span className="text-red-700">
                        {trip.destination_to}
                      </span>
                    </span>
                  </p>

                  <hr className="my-2" />

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <tbody>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-2 font-medium border">
                            Total Amount
                          </td>
                          <td className="px-4 py-2 border text-right text-blue-600 font-semibold">
                            ₹{trip.total_amount}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-medium border">Fuel</td>
                          <td className="px-4 py-2 border text-right">
                            ₹{trip.fuel_expense || 0}
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-2 font-medium border">Toll</td>
                          <td className="px-4 py-2 border text-right">
                            ₹{trip.toll_expense || 0}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-medium border">
                            Driver Salary
                          </td>
                          <td className="px-4 py-2 border text-right">
                            ₹{trip.driver_salary || 0}
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-2 font-medium border">
                            Other
                          </td>
                          <td className="px-4 py-2 border text-right">
                            ₹{trip.other_expense || 0}
                          </td>
                        </tr>
                        <tr className="font-semibold bg-gray-100">
                          <td className="px-4 py-2 border">Total Expense</td>
                          <td className="px-4 py-2 border text-right text-red-600">
                            ₹
                            {Number(trip.fuel_expense || 0) +
                              Number(trip.toll_expense || 0) +
                              Number(trip.driver_salary || 0) +
                              Number(trip.other_expense || 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* Net Profit */}
                  <p
                    className={`mt-3 text-lg font-bold ${
                      trip.net_profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Net Profit: ₹{trip.net_profit || 0}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="font-semibold mb-4">Delete this trip?</h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsPage;
