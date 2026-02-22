import client from "./client";

export const getProfile = () =>
    client.get("/auth/me");

export const getAgents = () =>
    client.get("/auth/agents");

export const getUsers = () => client.get("/auth/users");
export const updateUserRole = (id, role) => client.patch(`/auth/users/${id}/role`, { role });
export const createUser = (data) => client.post("/auth/create-user", data);

export const updateProfile = (data) =>
    client.patch("/auth/profile", data);

export const forgotPassword = (email) =>
    client.post("/auth/forgot-password", { email });

export const resetPassword = (token, password) =>
    client.post("/auth/reset-password", { token, password });
