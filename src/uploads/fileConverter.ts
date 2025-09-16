import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";

export const avatarStreamUpload = (
  fileBuffer: Buffer
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "userProfile", resource_type: "image" },
      (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
        if (error) return reject(error);
        if (!result)
          return reject(new Error("Cloudinary upload failed, no result"));
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};
