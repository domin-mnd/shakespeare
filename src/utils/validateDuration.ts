export function validateDuration(duration: string): boolean {
  const re = new RegExp(/^\d*\.?\d+(s|ms)$/);
  return re.test(duration);
}
