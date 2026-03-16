import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// eslint-disable-next-line
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CashBook = () => {
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [filterVehicle, setFilterVehicle] = useState("");
  const [vehicleMap, setVehicleMap] = useState({});
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    fetchVehicles();
    fetchTrips();
    fetchMaintenance();
  }, []);

  const fetchVehicles = async () => {
    const { data } = await supabase.from("vehicles").select("id, vehicle_name");
    if (data) {
      const map = {};
      data.forEach((v) => (map[v.id] = v.vehicle_name));
      setVehicleMap(map);
    }
  };

  const fetchTrips = async () => {
    const { data } = await supabase
      .from("trips")
      .select("*")
      .order("from_date", { ascending: false });

    if (data) setTrips(data);
  };

  const fetchMaintenance = async () => {
    const { data } = await supabase.from("vehicle_maintenance").select("*");
    if (data) setMaintenance(data);
  };

  // ================= DATE LISTS FOR HIGHLIGHT =================

  const tripDates = trips
    .filter((t) => t.from_date)
    .map((t) => new Date(t.from_date).toDateString());

  const maintenanceDates = maintenance
    .filter((m) => m.service_date)
    .map((m) => new Date(m.service_date).toDateString());

  const getDayClass = (date) => {
    const d = date.toDateString();

    const isTrip = tripDates.includes(d);
    const isMaintenance = maintenanceDates.includes(d);

    if (isTrip && isMaintenance) return "both-day";
    if (isTrip) return "trip-day";
    if (isMaintenance) return "maintenance-day";
    return "";
  };

  // ================= VEHICLE LIST =================

  const vehicleList = [
    ...new Set(trips.map((t) => t.vehicle_id).filter(Boolean)),
  ]
    .map((id) => vehicleMap[id])
    .filter(Boolean);

  // ================= FILTER LOGIC =================

  const filteredTrips = trips.filter((trip) => {
    if (!trip.from_date) return false;

    const d = new Date(trip.from_date);
    const vehicleName = vehicleMap[trip.vehicle_id] || "";

    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    if (filterVehicle && vehicleName !== filterVehicle) return false;
    if (filterType && filterType !== "Trip") return false;

    return true;
  });

  const filteredMaintenance = maintenance.filter((m) => {
    if (!m.service_date) return false;

    const d = new Date(m.service_date);
    const vehicleName = vehicleMap[m.vehicle_id] || "";

    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    if (filterVehicle && vehicleName !== filterVehicle) return false;
    if (filterType && filterType !== "Maintenance") return false;

    return true;
  });

  // ================= TOTALS =================

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

  // ================= COMBINED DATA =================

  const detailedData = [
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
        description: `${trip.destination_from || ""} - ${
          trip.destination_to || ""
        }`,
        revenue: Number(trip.total_amount || 0),
        expense: expense,
        profit: Number(trip.total_amount || 0) - expense,
      };
    }),

    ...filteredMaintenance.map((m) => ({
      date: new Date(m.service_date),
      vehicle: vehicleMap[m.vehicle_id] || "-",
      type: "Maintenance",
      description: m.description || "",
      revenue: 0,
      expense: Number(m.cost || 0),
      profit: -Number(m.cost || 0),
    })),
  ].sort((a, b) => b.date - a.date);

  // ================= PDF EXPORT =================

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.text("CashBook Financial Report", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [
        ["Revenue", "Trip Expense", "Maintenance", "Total Expense", "Profit"],
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

    const rows = detailedData.map((r) => [
      r.date.toLocaleDateString(),
      r.vehicle,
      r.type,
      r.description,
      r.revenue,
      r.expense,
      r.profit,
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
      body: rows,
    });

    doc.save("CashBook_Report.pdf");
  };

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-center">
        CashBook Financial Report
      </h2>

      {/* SUMMARY */}
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

      {/* FILTERS */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500">From Date</label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              dayClassName={getDayClass}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              popperPlacement="bottom-start"
              className="w-full text-sm border rounded-md px-2 py-1.5 mt-1 focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">To Date</label>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              dayClassName={getDayClass}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              popperPlacement="bottom-end"
              className="w-full text-sm border rounded-md px-2 py-1.5 mt-1 focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Vehicle</label>
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="w-full text-sm border rounded-md px-2 py-1.5 mt-1"
            >
              <option value="">All Vehicles</option>
              {vehicleList.map((v, i) => (
                <option key={i}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full text-sm border rounded-md px-2 py-1.5 mt-1"
            >
              <option value="">All Types</option>
              <option value="Trip">Trip</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* REPORT */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">Detailed Date Wise Report</h3>

          <button
            onClick={exportToPDF}
            className="bg-[#D4AF37] text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-500"
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
                <td className="px-4 py-3">{row.type}</td>
                <td className="px-4 py-3">{row.description}</td>
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashBook;
