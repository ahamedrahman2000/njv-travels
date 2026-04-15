import { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { AiOutlineDelete } from "react-icons/ai";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [payment, setPayment] = useState({});
  const [expenses, setExpenses] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState("all");
  const [vehicleMap, setVehicleMap] = useState({});

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data } = await supabase
        .from("vehicles")
        .select("id, vehicle_name");

      if (data) {
        const map = {};
        data.forEach((v) => (map[v.id] = v.vehicle_name));
        setVehicleMap(map);
      }
    };
    fetchVehicles();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: true });

    if (data) setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const vehicles = useMemo(
    () => ["all", ...new Set(orders.map((o) => o.vehicle_id).filter(Boolean))],
    [orders],
  );

  const filteredOrders =
    selectedVehicle === "all"
      ? orders
      : orders.filter((o) => o.vehicle_id === Number(selectedVehicle));

  const totalPending = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + Number(o.balance || 0), 0),
    [filteredOrders],
  );

  const handleExpenseChange = (id, field, value) => {
    setExpenses((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value === "" ? "" : Number(value) },
    }));
  };

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

    const totalExpense = fuel + toll + driverSalary + other;
    const netProfit = Number(order.total_amount || 0) - totalExpense;

    const tripData = {
      vehicle_id: order.vehicle_id,
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

    await supabase.from("trips").insert([tripData]);
    await supabase.from("orders").delete().eq("id", order.id);

    alert("Trip completed ✅");

    setExpandedId(null);
    fetchOrders();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    await supabase.from("orders").delete().eq("id", id);
    fetchOrders();
  };

  return (
    <div className="px-3 py-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-4">
        
          <h2 className="text-xl font-semibold text-gray-800">
            Pending
            <span className="text-red-500 ml-1 text-xl font-medium">
              ₹{totalPending.toLocaleString()}
            </span>
          </h2>

          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="border border-gray-200 text-xs px-2 py-1 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {vehicles.map((v) => (
              <option key={v} value={v}>
                {v === "all" ? "All" : vehicleMap[v]}
              </option>
            ))}
          </select>
         
      </div>

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

        return (
          <div
            key={order.id}
            className="border border-gray-200 rounded-lg p-3 mb-3 bg-white shadow-sm hover:shadow-md transition"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  #{order.id} - {order.customer_name}
                </p>
                <p className="text-[11px] text-gray-400">
                  {vehicleMap[order.vehicle_id]}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-red-50 text-red-600 px-2 py-[2px] text-[11px] rounded">
                  ₹{order.balance}
                </span>

                <button
                  onClick={() =>
                    setExpandedId(expandedId === order.id ? null : order.id)
                  }
                  className="text-xs text-blue-600 hover:underline"
                >
                  {expandedId === order.id ? "Hide" : "Manage"}
                </button>

                <button
                  onClick={() => handleDelete(order.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <AiOutlineDelete size={16} />
                </button>
              </div>
            </div>

            {/* Expanded Section */}
            {expandedId === order.id && (
              <div className="mt-3 border-t pt-3 space-y-3 text-xs">
                {/* Route */}
                <div className="bg-gray-50 px-2 py-2 rounded">
                  <p className="text-gray-400 text-[10px] mb-1">Route</p>
                  <div className="flex justify-between font-medium text-gray-700">
                    <span className="truncate">
                      {order.destination_from || "-"}
                    </span>
                    <span className="mx-1 text-gray-400">→</span>
                    <span className="truncate text-right">
                      {order.destination_to || "-"}
                    </span>
                  </div>
                </div>

                {/* Time */}
                <div className="bg-gray-50 px-2 py-2 rounded">
                  <p className="text-gray-400 text-[10px] mb-1">Trip</p>
                  <div className="flex justify-between font-medium text-gray-700">
                    <span>
                      {order.from_date
                        ? new Date(order.from_date).toLocaleDateString()
                        : ""}{" "}
                      {order.from_time || ""}
                    </span>
                    <span className="mx-1 text-gray-400">→</span>
                    <span className="text-right">
                      {order.to_date
                        ? new Date(order.to_date).toLocaleDateString()
                        : ""}{" "}
                      {order.to_time || ""}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded text-center">
                  <div>
                    <p className="text-gray-400 text-[10px]">Total</p>
                    <p className="font-semibold text-gray-800">
                      ₹{order.total_amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px]">Adv</p>
                    <p className="font-semibold text-gray-800">
                      ₹{order.advance}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px]">Due</p>
                    <p className="font-semibold text-red-500">
                      ₹{order.balance}
                    </p>
                  </div>
                </div>
                {/* Calculation */}
                <div className="flex justify-between bg-gray-100 px-2 py-2 rounded text-xs">
                  <span>
                    Trip Exp: <strong>₹{totalExpense}</strong>
                  </span>
                  <span
                    className={`font-semibold ${
                      netProfit >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    Profit ₹{netProfit}
                  </span>
                </div>

                {/* KM */}
                <input
                  type="number"
                  placeholder="KMs"
                  value={kms}
                  onChange={(e) =>
                    handleExpenseChange(order.id, "kms", e.target.value)
                  }
                  className="w-full border border-gray-200 px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />

                {/* Expenses */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: "fuel", value: fuel, placeholder: "Fuel" },
                    { key: "toll", value: toll, placeholder: "Toll" },
                    {
                      key: "driverSalary",
                      value: driverSalary,
                      placeholder: "Driver",
                    },
                    { key: "other", value: other, placeholder: "Other" },
                  ].map((item) => (
                    <input
                      key={item.key}
                      type="number"
                      placeholder={item.placeholder}
                      value={item.value}
                      onChange={(e) =>
                        handleExpenseChange(order.id, item.key, e.target.value)
                      }
                      className="border border-gray-200 px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  ))}
                </div>

                {/* Payment */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={`Due ₹${order.balance}`}
                    value={payAmount}
                    onChange={(e) =>
                      setPayment((prev) => ({
                        ...prev,
                        [order.id]: e.target.value,
                      }))
                    }
                    className="flex-1 border border-gray-200 px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
                  />

                  <button
                    onClick={() => handleComplete(order)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 rounded text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrdersPage;
