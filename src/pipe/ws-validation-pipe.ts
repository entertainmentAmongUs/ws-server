import { Injectable, Logger, ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WSValidationPipe extends ValidationPipe {
  private logger: Logger = new Logger(WSValidationPipe.name);

  createExceptionFactory() {
    return (validationErrors = []) => {
      if (this.isDetailedOutputDisabled) {
        return new WsException('Bad request');
      }
      const errors = this.flattenValidationErrors(validationErrors);
      this.logger.log(errors);
      return new WsException(errors);
    };
  }
}
