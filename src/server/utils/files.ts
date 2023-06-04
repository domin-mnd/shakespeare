import type { H3Event } from "h3";
import type { Files } from "formidable";
import formidable, { Options } from "formidable";

/**
 * Reads files from an H3Event using the formidable library.
 *
 * @param {H3Event} event - The event to read files from.
 * @param {Options} [options] - Options to configure the formidable instance.
 * @return {Promise<Files>} A promise that resolves to the parsed files.
 */
export function readFiles(
  event: H3Event,
  options?: Options
): Promise<Files> {
  return new Promise<Files>((resolve, reject) => {
    const form = formidable(options);

    form.parse(event.node.req, (err, _fields, files) => {
      if (err) reject(err);

      resolve(files);
    });
  });
}
