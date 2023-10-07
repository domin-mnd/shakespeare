/**
 * Returns the file extension from a given fullname.
 *
 * @param {string} fullname - The full name of the file.
 * @return {string} The file extension.
 */
export function getExtension(fullname: string): string {
  // No .pop();
  return fullname.split(".")[1];
}
