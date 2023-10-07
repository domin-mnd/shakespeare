/** Busboy file interface */
interface File {
  on: (arg0: string, arg1: (data: { length: number }) => void) => void;
}

/** Busboy filedata interface */
interface FileData {
  /** File name (with extension) */
  filename: string;
  /** Encoding e.g. 7-bit */
  encoding: string;
  /** Mimetype e.g. image/jpeg */
  mimeType: string;
}
