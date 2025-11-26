export function throwApiError(message: string, res: Response): never {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error: any = new Error(message);
  error.status = res.status || 500;
  throw error;
}
