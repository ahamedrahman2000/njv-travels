import   { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [payment, setPayment] = useState({});
  const [expenses, setExpenses] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: true });

    if (!error) setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleExpenseChange = (id, field, value) => {
    setExpenses((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value === "" ? "" : Number(value),
      },
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
    const netProfit = Number(order.total_amount) - totalExpense;

    const { error: insertError } = await supabase.from("trips").insert([
      {
        ...order,
        balance: 0,
        kms,
        fuel_expense: fuel,
        toll_expense: toll,
        driver_salary: driverSalary,
        other_expense: other,
        net_profit: netProfit,
      },
    ]);

    if (insertError) {
      alert("Failed to complete trip");
      return;
    }

    await supabase.from("orders").delete().eq("id", order.id);

    alert("Trip Completed Successfully ✅");

    setPayment((prev) => ({ ...prev, [order.id]: "" }));
    setExpenses((prev) => ({ ...prev, [order.id]: {} }));
    setExpandedId(null);

    fetchOrders();
  };

  return (
    <div className="px-3 py-4 sm:p-6 max-w-4xl mx-auto">
      <h2 className="text-xl  text-center sm:text-2xl font-bold mb-4 text-gray-800">
        Pending Orders
      </h2>

      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-xl shadow-sm border px-2 py-4 mb-4 transition hover:shadow-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between flex-nowrap">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex gap-1">
                <p className="text-sm font-semibold">{order.id}</p>
                <p className="text-sm truncate">{order.customer_name}</p>
              </div>

              <span className="text-gray-300">|</span>

              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {order.destination_from} → {order.destination_to}
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
            </div>
          </div>

          {/* Expanded Section */}
          {expandedId === order.id && (() => {
            const fuel = expenses[order.id]?.fuel ?? "";
            const toll = expenses[order.id]?.toll ?? "";
            const driverSalary = expenses[order.id]?.driverSalary ?? "";
            const other = expenses[order.id]?.other ?? "";
            const kms = expenses[order.id]?.kms ?? "";
            const payAmount = payment[order.id] ?? "";

            const allFieldsFilled =
              fuel !== "" &&
              toll !== "" &&
              driverSalary !== "" &&
              other !== "" &&
              kms !== "" &&
              payAmount !== "" &&
              Number(payAmount) === Number(order.balance);

            const totalExpense =
              Number(fuel || 0) +
              Number(toll || 0) +
              Number(driverSalary || 0) +
              Number(other || 0);

            const netProfit =
              Number(order.total_amount) - totalExpense;

            return (
              <div className="mt-4 border-t pt-3 space-y-4 text-sm">
                {/* KMs */}
                <input
                  type="number"
                  placeholder="Total KMs"
                  className="w-full sm:w-40 px-3 py-1.5 border rounded-lg text-sm"
                  value={kms}
                  onChange={(e) =>
                    handleExpenseChange(order.id, "kms", e.target.value)
                  }
                />

                {/* Expenses */}
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
                      handleExpenseChange(order.id, "driverSalary", e.target.value)
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

                {/* Profit Summary */}
                <div className="flex justify-between bg-gray-50 px-3 py-2 rounded-lg text-xs">
                  <span>
                    Expense: <strong>₹{totalExpense}</strong>
                  </span>

                  <span
                    className={`font-semibold ${
                      netProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Profit: ₹{netProfit}
                  </span>
                </div>

                {/* Payment */}
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
                      ${
                        allFieldsFilled
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    Complete
                  </button>
                </div>

                {!allFieldsFilled && (
                  <p className="text-xs text-red-500">
                    Fill all fields & exact payment.
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      ))}

      {orders.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No pending orders found.
        </p>
      )}
    </div>
  );
};

export default OrdersPage;