// import  { useState, useEffect } from "react";
// import { supabase } from "../supabaseClient";

// const DriverPage = () => {
//   const [drivers, setDrivers] = useState([]);
//   const [driverName, setDriverName] = useState("");
//   const [driverMobile, setDriverMobile] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false); // ✅ Modal state

//   // Fetch all drivers
//   const fetchDrivers = async () => {
//     const { data, error } = await supabase
//       .from("drivers")
//       .select("*")
//       .order("id", { ascending: true });

//     if (error) {
//       alert("Failed to fetch drivers");
//       console.error(error);
//     } else {
//       setDrivers(data);
//     }
//   };

//   useEffect(() => {
//     fetchDrivers();
//   }, []);

//   // Add or Update driver
//   const handleSave = async () => {
//     if (!driverName.trim() || !driverMobile.trim()) {
//       alert("Please enter both driver name and mobile number");
//       return;
//     }

//     setLoading(true);

//     try {
//       if (editingId) {
//         const { error } = await supabase
//           .from("drivers")
//           .update({
//             driver_name: driverName,
//             driver_mobile: driverMobile,
//           })
//           .eq("id", editingId);

//         if (error) throw error;
//       } else {
//         const { error } = await supabase.from("drivers").insert([
//           {
//             driver_name: driverName,
//             driver_mobile: driverMobile,
//           },
//         ]);

//         if (error) throw error;
//       }

//       // Reset form
//       setDriverName("");
//       setDriverMobile("");
//       setEditingId(null);
//       setShowModal(false);
//       fetchDrivers();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to save driver");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Edit driver
//   const handleEdit = (driver) => {
//     setDriverName(driver.driver_name);
//     setDriverMobile(driver.driver_mobile);
//     setEditingId(driver.id);
//     setShowModal(true); // ✅ Open modal in edit mode
//   };

//   // Delete driver
//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this driver?"))
//       return;

//     const { error } = await supabase.from("drivers").delete().eq("id", id);
//     if (error) alert("Failed to delete driver");
//     else fetchDrivers();
//   };

//   return (
//     <div className="min-h-screen p-4 sm:p-8 bg-gray-100">
//       <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-6 text-center">
//         Manage Drivers
//       </h2>

//       {/* ✅ Add Driver Button */}
//       <div className="max-w-md mx-auto mb-6 text-right">
//         <button
//           onClick={() => {
//             setEditingId(null);
//             setDriverName("");
//             setDriverMobile("");
//             setShowModal(true);
//           }}
//           className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
//         >
//           + Add Driver
//         </button>
//       </div>

//       {/* Driver List */}
//       <div className="max-w-md mx-auto bg-white p-4 rounded-xl shadow">
//         {drivers.length === 0 ? (
//           <p className="text-gray-500 text-center">No drivers found.</p>
//         ) : (
//           <ul className="space-y-3">
//             {drivers.map((driver) => (
//               <li
//                 key={driver.id}
//                 className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border"
//               >
//                 <div>
//                   <p className="font-medium text-gray-800">
//                     {driver.driver_name}
//                   </p>
//                   <p className="text-gray-500 text-sm">
//                     {driver.driver_mobile}
//                   </p>
//                 </div>

//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => handleEdit(driver)}
//                     className="text-blue-600 text-sm font-medium"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => handleDelete(driver.id)}
//                     className="text-red-600 text-sm font-medium"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {/* ================= MODAL ================= */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl relative">

//             {/* Close Button */}
//             <button
//               onClick={() => setShowModal(false)}
//               className="absolute top-3 right-3 text-gray-400 hover:text-black"
//             >
//               ✕
//             </button>

//             <h3 className="text-lg font-semibold mb-6">
//               {editingId ? "Update Driver" : "Add Driver"}
//             </h3>

//             <div className="space-y-4">
//               <input
//                 type="text"
//                 value={driverName}
//                 onChange={(e) => setDriverName(e.target.value)}
//                 placeholder="Driver Name"
//                 className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none"
//               />

//               <input
//                 type="text"
//                 value={driverMobile}
//                 onChange={(e) => setDriverMobile(e.target.value)}
//                 placeholder="Driver Mobile"
//                 className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none"
//               />
//             </div>

//             <button
//               onClick={handleSave}
//               disabled={loading}
//               className="mt-6 w-full bg-[#D4AF37] text-white py-2.5 rounded-lg font-medium hover:bg-yellow-500 transition disabled:opacity-50"
//             >
//               {loading
//                 ? "Saving..."
//                 : editingId
//                 ? "Update Driver"
//                 : "Add Driver"}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DriverPage;