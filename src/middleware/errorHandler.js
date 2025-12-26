export const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: "Validation Error",
            message: Object.values(err.errors).map(e => e.message).join(', ')
        });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        return res.status(409).json({
            error: "Duplicate",
            message: "El recurso ya existe"
        });
    }

    // Default
    return res.status(err.statusCode || 500).json({
        error: err.name || "Server Error",
        message: err.message || "Error interno del servidor"
    });
};