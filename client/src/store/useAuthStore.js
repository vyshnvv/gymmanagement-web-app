/* eslint-disable no-unused-vars */
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

let authCheckTimeout = null;
let lastAuthOperation = null;

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  isLoggingOut: false,
  socket: null,
  users: [],
  onlineUsers: [],
  isLoadingUsers: false,


  updateUserProfile: (newProfileData) =>
    set((state) => ({
      authUser: state.authUser
        ? { ...state.authUser, ...newProfileData }
        : null,
    })),


  updateSubscription: (newSubscription) =>
    set((state) => {
      if (!state.authUser) return {};

      const history = Array.isArray(state.authUser.subscriptionHistory)
        ? state.authUser.subscriptionHistory
        : [];


      const updatedHistory = history.map((sub) =>
        sub.status === "active"
          ? { ...sub, status: "upgraded", endDate: new Date() }
          : sub
      );


      updatedHistory.push(newSubscription);

      return {
        authUser: {
          ...state.authUser,

          subscription: newSubscription,

          subscriptionHistory: updatedHistory,
        },
      };
    }),

  checkAuth: async (immediate = false) => {
    const operationId = Date.now() + Math.random();
    lastAuthOperation = operationId;

    if (!immediate && authCheckTimeout) {
      clearTimeout(authCheckTimeout);
    }

    const executeAuthCheck = async () => {
      if (lastAuthOperation !== operationId) {
        return;
      }

      set({ isCheckingAuth: true });

      try {
        const res = await axiosInstance.get("/auth/check");

        if (lastAuthOperation !== operationId) {
          return;
        }

        if (
          typeof res.data === "object" &&
          res.data &&
          !res.data.toString().includes("<!doctype html>")
        ) {
          set({ authUser: res.data });
          get().connectSocket();
        } else {
          set({ authUser: null });
        }
      } catch (error) {
        if (lastAuthOperation !== operationId) {
          return;
        }
        set({ authUser: null });
      } finally {
        if (lastAuthOperation === operationId) {
          set({ isCheckingAuth: false });
        }
      }
    };

    if (immediate) {
      await executeAuthCheck();
    } else {
      authCheckTimeout = setTimeout(executeAuthCheck, 100);
    }
  },

  signUp: async (data) => {
    if (authCheckTimeout) {
      clearTimeout(authCheckTimeout);
      authCheckTimeout = null;
    }
    lastAuthOperation = null;

    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    if (authCheckTimeout) {
      clearTimeout(authCheckTimeout);
      authCheckTimeout = null;
    }
    lastAuthOperation = null;

    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async (navigate) => {
    if (authCheckTimeout) {
      clearTimeout(authCheckTimeout);
      authCheckTimeout = null;
    }
    lastAuthOperation = null;

    set({ isLoggingOut: true, isCheckingAuth: false });

    try {
      get().disconnectSocket();

      set({ authUser: null, users: [] });

      await axiosInstance.post("/auth/logout");

      if (navigate) {
        navigate("/login", { replace: true });
      }

      toast.success("Logged out successfully");
    } catch (error) {
      set({ authUser: null, users: [] });

      if (navigate) {
        navigate("/login", { replace: true });
      }

      if (error.response?.status === 401) {
        toast.success("Logged out successfully");
      } else {
        toast.error(error.response?.data?.message || "Logout failed");
      }
    } finally {
      set({ isLoggingOut: false });
    }
  },

  getUsers: async () => {
    set({ isLoadingUsers: true });
    try {
      const res = await axiosInstance.get("/users");
      set({ users: res.data });
    } catch (error) {
      console.log("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();

    if (!authUser) {
      return;
    }

    if (socket?.connected) {
      return;
    }

    const newSocket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });

    set({ socket: newSocket });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });


    newSocket.on("newChallenge", (challenge) => {
      console.log("New challenge received:", challenge);
      toast.success(`${challenge.challenger.fullName} challenged you!`);
    });

    newSocket.on("challengeAccepted", (data) => {
      console.log("Challenge accepted:", data);
      toast.success(`Challenge accepted!`);

      if (data.gameId) {
        window.location.href = `/game/${data.gameId}`;
      }
    });

    newSocket.on("challengeDeclined", (data) => {
      console.log("Challenge declined:", data);
      toast.error(`Challenge declined`);
    });

    newSocket.on("gameStart", (data) => {
      console.log("Game started:", data);
      toast.success("Game starting!");
      if (data.gameId) {
        window.location.href = `/game/${data.gameId}`;
      }
    });

    newSocket.on("gameUpdate", (game) => {
      console.log("Game updated:", game);
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
    }
    set({ socket: null });
  },
}));