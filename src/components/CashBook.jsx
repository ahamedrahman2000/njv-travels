import  { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CashBook = () => {
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("");
  const [vehicleMap, setVehicleMap] = useState({}); // vehicle_id -> vehicle_name
  const [filterType, setFilterType] = useState("");
  useEffect(() => {
    fetchVehicles();
    fetchTrips();
    fetchMaintenance();
  }, []);

  // Fetch Vehicles
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

  // Fetch Trips
  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .order("from_date", { ascending: false });

    if (!error) setTrips(data || []);
  };

  // Fetch Maintenance
  const fetchMaintenance = async () => {
    const { data, error } = await supabase
      .from("vehicle_maintenance")
      .select("*");
    if (!error) setMaintenance(data || []);
  };

  const yearList = [
    ...new Set(
      trips
        .filter((trip) => trip.from_date)
        .map((trip) => new Date(trip.from_date).getFullYear()),
    ),
  ].sort((a, b) => b - a);

  // ================= UNIQUE VEHICLE LIST =================
  const vehicleList = [
    ...new Set(trips.map((t) => t.vehicle_id).filter(Boolean)),
  ]
    .map((id) => vehicleMap[id])
    .filter(Boolean);

  // ================= FILTER LOGIC =================
  // const filteredTrips = trips.filter((trip) => {
  //   if (!trip.from_date) return false;
  //   const d = new Date(trip.from_date);
  //   const month = d.getMonth() + 1;
  //   const year = d.getFullYear();

  //   const vehicleName = vehicleMap[trip.vehicle_id] || "";

  //   if (filterMonth && Number(filterMonth) !== month) return false;
  //   if (filterYear && Number(filterYear) !== year) return false;
  //   if (filterVehicle && vehicleName !== filterVehicle) return false;

  //   return true;
  // });

  // const filteredMaintenance = maintenance.filter((m) => {
  //   if (!m.service_date) return false;
  //   const d = new Date(m.service_date);
  //   const month = d.getMonth() + 1;
  //   const year = d.getFullYear();

  //   const vehicleName = vehicleMap[m.vehicle_id] || "";

  //   if (filterMonth && Number(filterMonth) !== month) return false;
  //   if (filterYear && Number(filterYear) !== year) return false;
  //   if (filterVehicle && vehicleName !== filterVehicle) return false;

  //   return true;
  // });
  const filteredTrips = trips.filter((trip) => {
    if (!trip.from_date) return false;
    const d = new Date(trip.from_date);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const vehicleName = vehicleMap[trip.vehicle_id] || "";

    if (filterMonth && Number(filterMonth) !== month) return false;
    if (filterYear && Number(filterYear) !== year) return false;
    if (filterVehicle && vehicleName !== filterVehicle) return false;
    if (filterType && "Trip" !== filterType) return false; // ✅ Type filter

    return true;
  });

  const filteredMaintenance = maintenance.filter((m) => {
    if (!m.service_date) return false;
    const d = new Date(m.service_date);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const vehicleName = vehicleMap[m.vehicle_id] || "";

    if (filterMonth && Number(filterMonth) !== month) return false;
    if (filterYear && Number(filterYear) !== year) return false;
    if (filterVehicle && vehicleName !== filterVehicle) return false;
    if (filterType && "Maintenance" !== filterType) return false; // ✅ Type filter

    return true;
  });
  // ================= TOTAL CALCULATIONS =================
  const totalRevenue = filteredTrips.reduce(
    (sum, t) => sum + Number(t.total_amount || 0),
    0,
  );

  const tripExpense = filteredTrips.reduce(
    (sum, t) =>
      sum +
      Number(t.fuel_expense || 0) +
      Number(t.toll_expense || 0) +
      Number(t.driver_salary || 0) +
      Number(t.other_expense || 0),
    0,
  );

  const maintenanceExpense = filteredMaintenance.reduce(
    (sum, m) => sum + Number(m.cost || 0),
    0,
  );

  const totalExpense = tripExpense + maintenanceExpense;
  const totalProfit = totalRevenue - totalExpense;

  // ================= VEHICLE REPORT =================
  const vehicleReport = {};

  filteredTrips.forEach((trip) => {
    const vehicle = vehicleMap[trip.vehicle_id] || "-";

    if (!vehicleReport[vehicle]) {
      vehicleReport[vehicle] = {
        revenue: 0,
        tripExpense: 0,
        maintenanceExpense: 0,
      };
    }

    vehicleReport[vehicle].revenue += Number(trip.total_amount || 0);
    vehicleReport[vehicle].tripExpense +=
      Number(trip.fuel_expense || 0) +
      Number(trip.toll_expense || 0) +
      Number(trip.driver_salary || 0) +
      Number(trip.other_expense || 0);
  });

  filteredMaintenance.forEach((m) => {
    const vehicle = vehicleMap[m.vehicle_id] || "-";

    if (!vehicleReport[vehicle]) {
      vehicleReport[vehicle] = {
        revenue: 0,
        tripExpense: 0,
        maintenanceExpense: 0,
      };
    }

    vehicleReport[vehicle].maintenanceExpense += Number(m.cost || 0);
  });

  // ================= COMBINED & SORTED DATA =================
  const detailedData = [
    // Trips
    ...filteredTrips.map((trip) => {
      const expense =
        Number(trip.fuel_expense || 0) +
        Number(trip.toll_expense || 0) +
        Number(trip.driver_salary || 0) +
        Number(trip.other_expense || 0);

      return {
        date: new Date(trip.from_date),
        vehicle: vehicleMap[trip.vehicle_id] || "-",
        type: "Trip",
        description: `${trip.destination_from || ""} - ${trip.destination_to || ""}`,
        revenue: Number(trip.total_amount || 0),
        expense: expense,
        profit: Number(trip.total_amount || 0) - expense,
      };
    }),
    // Maintenance
    ...filteredMaintenance.map((m) => ({
      date: new Date(m.service_date),
      vehicle: vehicleMap[m.vehicle_id] || "-",
      type: m.type || "Maintenance",
      description: m.description || m.title || "",
      revenue: 0,
      expense: Number(m.cost || 0),
      profit: -Number(m.cost || 0),
    })),
  ].sort((a, b) => b.date - a.date);

  // ================= EXPORT PDF =================
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("NJV Tours and Travels", 14, 15);

    doc.setFontSize(11);
    doc.text("CashBook Financial Report", 14, 22);

    doc.setFontSize(9);
    doc.text(
      `Filter: ${filterMonth ? "Month " + filterMonth : "All Months"} | ${
        filterYear ? "Year " + filterYear : "All Years"
      } | ${filterVehicle ? filterVehicle : "All Vehicles"}`,
      14,
      30,
    );

    // Summary Table
    autoTable(doc, {
      startY: 35,
      theme: "grid",
      styles: { fontSize: 9 },
      head: [
        [
          "Revenue",
          "Trip Expense",
          "Maintenance",
          "Total Expense",
          "Net Profit",
        ],
      ],
      body: [
        [
          totalRevenue,
          tripExpense,
          maintenanceExpense,
          totalExpense,
          totalProfit,
        ],
      ],
    });

    // Detailed Table
    const tableData = detailedData.map((row) => [
      row.date.toLocaleDateString(),
      row.vehicle,
      row.type,
      row.description,
      row.revenue,
      row.expense,
      row.profit,
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [
        [
          "Date",
          "Vehicle",
          "Type",
          "Description",
          "Revenue",
          "Expense",
          "Profit",
        ],
      ],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [212, 175, 55] },
    });

    // Page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10,
      );
    }

    doc.save("CashBook_Report.pdf");
  };

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-center">
        CashBook Financial Report
      </h2>

      {/* ================= OVERALL SUMMARY ================= */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">Total Revenue</td>
              <td className="px-4 py-3 text-right text-blue-600 font-semibold">
                ₹{totalRevenue}
              </td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-3">Trip Expenses</td>
              <td className="px-4 py-3 text-right text-orange-600 font-semibold">
                ₹{tripExpense}
              </td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-3">Maintenance Expenses</td>
              <td className="px-4 py-3 text-right text-red-600 font-semibold">
                ₹{maintenanceExpense}
              </td>
            </tr>
            <tr className="border-t font-bold bg-gray-50">
              <td className="px-4 py-3">Total Expenses</td>
              <td className="px-4 py-3 text-right text-red-700">
                ₹{totalExpense}
              </td>
            </tr>
            <tr className="border-t font-bold">
              <td className="px-4 py-3">Net Profit</td>
              <td
                className={`px-4 py-3 text-right ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                ₹{totalProfit}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= FILTER SECTION ================= */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Month */}
          <div>
            <label className="text-xs text-gray-500">Month</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full text-sm border rounded-md px-2 py-1.5 mt-1 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
            >
              <option value="">All</option>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="text-xs text-gray-500">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full text-sm border rounded-md px-2 py-1.5 mt-1 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
            >
              <option value="">All</option>
              {yearList.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle */}
          <div>
            <label className="text-xs text-gray-500">Vehicle</label>
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="w-full text-sm border rounded-md px-2 py-1.5 mt-1 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
            >
              <option value="">All Vehicles</option>
              {vehicleList.map((v, i) => (
                <option key={i} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          {/* Type */}
          <div>
            <label className="text-xs text-gray-500">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full text-sm border rounded-md px-2 py-1.5 mt-1 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="Trip">Trip</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= DATE WISE REPORT ================= */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">Detailed Date Wise Report</h3>

          <button
            onClick={exportToPDF}
            className="bg-[#D4AF37] text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-500 transition"
          >
            Export PDF
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3 text-right">Expense</th>
              <th className="px-4 py-3 text-right">Profit</th>
            </tr>
          </thead>
          <tbody>
            {detailedData.map((row, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-3">{row.date.toLocaleDateString()}</td>
                <td className="px-4 py-3">{row.vehicle}</td>
                <td className="px-4 py-3">{row.type || "-"}</td>
                <td className="px-4 py-3">{row.description || "-"}</td>
                <td className="px-4 py-3 text-right text-green-600">
                  ₹{row.revenue}
                </td>
                <td className="px-4 py-3 text-right text-red-600">
                  ₹{row.expense}
                </td>
                <td
                  className={`px-4 py-3 text-right font-semibold ${row.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ₹{row.profit}
                </td>
              </tr>
            ))}

            {detailedData.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No Records Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashBook;
