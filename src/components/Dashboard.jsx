import   { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Car, ClipboardList, Truck, Users } from "lucide-react";

const DashboardPage = () => {
  const [totalTrips, setTotalTrips] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState(0);

  const [tripsPerVehicle, setTripsPerVehicle] = useState([]);
  const [tripsPerDriver, setTripsPerDriver] = useState([]);
  const [kmsPerVehicle, setKmsPerVehicle] = useState([]);
  const [kmsPerDriver, setKmsPerDriver] = useState([]);
  const [totalKms, setTotalKms] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Counts
    const { count: tripsCount } = await supabase.from("trips").select("*", { count: "exact" });
    setTotalTrips(tripsCount || 0);

    const { count: ordersCount } = await supabase.from("orders").select("*", { count: "exact" });
    setPendingOrders(ordersCount || 0);

    const { count: vehiclesCount } = await supabase.from("vehicles").select("*", { count: "exact" });
    setTotalVehicles(vehiclesCount || 0);

    const { count: driversCount } = await supabase.from("drivers").select("*", { count: "exact" });
    setTotalDrivers(driversCount || 0);

    // Trips data
    const { data: trips } = await supabase.from("trips").select("*");
    if (trips) {
      const vehicleMap = {};
      const driverMap = {};
      const vehicleKmsMap = {};
      const driverKmsMap = {};
      let totalKmsAcc = 0;

      trips.forEach(trip => {
        if (trip.vehicle) vehicleMap[trip.vehicle] = (vehicleMap[trip.vehicle] || 0) + 1;
        if (trip.driver) driverMap[trip.driver] = (driverMap[trip.driver] || 0) + 1;
        if (trip.vehicle && trip.kms) vehicleKmsMap[trip.vehicle] = (vehicleKmsMap[trip.vehicle] || 0) + parseFloat(trip.kms);
        if (trip.driver && trip.kms) driverKmsMap[trip.driver] = (driverKmsMap[trip.driver] || 0) + parseFloat(trip.kms);
        if (trip.kms) totalKmsAcc += parseFloat(trip.kms);
      });

      setTripsPerVehicle(Object.entries(vehicleMap).map(([vehicle, count]) => ({ vehicle, count })));
      setTripsPerDriver(Object.entries(driverMap).map(([driver, count]) => ({ driver, count })));
      setKmsPerVehicle(Object.entries(vehicleKmsMap).map(([vehicle, kms]) => ({ vehicle, kms })));
      setKmsPerDriver(Object.entries(driverKmsMap).map(([driver, kms]) => ({ driver, kms })));
      setTotalKms(totalKmsAcc);
    }
  };

const renderCountCard = (title, value, color = "bg-gray-900", Icon) => (
  <div
    className={`${color} text-white rounded-xl p-4 shadow-sm flex items-center justify-between`}
  >
    <div>
      <p className="text-xs sm:text-sm opacity-80">{title}</p>
      <p className="text-lg sm:text-xl font-bold">{value}</p>
    </div>

    <div className="bg-white/20 p-2 rounded-lg">
      <Icon size={22} />
    </div>
  </div>
);

const renderTable = (title, data, headers) => (
  <div className="bg-white rounded-xl shadow-sm p-3 overflow-x-auto">
    <h3 className="text-sm sm:text-base font-semibold mb-2">{title}</h3>

    <table className="w-full text-xs sm:text-sm">
      <thead>
        <tr className="text-left border-b">
          {headers.map((h, index) => (
            <th key={index} className="py-1 pr-2">{h}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, index) => (
          <tr key={index} className="border-b last:border-none">
            {Object.values(row).map((val, i) => (
              <td key={i} className="py-1 pr-2">{val}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
  return (
   <div className="min-h-screen bg-gray-100 px-3 py-4 sm:px-6 sm:py-6 space-y-4 max-w-6xl mx-auto">
  <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
    Dashboard
  </h2>

  {/* Top Counts */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
  {renderCountCard("Total Trips", totalTrips, "bg-gray-900", Car)}
  {renderCountCard("Pending Orders", pendingOrders, "bg-red-500", ClipboardList)}
  {renderCountCard("Total Vehicles", totalVehicles, "bg-blue-500", Truck)}
  {renderCountCard("Total Drivers", totalDrivers, "bg-green-500", Users)}
</div>

  {/* Trips per Vehicle Table */}
  {renderTable("Trips per Vehicle", tripsPerVehicle, ["Vehicle", "Count"])}

  {/* Trips per Driver Table */}
  {renderTable("Trips per Driver", tripsPerDriver, ["Driver", "Count"])}

  {/* Total KMs */}
  <div className="bg-white rounded-xl shadow-sm p-3">
    <h3 className="text-sm sm:text-base font-semibold mb-1">
      Total KMs Driven
    </h3>
    <p className="text-lg sm:text-xl font-bold">
      {totalKms.toLocaleString()} km
    </p>
  </div>

  {/* KMs per Vehicle Table */}
  {renderTable("KMs per Vehicle", kmsPerVehicle, ["Vehicle", "Kms"])}

  {/* KMs per Driver Table */}
  {renderTable("KMs per Driver", kmsPerDriver, ["Driver", "Kms"])}
</div>
  );
};

export default DashboardPage;