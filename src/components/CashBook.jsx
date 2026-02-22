import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const CashBook = () => {
  const [trips, setTrips] = useState([]);
  const [reportType, setReportType] = useState("monthlyRevenue");

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    const { data } = await supabase.from("trips").select("*");
    setTrips(data || []);
  };

  // ===== TOTAL CALCULATIONS =====

  const totalRevenue = trips.reduce(
    (sum, trip) => sum + Number(trip.total_amount || 0),
    0
  );

  const totalFuel = trips.reduce(
    (sum, trip) => sum + Number(trip.fuel_expense || 0),
    0
  );

  const totalDriverSalary = trips.reduce(
    (sum, trip) => sum + Number(trip.driver_salary || 0),
    0
  );

  const totalExpense = trips.reduce(
    (sum, trip) =>
      sum +
      Number(trip.fuel_expense || 0) +
      Number(trip.toll_expense || 0) +
      Number(trip.driver_salary || 0) +
      Number(trip.other_expense || 0),
    0
  );

  const totalProfit = trips.reduce(
    (sum, trip) => sum + Number(trip.net_profit || 0),
    0
  );

  // ===== GROUPED REPORT DATA =====

  const groupedData = {};

  trips.forEach((trip) => {
    const month = trip.from_date
      ? new Date(trip.from_date).toLocaleString("default", {
          month: "short",
          year: "numeric",
        })
      : null;

    switch (reportType) {
      case "monthlyRevenue":
        if (!month) return;
        groupedData[month] =
          (groupedData[month] || 0) + Number(trip.total_amount || 0);
        break;

      case "monthlyProfit":
        if (!month) return;
        groupedData[month] =
          (groupedData[month] || 0) + Number(trip.net_profit || 0);
        break;

      case "salarySummary":
        groupedData[trip.driver] =
          (groupedData[trip.driver] || 0) +
          Number(trip.driver_salary || 0);
        break;

      case "profitVehicle":
        groupedData[trip.vehicle] =
          (groupedData[trip.vehicle] || 0) +
          Number(trip.net_profit || 0);
        break;

      default:
        break;
    }
  });

  const SummaryCard = ({ title, value, color }) => (
  <div className="bg-white rounded-xl p-3 shadow-sm">
    <p className="text-xs text-gray-500">{title}</p>
    <p className={`text-sm sm:text-lg font-bold ${color}`}>
      ₹{value}
    </p>
  </div>
);

  return (
   <div className="px-3 py-4 sm:px-6 sm:py-6 max-w-6xl mx-auto space-y-5">
  <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
    CashBook Report
  </h2>

  {/* SUMMARY CARDS */}
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
    <SummaryCard title="Revenue" value={totalRevenue} color="text-blue-600" />
    <SummaryCard title="Driver Salary" value={totalDriverSalary} color="text-indigo-600" />
    <SummaryCard title="Fuel Cost" value={totalFuel} color="text-orange-600" />
    <SummaryCard title="Expense" value={totalExpense} color="text-red-600" />
    <SummaryCard
      title="Profit"
      value={totalProfit}
      color={totalProfit >= 0 ? "text-green-600" : "text-red-600"}
    />
     <select
      value={reportType}
      onChange={(e) => setReportType(e.target.value)}
      className="text-sm border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
    >
      <option value="monthlyRevenue">Monthly Revenue</option>
      <option value="monthlyProfit">Monthly Profit</option>
      <option value="salarySummary">Driver Salary Summary</option>
      <option value="profitVehicle">Profit Per Vehicle</option>
    </select>
  </div>
  

  {/* REPORT DROPDOWN */}
  <div className="flex justify-end">
   
  </div>

  {/* REPORT TABLE */}
  <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
    <table className="w-full text-xs sm:text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-3 py-2 text-left">Category</th>
          <th className="px-3 py-2 text-right">Amount (₹)</th>
        </tr>
      </thead>

      <tbody>
        {Object.keys(groupedData).length === 0 && (
          <tr>
            <td colSpan="2" className="px-3 py-4 text-center text-gray-500">
              No Data Available
            </td>
          </tr>
        )}

        {Object.keys(groupedData).map((key) => (
          <tr key={key} className="border-t">
            <td className="px-3 py-2">{key}</td>
            <td
              className={`px-3 py-2 text-right font-semibold ${
                groupedData[key] >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ₹{groupedData[key]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
  );
};

export default CashBook;