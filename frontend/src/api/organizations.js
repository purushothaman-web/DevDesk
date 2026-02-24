import axiosInstance from "./client";

export const getOrganizations = () => axiosInstance.get("/organizations");
export const deleteOrganization = (id) => axiosInstance.delete(`/organizations/${id}`);
export const getOrganizationSla = () => axiosInstance.get("/organizations/sla");
export const updateOrganizationSla = (data) => axiosInstance.patch("/organizations/sla", data);
