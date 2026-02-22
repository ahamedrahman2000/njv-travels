import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const BookingForm = () => {
  // State for vehicles and drivers
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

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

  // Fetch vehicles and drivers
  useEffect(() => {
    const fetchData = async () => {
      const { data: vehicleData, error: vehicleError } = await supabase
        .from("vehicles")
        .select("vehicle_name");
      if (!vehicleError) setVehicles(vehicleData || []);

      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("driver_name");
      if (!driverError) setDrivers(driverData || []);
    };
    fetchData();
  }, []);

  // Auto-calculate balance
  useEffect(() => {
    const total = parseFloat(totalAmount) || 0;
    const adv = parseFloat(advance) || 0;
    setBalance(total - adv);
  }, [totalAmount, advance]);

  // Handle save booking
  const handleSave = async () => {
    // Validate required fields
    if (
      !vehicle ||
      !driver ||
      !customerName ||
      !customerNumber ||
      !fromDate ||
      !fromTime ||
      !toDate ||
      !toTime ||
      !destinationFrom ||
      !destinationTo ||
      isNaN(parseFloat(totalAmount)) ||
      isNaN(parseFloat(advance))
    ) {
      alert("Please fill all required fields correctly.");
      return;
    }

    setLoading(true);

    // Combine date + time properly
    const fromDateTime = `${fromDate}T${fromTime}`; // ISO format YYYY-MM-DDTHH:MM
    const toDateTime = `${toDate}T${toTime}`;

    const { error } = await supabase.from("orders").insert([
      {
        customer_name: customerName,
        customer_number: customerNumber,
        vehicle,
        driver,
        from_date: fromDateTime, // store timestamp
        to_date: toDateTime, // store timestamp
        destination_from: destinationFrom,
        destination_to: destinationTo,
        total_amount: parseFloat(totalAmount),
        advance: parseFloat(advance),
        balance: parseFloat(balance),
        from_time: fromTime, // optional separate time field
        to_time: toTime, // optional separate time field
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Failed to save booking: " + error.message);
      return;
    }

    alert("Booking saved successfully ✅");

    // Reset form
    setVehicle("");
    setDriver("");
    setCustomerName("");
    setCustomerNumber("");
    setFromDate("");
    setToDate("");
    setFromTime("");
    setToTime("");
    setDestinationFrom("");
    setDestinationTo("");
    setTotalAmount("");
    setAdvance("");
    setBalance(0);
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
            placeholder="Enter customer name"
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
            placeholder="Enter mobile number"
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
              <option value="">Select Vehicle</option>
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
              <option value="">Select Driver</option>
              {drivers.map((d) => (
                <option key={d.driver_name} value={d.driver_name}>
                  {d.driver_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates & Times */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>From Date *</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label>From Time *</label>
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label>To Date *</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label>To Time *</label>
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        {/* Destinations */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Destination From *</label>
            <input
              type="text"
              value={destinationFrom}
              onChange={(e) => setDestinationFrom(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label>Destination To *</label>
            <input
              type="text"
              value={destinationTo}
              onChange={(e) => setDestinationTo(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        {/* Amounts */}

        <div>
          <label>Total Amount *</label>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label>Advance</label>
          <input
            type="number"
            value={advance}
            onChange={(e) => setAdvance(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label>Balance</label>
          <input
            type="number"
            value={balance}
            readOnly
            className="w-full border p-2 rounded bg-gray-100 text-red-600 font-semibold"
          />
        </div>

        {/* Buttons */}

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#D4AF37] w-full text-white px-6 py-2 rounded font-semibold"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default BookingForm;
