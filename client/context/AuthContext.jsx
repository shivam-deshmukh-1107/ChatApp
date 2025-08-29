// client/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Backend URL
const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext(null);

// simple JWT shape guard to avoid calling /check with junk
const looksLikeJwt = (t) =>
  typeof t === "string" &&
  /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(t.trim());

const pickErr = (e) =>
  e?.response?.data?.message ||
  e?.response?.data?.error ||
  e?.message ||
  "Something went wrong";

export const AuthProvider = ({ children }) => {
  // const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  //   Check if user is authenticated and if so, set the user data and connect the token
  const checkAuth = async (tokenToCheck) => {
    try {
      // Use provided token or get from localStorage
      const authToken = tokenToCheck || localStorage.getItem("token");

      if (!authToken || !looksLikeJwt(authToken)) {
        throw new Error("Invalid token");
      }

      // Set the token in axios headers before making the request
      axios.defaults.headers.common["token"] = authToken;

      const { data } = await axios.get("/api/auth/check");
      if (data?.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
        return true;
      } else {
        throw new Error(data?.message || "Not authenticated");
      }
    } catch (error) {
      // Clean up on auth failure
      if (
        error?.response?.status === 401 ||
        error.message === "Invalid token"
      ) {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["token"];
      } else {
        console.error("Auth check error:", error);
      }
      setAuthUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  //   Login function to handle user authentication and socket connection
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        // setToken(data.token);
        axios.defaults.headers.common["token"] = data.token;
        setAuthUser(data.user);
        connectSocket(data.user);
        toast.success(data.message);
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error(pickErr(error));
      return { success: false, message: pickErr(error) };
    }
  };

  //   Logout function to handle user logout and socket disconnection
  const logout = () => {
    try {
      localStorage.removeItem("token");
      // setToken(null);
      delete axios.defaults.headers.common["token"];
      setAuthUser(null);
      setOnlineUsers([]);
      if (socket?.connected) {
        socket.disconnect();
        setSocket(null);
      }
      toast.success("Logged out successfully");
      return { success: true };
    } catch (error) {
      toast.error(pickErr(error));
    }
  };

  //   Update profile function to handle user profile updates
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put(`/api/auth/update-profile`, body);
      if (data.success) {
        setAuthUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = pickErr(error);
      toast.error(errorMessage);  
      return { success: false, message: errorMessage };
    }
  };

  //   Connect socket function to handle socket connection and online users updates
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  //   Connect the token to the axios instance and check authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken && looksLikeJwt(storedToken)) {
        await checkAuth(storedToken);
      } else {
        // No valid token, clean up
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["token"];
        setIsLoading(false);
      }
    };

    initAuth();
  }, []); // Run only on mount

  // Clean up socket on unmount
  useEffect(() => {
    return () => {
      if (socket?.connected) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    isLoading,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
