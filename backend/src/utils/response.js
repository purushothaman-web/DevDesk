class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }

    static success(res, statusCode = 200, message = "Success", data = null) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    static error(res, statusCode = 500, message = "Error", error = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            error
        });
    }
}

export { ApiResponse };
