import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { Eye, EyeOff, Calendar } from "lucide-react";
import { AiOutlineDelete } from "react-icons/ai";

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [expandedTripId, setExpandedTripId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const dateInputRef = useRef(null);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch trips
  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .order("id", { ascending: true });

    if (!error) setTrips(data);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Delete
  const handleDelete = async () => {
    await supabase.from("trips").delete().eq("id", deleteId);
    setDeleteId(null);
    fetchTrips();
  };

  // Search + Filter
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      trip.vehicle?.toLowerCase().includes(search.toLowerCase());

    const matchesDate = filterDate ? trip.from_date === filterDate : true;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <h2 className="text-xl  text-center sm:text-2xl font-bold mb-4 text-gray-800">Completed Trips</h2>

      {/* Search + Date Filter */}
      <div className="flex justify-center mb-6">
        <div className="relative w-full md:w-96">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by customer or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 pr-14 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />

          {/* Hidden Date Input */}
          <input
            type="date"
            ref={dateInputRef}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="absolute opacity-0 pointer-events-none"
          />

          {/* Calendar Icon */}
          <button
            type="button"
            onClick={() => dateInputRef.current.showPicker()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition"
          >
            <Calendar size={20} />
          </button>
        </div>
      </div>

      {/* Trips List */}
      <ul className="space-y-3 max-w-3xl mx-auto">
        {filteredTrips.map((trip) => (
          <li key={trip.id} className="bg-white py-2 px-4 rounded-xl shadow border">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  {trip.id} - {trip.customer_name}
                </p>
                <p className="text-sm text-gray-500">{trip.from_date}</p>
              </div>

              <div className="flex gap-3">
                {/* View */}
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

                {/* Delete */}
                <button
                  onClick={() => setDeleteId(trip.id)}
                  className="p-2 bg-red-500 text-white rounded-full"
                >
                  <AiOutlineDelete size={18} />
                </button>
              </div>
            </div>

            {/* Expand Details */}
            {expandedTripId === trip.id && (
              <div className="mt-3 p-3 bg-gray-50 rounded text-sm space-y-1">
                <p>
                  <strong>Vehicle:</strong> {trip.vehicle}
                </p>
                <p>
                  <strong>Driver:</strong> {trip.driver}
                </p>

                <p className="mt-1">
                  <strong>Route:</strong>
                  <span className="text-blue-600 font-medium">
                    {" "}
                    {trip.destination_from} → {trip.destination_to}
                  </span>
                </p>

                <p>
                  <strong>KMs:</strong> {trip.kms}
                </p>

                <hr className="my-2" />

                <p>
                  <strong>Total Amount:</strong> ₹{trip.total_amount}
                </p>
                {/* <p><strong>Advance Paid:</strong> ₹{trip.advance}</p> */}

                <hr className="my-2" />

                <div className="bg-gray-50 p-3 rounded">
                  <p>
                    <strong>Fuel Expense:</strong> ₹{trip.fuel_expense || 0}
                  </p>
                  <p>
                    <strong>Toll Expense:</strong> ₹{trip.toll_expense || 0}
                  </p>
                  <p>
                    <strong>Driver Salary:</strong> ₹{trip.driver_salary || 0}
                  </p>
                  <p>
                    <strong>Other Expense:</strong> ₹{trip.other_expense || 0}
                  </p>

                  <p className="mt-2 font-semibold">
                    Total Expense: ₹
                    {Number(trip.fuel_expense || 0) +
                      Number(trip.toll_expense || 0) +
                      Number(trip.driver_salary || 0) +
                      Number(trip.other_expense || 0)}
                  </p>
                </div>

                <p
                  className={`mt-2 font-bold text-lg ${
                    trip.net_profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Net Profit: ₹{trip.net_profit || 0}
                </p>
              </div>
            )}
          </li>
        ))}
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
