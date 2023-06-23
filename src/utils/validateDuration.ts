/**
 * Validates the given duration string to check if it is in the correct format.
 *
 * @param {string} duration - The duration string to be validated.
 *                            It should be in the format of digit(s) followed by "s" or "ms"
 * @return {boolean} Returns true if the duration string is valid, false otherwise.
 */
export function validateDuration(duration: string): boolean {
  const re = new RegExp(/^\d*\.?\d+(s|ms)$/);
  return re.test(duration);
}
