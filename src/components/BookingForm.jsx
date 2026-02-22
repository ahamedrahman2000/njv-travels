import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const BookingForm = () => {
  const navigate = useNavigate();

  // State for vehicles and drivers
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Form states
  const [vehicle, setVehicle] = useState("");
  const [driver, setDriver] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [destinationFrom, setDestinationFrom] = useState("");
  const [destinationTo, setDestinationTo] = useState("");

  const [totalAmount, setTotalAmount] = useState("");
  const [advance, setAdvance] = useState("");
  const [balance, setBalance] = useState(0); 

  const [loading, setLoading] = useState(false);
  const total = parseFloat(totalAmount);
  const adv = parseFloat(advance);
  // Fetch vehicles and drivers
  useEffect(() => {
    const fetchData = async () => {
      const { data: vehicleData, error: vehicleError } = await supabase
        .from("vehicles")
        .select("vehicle_name");
      if (!vehicleError) setVehicles(vehicleData);

      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("driver_name");
      if (!driverError) setDrivers(driverData);
    };
    fetchData();
  }, []);

  // Auto-calculate balance
  useEffect(() => {
    const total = parseFloat(totalAmount) || 0;
    const adv = parseFloat(advance) || 0;
    setBalance(total - adv);
  }, [totalAmount, advance]);

  // Reset form
  const resetForm = () => {
    setVehicle("");
    setDriver("");
    setCustomerName("");
    setCustomerNumber("");
    setFromDate("");
    setToDate("");
    setDestinationFrom("");
    setDestinationTo("");
    setTotalAmount("");
    setAdvance("");
    setBalance(0); 
  };

  // Handle save booking
  const handleSave = async () => {
    if (
      !vehicle ||
      !driver ||
      !customerName ||
      !customerNumber ||
      !fromDate ||
      !toDate ||
      !destinationFrom ||
      !destinationTo ||
      isNaN(total) ||
      isNaN(adv) 
    ) {
      alert("Please fill all required fields!");
      return;
    }

    setLoading(true);

    const bookingData = {
  vehicle,
  driver,
  customer_name: customerName,
  customer_number: customerNumber,
  from_date: fromDate,
  to_date: toDate,
  destination_from: destinationFrom,
  destination_to: destinationTo,
  total_amount: parseFloat(totalAmount),
  advance: parseFloat(advance),
  balance: parseFloat(balance), 
};

    try {
      if (balance === 0) {
        // Save directly to trips
        const { error } = await supabase.from("trips").insert([bookingData]);
        if (error) throw error;
        alert("Booking saved in Trips successfully!");
        resetForm();
        navigate("/trips");
      } else {
        // Save to orders for pending balance
        const { error } = await supabase.from("orders").insert([bookingData]);
        if (error) throw error;
        alert("Booking saved in Orders (pending)!");
        resetForm();
        navigate("/orders");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save booking");
    } finally {
      setLoading(false);
    }
  };

  return (
 <div className="min-h-screen bg-gray-100 px-3 py-4 sm:p-6">

  <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4 text-center">
    New Booking
  </h2>

  <div className="max-w-xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-md space-y-3">
        {/* Customer */}
        <div>
          <label className="block mb-1 font-medium text-gray-600">
            Customer Name *
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-600">
            Customer Mobile *
          </label>
          <input
            type="text"
            value={customerNumber}
            onChange={(e) => setCustomerNumber(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        {/* Vehicle & Driver */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              Select Vehicle *
            </label>
            <select
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
             className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#D4AF37]"
            >
              <option value="">-- Select Vehicle --</option>
              {vehicles.map((v) => (
                <option key={v.vehicle_name} value={v.vehicle_name}>
                  {v.vehicle_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-600">
              Select Driver *
            </label>
            <select
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#D4AF37]"
            >
              <option value="">-- Select Driver --</option>
              {drivers.map((d) => (
                <option key={d.driver_name} value={d.driver_name}>
                  {d.driver_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              From Date *
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              To Date *
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>
        </div>

        {/* Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              Destination From *
            </label>
            <input
              type="text"
              value={destinationFrom}
              onChange={(e) => setDestinationFrom(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              Destination To *
            </label>
            <input
              type="text"
              value={destinationTo}
              onChange={(e) => setDestinationTo(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>
        </div>
        
        {/* Amounts & KMs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              Total Amount *
            </label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              Advance
            </label>
            <input
              type="number"
              value={advance}
              onChange={(e) => setAdvance(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              Balance
            </label>
            <input
              type="number"
              value={balance}
              readOnly
             className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between mt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#D4AF37] text-white px-6 py-2 rounded font-semibold hover:bg-yellow-500 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => alert("WhatsApp share coming soon!")}
            className="bg-green-500 text-white px-6 py-2 rounded font-semibold hover:bg-green-600 transition"
          >
            Share to WhatsApp
          </button>
          {balance > 0 && (
            <button
              className="bg-red-500 text-white px-6 py-2 rounded font-semibold cursor-not-allowed"
              disabled
            >
              Pending
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
