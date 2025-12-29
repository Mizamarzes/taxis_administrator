import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        const message =
            typeof exceptionResponse === 'string'
                ? exceptionResponse
                : typeof exceptionResponse === 'object' &&
                    exceptionResponse !== null &&
                    'message' in exceptionResponse
                  ? exceptionResponse.message
                  : 'Error';

        const formattedMessage = Array.isArray(message)
            ? (message[0] as string)
            : (message as string);

        response.status(status).json({
            statusCode: status,
            message: formattedMessage,
            error: HttpStatus[status],
            timestamp: new Date().toISOString(),
        });
    }
}
