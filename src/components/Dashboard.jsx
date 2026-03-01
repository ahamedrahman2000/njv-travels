import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Car, ClipboardList, Truck, Users } from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();

  const [totalTrips, setTotalTrips] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Trips Count
    const { count: tripsCount } = await supabase
      .from("trips")
      .select("*", { count: "exact", head: true });
    setTotalTrips(tripsCount || 0);

    // Orders Count
    const { count: ordersCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });
    setPendingOrders(ordersCount || 0);

    // Vehicles Count
    const { count: vehiclesCount } = await supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true });
    setTotalVehicles(vehiclesCount || 0);

    // Drivers Count
    const { count: driversCount } = await supabase
      .from("drivers")
      .select("*", { count: "exact", head: true });
    setTotalDrivers(driversCount || 0);
  };

  const renderCard = (title, value, color, Icon, path) => (
    <div
      onClick={() => navigate(path)}
      className={`${color} cursor-pointer text-white rounded-2xl p-5 shadow-md hover:scale-105 transition duration-200 flex items-center justify-between`}
    >
      <div>
        <p className="text-sm opacity-80">{title}</p>
        <p className="text-1xl font-bold mt-1">{value}</p>
      </div>

      <div className="bg-white/20 p-3 rounded-xl">
        <Icon size={26} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-lg sm:text-3xl font-bold mb-8 text-gray-800">
          Dashboard
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {renderCard("Trips", totalTrips, "bg-gray-900", Car, "/trips")}
          {renderCard(
            "Orders",
            pendingOrders,
            "bg-red-500",
            ClipboardList,
            "/orders",
          )}
          {renderCard(
            "Vehicles",
            totalVehicles,
            "bg-blue-500",
            Truck,
            "/vehicleList",
          )}
          {renderCard(
            "Drivers",
            totalDrivers,
            "bg-green-500",
            Users,
            "/driversPage",
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
