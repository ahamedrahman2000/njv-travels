import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Truck, Plus, X } from "lucide-react";

const EnquiryPage = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [driver, setDriver] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toDate, setToDate] = useState("");
  const [toTime, setToTime] = useState("");
  const [destinationFrom, setDestinationFrom] = useState("");
  const [destinationTo, setDestinationTo] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  // Fetch vehicles only
  useEffect(() => {
    fetchVehicles();
    fetchEnquiries();
  }, []);

  const fetchVehicles = async () => {
    const { data } = await supabase
      .from("vehicles")
      .select("id, vehicle_name");
    if (data) setVehicles(data);
  };

  const fetchEnquiries = async () => {
    const { data } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setEnquiries(data);
  };

  const resetForm = () => {
    setCustomerName("");
    setCustomerNumber("");
    setVehicle("");
    setDriver("");
    setFromDate("");
    setFromTime("");
    setToDate("");
    setToTime("");
    setDestinationFrom("");
    setDestinationTo("");
    setTotalAmount("");
    setEditingId(null);
  };

  const handleSave = async () => {
    // Validation
    if (!customerName || !customerNumber || !vehicle || !driver || 
        !fromDate || !fromTime || !toDate || !toTime || 
        !destinationFrom || !destinationTo || !totalAmount) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    const enquiryData = {
      customer_name: customerName,
      customer_number: customerNumber,
      vehicle_id: parseInt(vehicle),
      driver: driver, // Manual driver entry
      from_date: fromDate,
      from_time: fromTime,
      to_date: toDate,
      to_time: toTime,
      destination_from: destinationFrom,
      destination_to: destinationTo,
      total_amount: parseFloat(totalAmount),
      advance: 0,
      balance: parseFloat(totalAmount),
    };

    try {
      if (editingId) {
        // Update existing enquiry
        const { error } = await supabase
          .from("enquiries")
          .update(enquiryData)
          .eq("id", editingId);
        
        if (error) throw error;
        alert("Enquiry updated successfully!");
      } else {
        // Insert new enquiry
        const { error } = await supabase
          .from("enquiries")
          .insert([enquiryData]);
        
        if (error) throw error;
        alert("Enquiry saved successfully!");
      }

      resetForm();
      setShowForm(false);
      fetchEnquiries();
    } catch (error) {
      console.error("Error saving enquiry:", error);
      alert("Error saving enquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (enquiry) => {
    setEditingId(enquiry.id);
    setCustomerName(enquiry.customer_name || "");
    setCustomerNumber(enquiry.customer_number || "");
    setVehicle(enquiry.vehicle_id?.toString() || "");
    setDriver(enquiry.driver || "");
    setFromDate(enquiry.from_date || "");
    setFromTime(enquiry.from_time || "");
    setToDate(enquiry.to_date || "");
    setToTime(enquiry.to_time || "");
    setDestinationFrom(enquiry.destination_from || "");
    setDestinationTo(enquiry.destination_to || "");
    setTotalAmount(enquiry.total_amount?.toString() || "");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;
    
    try {
      const { error } = await supabase
        .from("enquiries")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      alert("Enquiry deleted successfully!");
      fetchEnquiries();
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      alert("Error deleting enquiry. Please try again.");
    }
  };

  const handleTakeOrder = async (enquiry) => {
    try {
      // Check if order already exists
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("customer_name", enquiry.customer_name)
        .eq("customer_number", enquiry.customer_number)
        .eq("destination_from", enquiry.destination_from)
        .eq("destination_to", enquiry.destination_to)
        .maybeSingle();

      if (existingOrder) {
        alert("This order already exists in orders!");
        return;
      }

      // Move enquiry to orders
      const orderData = {
        vehicle_id: enquiry.vehicle_id,
        driver: enquiry.driver,
        customer_name: enquiry.customer_name,
        customer_number: enquiry.customer_number,
        from_date: enquiry.from_date,
        from_time: enquiry.from_time,
        to_date: enquiry.to_date,
        to_time: enquiry.to_time,
        destination_from: enquiry.destination_from,
        destination_to: enquiry.destination_to,
        total_amount: enquiry.total_amount,
        advance: 0,
        balance: enquiry.total_amount,
      };

      const { error: insertError } = await supabase
        .from("orders")
        .insert([orderData]);

      if (insertError) throw insertError;

      // Delete from enquiries
      const { error: deleteError } = await supabase
        .from("enquiries")
        .delete()
        .eq("id", enquiry.id);

      if (deleteError) throw deleteError;

      alert("Order taken successfully!");
      fetchEnquiries();
      navigate("/orders");
    } catch (error) {
      console.error("Error taking order:", error);
      alert("Error taking order. Please try again.");
    }
  };

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.vehicle_name : "Unknown";
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-full transition"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Enquiries
            </h2>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} />
            New Enquiry
          </button>
        </div>

        {/* Enquiries List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enquiries.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow">
              <p className="text-gray-500 text-lg">No enquiries found</p>
              <p className="text-gray-400 text-sm mt-1">Create a new enquiry to get started</p>
            </div>
          ) : (
            enquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-800 truncate">
                        {enquiry.customer_name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        📱 {enquiry.customer_number}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full whitespace-nowrap ml-2">
                      Enquiry
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Vehicle & Driver */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{getVehicleName(enquiry.vehicle_id)}</span>
                    <span className="text-gray-300">•</span>
                    <span className="truncate">👤 {enquiry.driver}</span>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="font-medium text-gray-700">📍</span>
                    <span className="truncate">{enquiry.destination_from}</span>
                    <span className="text-gray-400">→</span>
                    <span className="truncate">{enquiry.destination_to}</span>
                  </div>

                  {/* Date & Time */}
                  <div className="text-xs text-gray-500 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1">
                      <span>📅</span>
                      {new Date(enquiry.from_date).toLocaleDateString()}
                      <span className="text-gray-300">|</span>
                      {enquiry.from_time}
                    </span>
                    <span className="text-gray-300">→</span>
                    <span className="flex items-center gap-1">
                      <span>📅</span>
                      {new Date(enquiry.to_date).toLocaleDateString()}
                      <span className="text-gray-300">|</span>
                      {enquiry.to_time}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <span className="text-lg font-bold text-purple-600">
                      ₹{enquiry.total_amount}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleTakeOrder(enquiry)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                    >
                      <Truck size={16} />
                      Take Order
                    </button>
                    <button
                      onClick={() => handleEdit(enquiry)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(enquiry.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Popup Form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
            {/* Popup Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? "Edit Enquiry" : "New Enquiry"}
              </h3>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-3">
              {/* Customer */}
              <div>
                <label className="block mb-1 font-medium text-gray-600 text-sm">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-600 text-sm">
                  Customer Mobile *
                </label>
                <input
                  type="number"
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  placeholder="Enter mobile number"
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Vehicle & Driver */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-600 text-sm">
                    Select Vehicle *
                  </label>
                  <select
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vehicle_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-600 text-sm">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    value={driver}
                    onChange={(e) => setDriver(e.target.value)}
                    placeholder="Enter driver name"
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Dates & Times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-600 text-sm">From Date *</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-600 text-sm">From Time *</label>
                  <input
                    type="time"
                    value={fromTime}
                    onChange={(e) => setFromTime(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-600 text-sm">To Date *</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-600 text-sm">To Time *</label>
                  <input
                    type="time"
                    value={toTime}
                    onChange={(e) => setToTime(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Destinations */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-600 text-sm">Destination From *</label>
                  <input
                    type="text"
                    value={destinationFrom}
                    onChange={(e) => setDestinationFrom(e.target.value)}
                    placeholder="From"
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-600 text-sm">Destination To *</label>
                  <input
                    type="text"
                    value={destinationTo}
                    onChange={(e) => setDestinationTo(e.target.value)}
                    placeholder="To"
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Total Amount */}
              <div>
                <label className="block mb-1 font-medium text-gray-600 text-sm">
                  Total Amount *
                </label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="Enter total amount"
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingId ? "Update" : "Save"}
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiryPage;