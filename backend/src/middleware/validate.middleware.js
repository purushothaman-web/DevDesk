import { ApiResponse } from "../utils/response.js";

export const validate = (schema) => (req, res, next) => {
  try {
    const parseResult = schema.safeParse(req.body);

    if (parseResult.success) {
      req.body = parseResult.data;
      next();
    } else {
      const errors = parseResult.error.errors.map(err => err.message).join(", ");
      return ApiResponse.error(res, 400, errors);
    }
  } catch (error) {
    return next(error);
  }
};
