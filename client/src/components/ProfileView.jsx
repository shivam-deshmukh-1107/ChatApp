// ProfileView.jsx
import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const ProfileView = () => {
  const { selectedUser, messages, setShowRightSidebar } =
    useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  // Get all images from messages and set them to state
  useEffect(() => {
    setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]);

  if (!selectedUser) return null;

  return (
    <div className="h-full overflow-scroll relative backdrop-blur-lg bg-[#8185B2]/10 text-white">
      {/* Header with back button */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          onClick={() => setShowRightSidebar(false)}
          src={assets.arrow_icon}
          alt="back_arrow"
          className="max-w-7 cursor-pointer"
        />
        <p className="text-lg text-white">Profile details:</p>
      </div>

      {/* Profile Content */}
      <div className="flex flex-col items-center justify-center h-[calc(100%-80px)] px-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-md w-full">
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt=""
            className="w-32 h-32 rounded-full object-cover"
          />

          <div className="space-y-2">
            <h1 className="text-2xl font-medium flex items-center gap-2 justify-center">
              {selectedUser.fullName}
              {onlineUsers.includes(selectedUser._id) && (
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              )}
            </h1>
            <p className="text-gray-300 text-sm">{selectedUser.bio}</p>
          </div>

          {/* Media Section */}
          {msgImages.length > 0 && (
            <div className="w-full mt-6">
              <h3 className="text-lg mb-3 text-left">Media:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {msgImages.map((url, index) => (
                  <div
                    key={index}
                    onClick={() => window.open(url)}
                    className="cursor-pointer rounded-lg overflow-hidden aspect-square"
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            className="mt-8 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-3 px-12 rounded-full cursor-pointer hover:opacity-90 transition-opacity w-[80%]"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
