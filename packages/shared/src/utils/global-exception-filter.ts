import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    let message: string | object;

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message =
        typeof response === "string"
          ? response
          : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (response as any).message || response;
      console.log(response);
    } else {
      message = "Internal server error";
      console.log(exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
