import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams } from "react-router-dom";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";

const VehicleDetailPage = () => {
  const { id } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [items, setItems] = useState([]);

  // Maintenance input & modal
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [serviceKm, setServiceKm] = useState("");
  // Popup
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const fetchData = useCallback(async () => {
    const { data: vData, error: vError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .single();

    if (vError) return console.error(vError.message);

    const { data: mData, error: mError } = await supabase
      .from("vehicle_maintenance")
      .select("*")
      .eq("vehicle_id", id)
      .order("service_date", { ascending: false });

    if (mError) console.error(mError.message);

    setVehicle(vData);
    setItems(mData || []);
  }, [id]); // ✅ add id as dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]); // ✅ now ESLint happy

  // Update vehicle details
  const updateVehicle = async () => {
    const { error } = await supabase
      .from("vehicles")
      .update({
        vehicle_name: vehicle.vehicle_name,
        vehicle_number: vehicle.vehicle_number,
        odometer: vehicle.odometer,
      })
      .eq("id", id);

    if (!error) alert("Vehicle updated successfully");
  };

  // Add/Edit maintenance item
  const saveMaintenance = async () => {
    if (!title || !cost || !date) return alert("Fill all fields");

    const maintenanceData = {
      vehicle_id: id,
      title: title,
      cost: Number(cost),
      service_date: date,
      type: "Maintenance",
      description: description, // ✅ use real description
      service_km: Number(serviceKm), // ✅ add this
    };
    let error;
    if (editingId) {
      ({ error } = await supabase
        .from("vehicle_maintenance")
        .update(maintenanceData)
        .eq("id", editingId));
    } else {
      ({ error } = await supabase
        .from("vehicle_maintenance")
        .insert([maintenanceData]));
    }

    if (error) return alert("Failed to save item: " + error.message);

    setPopupMessage(
      editingId ? "Item updated successfully" : "Item added successfully",
    );
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);

    setTitle("");
    setCost("");
    setDate("");
    setEditingId(null);
    setShowModal(false);
    setDescription(""); // ✅ reset
    setServiceKm("");
    fetchData();
  };

  // Delete maintenance item
  const deleteItem = async (mid) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    const { error } = await supabase
      .from("vehicle_maintenance")
      .delete()
      .eq("id", mid);

    if (!error) {
      fetchData();
      setPopupMessage("Item deleted successfully");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } else {
      alert("Failed to delete: " + error.message);
    }
  };

  const total = items.reduce((sum, item) => sum + Number(item.cost || 0), 0);

  if (!vehicle) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 sm:p-8 relative">
      {/* ================= CUSTOM POPUP ================= */}
      {showPopup && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-fadeIn">
          {popupMessage}
        </div>
      )}

      {/* ================= VEHICLE HEADER ================= */}
      <div className="grid grid-cols-2 mb-6">
        <h2 className="text-lg sm:text-3xl font-bold text-gray-800">
          Vehicle Management
        </h2>
        <div className="p-3 sm:p-4 text-center font-bold text-base sm:text-lg">
          ₹ {total}
        </div>
      </div>

      {/* ================= VEHICLE INFO ================= */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-8">
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="text-xs sm:text-sm font-medium">
              Vehicle Name
            </label>
            <input
              value={vehicle.vehicle_name}
              onChange={(e) =>
                setVehicle({ ...vehicle, vehicle_name: e.target.value })
              }
              className="w-full border p-2 sm:p-3 rounded-lg mt-1 text-sm"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium">
              Vehicle Number
            </label>
            <input
              value={vehicle.vehicle_number}
              onChange={(e) =>
                setVehicle({
                  ...vehicle,
                  vehicle_number: e.target.value.toUpperCase(),
                })
              }
              className="w-full border p-2 sm:p-3 rounded-lg mt-1 uppercase text-sm"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs sm:text-sm font-medium">
            Total KM Driven
          </label>
          <input
            type="number"
            value={vehicle.odometer}
            onChange={(e) =>
              setVehicle({ ...vehicle, odometer: e.target.value })
            }
            className="w-full border p-2 sm:p-3 rounded-lg mt-1 text-sm"
          />
        </div>

        <button
          onClick={updateVehicle}
          className="bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg mb-8 sm:mb-10 text-sm sm:text-base w-full sm:w-auto"
        >
          Save Vehicle Details
        </button>

        {/* ================= MAINTENANCE SECTION ================= */}
        <div className="border-t pt-6 sm:pt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold">
              Maintenance Items
            </h3>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition"
            >
              <FaPlus size={14} /> Add Item
            </button>
          </div>

          {/* ================= MODAL ================= */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                <h4 className="font-semibold text-lg mb-4">
                  {editingId ? "Edit Maintenance" : "Add Maintenance"}
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border p-2 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Cost"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="border p-2 rounded-lg text-sm"
                  />
                  <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border p-2 rounded-lg text-sm min-h-[80px] resize-none"
                  ></textarea>

                  <div className="relative">
                    <label className="text-xs text-gray-500 block mb-1">
                      Service Date
                    </label>

                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full border p-2.5 pr-10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />

                    {/* Calendar Icon */}
                    <span className="absolute right-3 top-[36px] text-gray-400 pointer-events-none">
                      📅
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">
                      KM at Service
                    </label>
                    <input
                      type="number"
                      placeholder="Enter KM reading"
                      value={serviceKm}
                      onChange={(e) => setServiceKm(e.target.value)}
                      className="w-full border p-2 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveMaintenance}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingId ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= MAINTENANCE TABLE ================= */}
          <div className="overflow-x-auto mt-6">
            <div className="bg-white rounded-xl shadow-sm  border-gray-200">
              <table className="min-w-full text-sm text-gray-700">
                {/* HEADER */}
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-4 text-left font-semibold">Date</th>
                    <th className="px-2 py-4 text-left font-semibold">Title</th>
                    <th className="px-2 py-4 text-left font-semibold">
                      Description
                    </th>
                    <th className="px-2 py-4 text-right font-semibold">Cost</th>
                    <th className="px-4 py-3 text-left">KM</th>
                    <th className="px-2 py-4 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-2 py-4 whitespace-nowrap text-gray-600">
                        {item.service_date}
                      </td>

                      <td className="px-2 py-4 font-medium text-gray-800">
                        {item.title}
                      </td>

                      <td className="px-2 py-4 text-gray-500 max-w-xs">
                        {item.description}
                      </td>

                      <td className="px-2 py-4 text-right font-semibold text-green-600 whitespace-nowrap">
                        ₹{item.cost}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {item.service_km || "-"} KM
                      </td>

                      <td className="px-2 py-4 text-center">
                        <div className="flex justify-center gap-4">
                          <FaEdit
                            className="cursor-pointer text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              setTitle(item.title);
                              setCost(item.cost);
                              setDate(item.service_date);
                              setDescription(item.description || "");
                              setEditingId(item.id);
                              setShowModal(true);
                            }}
                          />

                          <FaTrash
                            className="cursor-pointer text-red-600 hover:text-red-800"
                            onClick={() => deleteItem(item.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-10 text-gray-400"
                      >
                        No maintenance items found.
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* FOOTER */}
                {items.length > 0 && (
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td
                        colSpan="3"
                        className="px-2 py-4 font-semibold text-gray-700"
                      >
                        Total
                      </td>
                      <td className="px-2 py-4 text-right font-bold text-green-700">
                        ₹{total}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailPage;
