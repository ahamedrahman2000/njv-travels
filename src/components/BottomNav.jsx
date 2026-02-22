import { useLocation, useNavigate } from "react-router-dom";
import { AiFillHome, AiFillBook, AiOutlineCar, AiOutlineFileText, AiOutlineWallet } from "react-icons/ai";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Home", path: "/dashboard", icon: <AiFillHome size={22} /> },
  { name: "Bookings", path: "/booking", icon: <AiFillBook size={22} /> },
  { name: "Trips", path: "/trips", icon: <AiOutlineCar size={22} /> },
  { name: "Orders", path: "/orders", icon: <AiOutlineFileText size={22} /> },
  { name: "Cashbooks", path: "/cashBook", icon: <AiOutlineWallet size={22} /> },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // scrolling down
        setVisible(false);
      } else {
        // scrolling up
        setVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={`fixed bottom-4 left-0 right-0 mx-auto w-[92%] max-w-md 
      bg-black/90 backdrop-blur-xl rounded-3xl shadow-2xl 
      border border-white/20 z-50 
      transition-all duration-300 
      ${visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}
      `}
    >
      <div className="flex justify-between items-center px-3 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 py-2 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "bg-yellow-400/20 text-yellow-400 shadow-md scale-105"
                  : "text-white/80 hover:text-yellow-300 hover:bg-white/10"
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-semibold">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;