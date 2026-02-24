import { z } from "zod";

export const updateOrganizationSlaSchema = z.object({
  slaLowHours: z.number().int().min(1).max(720),
  slaMediumHours: z.number().int().min(1).max(720),
  slaHighHours: z.number().int().min(1).max(720),
});
