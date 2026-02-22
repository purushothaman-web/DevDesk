import client from "./client";

export const getMyTickets = () =>
    client.get("/tickets/my");

export const getAllTickets = (params = {}) =>
    client.get("/tickets", { params });

export const getTicketById = (id) =>
    client.get(`/tickets/${id}`);

export const createTicket = (formData) =>
    client.post("/tickets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const updateTicketStatus = (id, status) =>
    client.patch(`/tickets/${id}/status`, { status });

export const updateTicketPriority = (id, priority) =>
    client.patch(`/tickets/${id}/priority`, { priority });

export const assignTicket = (id, assignedToId) =>
    client.patch(`/tickets/${id}/assign`, { assignedToId });

export const updateDueDate = (id, dueDate) =>
    client.patch(`/tickets/${id}/due-date`, { dueDate });

export const addComment = (id, message) =>
    client.post(`/tickets/${id}/comments`, { message });

export const deleteTicket = (id) =>
    client.delete(`/tickets/${id}`);

export const getActivityLog = (id) =>
    client.get(`/tickets/${id}/activity`);
