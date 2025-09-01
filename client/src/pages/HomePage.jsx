// HomePage.jsx
import React, { useContext, useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine grid layout based on window width AND selectedUser
  const getGridCols = () => {
    if (windowWidth < 768) return "grid-cols-1";
    if (windowWidth < 1200 || !selectedUser) return "grid-cols-[30%_70%]";
    return "grid-cols-[1fr_2fr_1fr]";
  };

  return (
    <div className="border w-full h-screen sm:px-[10%] 2xl:px-[15%] sm:py-[5%]">
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid ${getGridCols()}`}
      >
        <Sidebar />
        <ChatContainer />
        {selectedUser && <RightSidebar />}
      </div>
    </div>
  );
};

export default HomePage;
