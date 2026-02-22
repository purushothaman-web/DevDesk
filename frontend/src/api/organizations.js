import axiosInstance from "./client";

export const getOrganizations = () => axiosInstance.get("/organizations");
export const deleteOrganization = (id) => axiosInstance.delete(`/organizations/${id}`);
