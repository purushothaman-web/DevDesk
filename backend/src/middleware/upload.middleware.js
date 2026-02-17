import multer from "multer";
import path from "path";
import fs from "fs";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const isProduction = process.env.NODE_ENV === "production";

let storage;

if (isProduction) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "devdesk_uploads",
      allowed_formats: ["jpg", "png", "jpeg", "webp", "pdf"],
    },
  });
} else {
  const uploadDir = "uploads";
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName =
        Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueName + ext);
    },
  });
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});