export class AppError extends Error {
  public statusCode: number;
  public status: string;
  constructor(meg: string, statuCode: number) {
    super(meg);
    this.statusCode = statuCode;
    this.status = this.statusCode === 500 ? "error" : "fail";
    Error.captureStackTrace(this, this.constructor);
  }
}
