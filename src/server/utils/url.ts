let overriddenURL: string;

if (process.env.OVERRIDE_URL) overriddenURL = process.env.OVERRIDE_URL;

/**
 * Retrieves the URL for the simple storage service.
 *
 * @return {string} The URL for the simple storage service.
 */
export function getSimpleStorageURL(): string {
  /**
   * @see {@link https://stackoverflow.com/a/7933570/14301934 S3 URL}
   */

  if (overriddenURL) return overriddenURL;

  if (process.env.S3_ENDPOINT?.endsWith("/"))
    throw {
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Invalid S3 endpoint. Endpoint shouldn't end with a slash.",
    };

  return `https://${
    process.env.S3_BUCKET_NAME ? process.env.S3_BUCKET_NAME + "." : ""
  }${process.env.S3_ENDPOINT}`;
}
