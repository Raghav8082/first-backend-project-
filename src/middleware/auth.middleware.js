import { asyncHandler } from "./asyncHandler.middleware.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Support token coming from cookie or Authorization header
    let token = null;

    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(401, "unauthorized access , no token");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "this is invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "unauthorized access , invalid token");
  }
});


