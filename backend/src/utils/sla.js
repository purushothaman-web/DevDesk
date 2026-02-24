export const getSlaHoursForPriority = (organization, priority) => {
  if (priority === "HIGH") return organization.slaHighHours;
  if (priority === "LOW") return organization.slaLowHours;
  return organization.slaMediumHours;
};

export const computeSlaDueAt = (createdAt, slaHours) => {
  return new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);
};

export const openTicketStatuses = ["OPEN", "IN_PROGRESS"];
