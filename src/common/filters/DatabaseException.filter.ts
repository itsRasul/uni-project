import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, UpdateValuesMissingError } from 'typeorm';

@Catch(QueryFailedError, UpdateValuesMissingError)
export class DatabaseExeptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError | UpdateValuesMissingError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const logger = new Logger(DatabaseExeptionFilter.name);
    logger.error(exception.message);
    console.log({ exception });

    // @ts-ignore
    if (exception.code == 23505) {
      // UNIQUE ERROR
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: exception.message,
        // @ts-ignore
        details: exception.detail,
      });
      // @ts-ignore
    } else if (exception.code == 23503) {
      // foreign key constraints
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      });
    } else if (exception instanceof UpdateValuesMissingError) {
      // update a record without providing new values
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      });
      // @ts-ignore
    } else if (exception.code == 23502) {
      // NULL constraint
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      });
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
      });
    }
  }
}
