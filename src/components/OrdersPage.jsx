 
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { AiOutlineDelete } from "react-icons/ai";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [payment, setPayment] = useState({});
  const [expenses, setExpenses] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState("all");
  const [vehicleMap, setVehicleMap] = useState({}); // vehicle_id -> vehicle_name

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

  // Fetch orders
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: true });
    if (error) console.error(error);
    else setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Unique Vehicles
  const vehicles = useMemo(
    () => ["all", ...new Set(orders.map((o) => o.vehicle_id).filter(Boolean))],
    [orders],
  );

  // Filtered Orders
  const filteredOrders =
    selectedVehicle === "all"
      ? orders
      : orders.filter((o) => o.vehicle_id === Number(selectedVehicle));

  // Total Pending
  const totalPending = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + Number(o.balance || 0), 0),
    [filteredOrders],
  );

  // Handle Expense
  const handleExpenseChange = (id, field, value) => {
    setExpenses((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value === "" ? "" : Number(value) },
    }));
  };

  // Complete Trip → Move to Trips table including date + time
  const handleComplete = async (order) => {
    const fuel = Number(expenses[order.id]?.fuel || 0);
    const toll = Number(expenses[order.id]?.toll || 0);
    const driverSalary = Number(expenses[order.id]?.driverSalary || 0);
    const other = Number(expenses[order.id]?.other || 0);
    const kms = Number(expenses[order.id]?.kms || 0);
    const payAmount = Number(payment[order.id] || 0);

    if (payAmount !== Number(order.balance)) {
      alert(`You must pay exact pending amount ₹${order.balance}`);
      return;
    }

    if ([fuel, toll, driverSalary, other, kms].some((v) => isNaN(v))) {
      alert("Please fill all expense fields correctly");
      return;
    }

    const totalExpense = fuel + toll + driverSalary + other;
    const netProfit = Number(order.total_amount || 0) - totalExpense;

    const tripData = {
      vehicle_id: order.vehicle_id, // use vehicle_id
      driver: order.driver,
      customer_name: order.customer_name,
      customer_number: order.customer_number,
      from_date: `${order.from_date}T${order.from_time}`,
      to_date: `${order.to_date}T${order.to_time}`,
      destination_from: order.destination_from,
      destination_to: order.destination_to,
      total_amount: order.total_amount,
      advance: order.advance,
      balance: 0,
      kms,
      fuel_expense: fuel,
      toll_expense: toll,
      driver_salary: driverSalary,
      other_expense: other,
      net_profit: netProfit,
    };

    // 1️⃣ Insert trip
    const { error: insertError } = await supabase
      .from("trips")
      .insert([tripData]);
    if (insertError) {
      console.error(insertError);
      alert("Failed to complete trip: " + insertError.message);
      return;
    }

    // 2️⃣ Fetch vehicle odometer
    const { data: vehicleData, error: vehicleFetchError } = await supabase
      .from("vehicles")
      .select("odometer")
      .eq("id", order.vehicle_id)
      .single();

    if (vehicleFetchError) {
      console.error(vehicleFetchError);
      alert("Trip saved but failed to fetch vehicle odometer");
      return;
    }

    const updatedOdometer = Number(vehicleData.odometer || 0) + kms;

    // 3️⃣ Update vehicle odometer
    const { error: updateError } = await supabase
      .from("vehicles")
      .update({ odometer: updatedOdometer })
      .eq("id", order.vehicle_id);

    if (updateError) {
      console.error(updateError);
      alert("Trip saved but failed to update odometer");
      return;
    }

    // 4️⃣ Delete order
    const { error: deleteError } = await supabase
      .from("orders")
      .delete()
      .eq("id", order.id);

    if (deleteError) {
      console.error(deleteError);
      alert("Failed to remove order from pending");
      return;
    }

    alert("Trip completed successfully ✅");

    setPayment((prev) => ({ ...prev, [order.id]: "" }));
    setExpenses((prev) => ({ ...prev, [order.id]: {} }));
    setExpandedId(null);
    fetchOrders();
  };

  const handleDelete = async (orderId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?",
    );
    if (!confirmDelete) return;

    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      console.error(error);
      alert("Failed to delete order");
      return;
    }

    alert("Order deleted successfully ✅");
    fetchOrders();
  };

  return (
    <div className="px-3 py-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="flex justify-between text-xl sm:text-2xl font-bold text-gray-800">
          Pending Orders
          <span className="font-bold text-red-600">
            ₹{totalPending.toLocaleString()}
          </span>
        </h2>
        <select
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className="px-3 py-3 border rounded-lg text-sm bg-white"
        >
          {vehicles.map((v) => (
            <option key={v} value={v}>
              {v === "all" ? "All Vehicles" : vehicleMap[v]}
            </option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No pending orders found.
        </p>
      )}

      {filteredOrders.map((order) => {
        const fuel = expenses[order.id]?.fuel ?? "";
        const toll = expenses[order.id]?.toll ?? "";
        const driverSalary = expenses[order.id]?.driverSalary ?? "";
        const other = expenses[order.id]?.other ?? "";
        const kms = expenses[order.id]?.kms ?? "";
        const payAmount = payment[order.id] ?? "";

        const totalExpense =
          Number(fuel || 0) +
          Number(toll || 0) +
          Number(driverSalary || 0) +
          Number(other || 0);
        const netProfit = Number(order.total_amount || 0) - totalExpense;

        const allFieldsFilled =
          fuel !== "" &&
          toll !== "" &&
          driverSalary !== "" &&
          other !== "" &&
          kms !== "" &&
          payAmount !== "" &&
          Number(payAmount) === Number(order.balance);

        return (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-sm border px-3 py-4 mb-4"
          >
            <div className="flex items-center justify-between flex-nowrap">
              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  #{order.id} - {order.customer_name}
                  {order.vehicle_id && (
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      ({vehicleMap[order.vehicle_id]})
                    </span>
                  )}
                </p>
                <p className="text-xs flex flex-col sm:text-sm text-gray-500 truncate">
                  <span>
                    {order.from_date
                      ? new Date(order.from_date).toLocaleDateString()
                      : ""}{" "}
                    {order.from_time || ""}
                  </span>
                  <span>
                    {order.to_date
                      ? new Date(order.to_date).toLocaleDateString()
                      : ""}{" "}
                    {order.to_time || ""}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                  ₹{order.balance}
                </span>
                <button
                  onClick={() =>
                    setExpandedId(expandedId === order.id ? null : order.id)
                  }
                  className="text-xs sm:text-sm text-blue-600 font-medium"
                >
                  {expandedId === order.id ? "Hide" : "Manage"}
                </button>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="text-xs sm:text-sm text-red-600 font-medium"
                >
                  <AiOutlineDelete size={18} />
                </button>
              </div>
            </div>

            {expandedId === order.id && (
              <div className="mt-4 border-t pt-3 space-y-3 text-sm">
                <input
                  type="number"
                  placeholder="Total KMs"
                  className="w-full sm:w-40 px-3 py-1.5 border rounded-lg text-sm"
                  value={kms}
                  onChange={(e) =>
                    handleExpenseChange(order.id, "kms", e.target.value)
                  }
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="number"
                    placeholder="Fuel"
                    value={fuel}
                    className="px-2 py-1.5 border rounded-lg text-sm"
                    onChange={(e) =>
                      handleExpenseChange(order.id, "fuel", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Toll"
                    value={toll}
                    className="px-2 py-1.5 border rounded-lg text-sm"
                    onChange={(e) =>
                      handleExpenseChange(order.id, "toll", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Driver Salary"
                    value={driverSalary}
                    className="px-2 py-1.5 border rounded-lg text-sm"
                    onChange={(e) =>
                      handleExpenseChange(
                        order.id,
                        "driverSalary",
                        e.target.value,
                      )
                    }
                  />
                  <input
                    type="number"
                    placeholder="Other"
                    value={other}
                    className="px-2 py-1.5 border rounded-lg text-sm"
                    onChange={(e) =>
                      handleExpenseChange(order.id, "other", e.target.value)
                    }
                  />
                </div>

                <div className="flex justify-between bg-gray-50 px-3 py-2 rounded-lg text-xs">
                  <span>
                    Expense: <strong>₹{totalExpense}</strong>
                  </span>
                  <span
                    className={`${netProfit >= 0 ? "text-green-600" : "text-red-600"} font-semibold`}
                  >
                    Profit: ₹{netProfit}
                  </span>
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder={`₹${order.balance}`}
                    value={payAmount}
                    className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                    onChange={(e) =>
                      setPayment((prev) => ({
                        ...prev,
                        [order.id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    disabled={!allFieldsFilled}
                    onClick={() => handleComplete(order)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition
                      ${allFieldsFilled ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                  >
                    Complete
                  </button>
                </div>

                {!allFieldsFilled && (
                  <p className="text-xs text-red-500">
                    Fill all fields & exact payment
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrdersPage;
