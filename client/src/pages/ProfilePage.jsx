// client/src/pages/ProfilePage.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, updateProfile, isLoading } = useContext(AuthContext);

  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser?.fullName || "Shivam Deshmukh");
  const [bio, setBio] = useState(
    authUser?.bio || "Hi Everyone, I am using EasChat."
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedImg) {
        const result = await updateProfile({ fullName: name, bio });
        if (result?.success) {
          toast.success("Profile updated successfully");
          navigate("/");
        }
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(selectedImg);
      reader.onload = async () => {
        try {
          const base64Image = reader.result;
          const result = await updateProfile({
            fullName: name,
            bio,
            profilePic: base64Image,
          });

          if (result?.success) {
            navigate("/");
            toast.success("Profile updated successfully");
          } else {
            toast.error(result?.message || "Failed to update profile");
          }
        } catch (error) {
          console.error("Profile update error:", error);
          toast.error("Failed to update profile");
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read image file");
      };
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg">Profile Details</h3>
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : assets.avatar_icon
              }
              alt=""
              className={`w-20 h-20 object-cover rounded-full ${
                selectedImg && "rounded-full"
              }`}
            />
            Upload Profile Image
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
            rows={4}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer"
          >
            Save
          </button>
        </form>
        <img
          src={authUser?.profilePic || assets.logo_icon}
          className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${
            selectedImg && "rounded-full"
          }`}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
