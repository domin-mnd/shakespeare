/**
 * ### GET `/api/files` success response
 * 
 * @param {string} filename - Entire filename to fetch for
 */
type GetFileResponse = Omit<import("@prisma/client").Upload, "authorId" | "path"> & {
  /** Elevated counted views for the upload */
  views: number;
  /** Upload author */
  author: Omit<import("@prisma/client").AuthUser, "api_key" | "role"> & {
    username: string;
  };
}

/**
 * ### POST `/api/files` success response
 * 
 * @header Authorization
 * @header Content-Type
 */
type CreateFileResponse = Promise<string>;

/**
 * ### DELETE `/api/files` success response
 * 
 * @header Authorization
 * @prop {string} filename - Slug filename to delete (not filename itself e.g. "fQwE.png")
 */
interface DeleteFileResponse extends DefaultResponse {
  /** Metadata response from S3 */
  body: import("@aws-sdk/client-s3").DeleteObjectCommandOutput;
}
