import client from "./client";

export const getDashboardStats = () =>
    client.get("/dashboard/stats");

export const getWorkload = () =>
    client.get("/dashboard/workload");
