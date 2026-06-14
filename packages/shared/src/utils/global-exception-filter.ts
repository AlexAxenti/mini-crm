import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from "@nestjs/common";
import { Request, Response } from "express";

type HttpExceptionLike = {
  getStatus: () => number;
  getResponse: () => string | object;
};

function isHttpExceptionLike(exception: unknown): exception is HttpExceptionLike {
  return (
    typeof exception === "object" &&
    exception !== null &&
    "getStatus" in exception &&
    "getResponse" in exception &&
    typeof (exception as HttpExceptionLike).getStatus === "function" &&
    typeof (exception as HttpExceptionLike).getResponse === "function"
  );
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = isHttpExceptionLike(exception);
    const status = isHttpException ? exception.getStatus() : 500;

    let message: string | object;

    if (isHttpException) {
      const exceptionResponse = exception.getResponse();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (exceptionResponse as any).message || exceptionResponse;
      console.log(exceptionResponse);
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
