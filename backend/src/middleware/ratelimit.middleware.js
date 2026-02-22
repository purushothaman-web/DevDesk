import { rateLimit } from "express-rate-limit";

export const globalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: "Too many requests from this IP, please try again after 15 minutes",
});

export const loginRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 50,
    message: "Too many login attempts from this IP, please try again after 10 minutes",
}); 

export const registerRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 50,
    message: "Too many register attempts from this IP, please try again after 10 minutes",
});