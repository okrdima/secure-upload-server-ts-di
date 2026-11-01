export {};

declare global {
  namespace Express {
    interface Request {
      user_id?: string | number;
      request_id?: string;
    }
  }
}
