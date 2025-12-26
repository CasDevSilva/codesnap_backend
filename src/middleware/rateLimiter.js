import rateLimit from "express-rate-limit";

export const generateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // 20 requests por ventana
    message: {
        error: "Too many requests",
        message: "Has excedido el límite. Intenta en 15 minutos."
    },
    standardHeaders: true,
    legacyHeaders: false
});