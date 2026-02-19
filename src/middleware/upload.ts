import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { Request } from "express";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadEventImages = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req: Request, file, cb) => {
      const eventId = req.body.eventId || "temp";
      const folder = `events/${eventId}`;
      cb(null, `${folder}/${Date.now()}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
