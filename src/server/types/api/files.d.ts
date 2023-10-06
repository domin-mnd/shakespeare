/**
 * ### GET `/api/files` request
 */
interface GetFileRequest {
  query: {
    /** Entire filename to fetch for. */
    filename?: string;
  }
}

/**
 * ### GET `/api/files` success response
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
 * ### POST `/api/files` request
 * 
 * @header Authorization
 * @header Content-Type
 */
interface CreateFileRequest {
  query: {
    type?: "classic" | "numbers" | "pronounceable";
    length?: number;
  }
};

/**
 * ### POST `/api/files` success response
 */
type CreateFileResponse = string;

/**
 * ### DELETE `/api/files` request
 * 
 * @header Authorization
 */
interface DeleteFileRequest {
  body: {
    /** Slug filename to delete (not filename itself e.g. "fQwE.png"). */
    filename?: string;
  };
}

/**
 * ### DELETE `/api/files` success response
 */
interface DeleteFileResponse extends DefaultResponse {
  /** Metadata response from S3 */
  body: void;
}
