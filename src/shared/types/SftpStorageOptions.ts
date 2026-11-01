export type SftpStorageOptions = {
  host: string;
  port: number;
  username: string;
  privateKey: string; // key contents, not a file path
  remoteRoot?: string; // e.g. "/upload"
};
