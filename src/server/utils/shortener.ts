import { ShorteningType, classic, numbers } from "@/server/libs/constants";
import { word } from "slova";

/**
 * Returns a string of random characters from the given string with a length specified by the user.
 *
 * @param {string} string - The string to select characters from.
 * @param {number} length - The desired length of the resulting string.
 * @return {string} The resulting string with characters selected randomly.
 */
function shuffler(string: string, length: number): string {
  let result = "";
  const characters = string.split("");

  for (let i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }

  return result;
}

/**
 * Returns a shortened string based on the given type and length.
 *
 * @param {ShorteningType | string} type - The type of shortening to use.
 * @param {number} [length=4] - The desired length of the shortened string.
 * @return {string} The shortened string.
 */
export function shortener(type: ShorteningType | string, length: number = 4): string {
  switch (type) {
    case ShorteningType.Classic:
      return shuffler(classic, length);
    case ShorteningType.Pronounceable:
      if (length < 3)
        throw "Length must be at least 3 characters.";
      return word({ length })()[0];
    case ShorteningType.Numbers:
      return shuffler(numbers, length);
    default:
      return shuffler(type, length);
  }
}
