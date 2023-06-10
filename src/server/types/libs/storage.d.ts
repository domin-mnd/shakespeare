/** A simplified type for handling file writes */
type FileWriteStreamHandler = (file?: import("formidable/VolatileFile")) => import("node:stream").Writable;

/** Results of uploading */
type Results =
  | import("@aws-sdk/client-s3").AbortMultipartUploadCommandOutput
  | import("@aws-sdk/client-s3").CompleteMultipartUploadCommandOutput;

/** A simplified type for receiving contents of the upload */
type Contents = () => Promise<Results>;

/** A simplified type for file deletion */
type Delete = () => Promise<import("@aws-sdk/client-s3").DeleteObjectCommandOutput | null>;

/** A function under which you can upload and call contents from it (for less-request purposes) */
interface Uploader {
  /** Upload a file to Amazon S3 */
  upload: FileWriteStreamHandler;
  /** Delete a file (change its version) in Amazon S3 */
  delete: Delete;
  /** Get the contents of a file in Amazon S3, awaits if needed */
  contents: Contents;
}