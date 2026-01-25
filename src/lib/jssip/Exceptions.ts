export class ConfigurationError extends Error {
  code: number
  parameter: string
  value: any

  constructor(parameter: string, value?: any) {
    super();

    this.code = 1;
    this.name = 'CONFIGURATION_ERROR';
    this.parameter = parameter;
    this.value = value;
    this.message = (!this.value) ?
      `Missing parameter: ${this.parameter}` :
      `Invalid value ${JSON.stringify(this.value)} for parameter "${this.parameter}"`;
  }
}


export class InvalidStateError extends Error {
  code: number
  // name: string
  status:  number
  // message: string

  constructor(status:  number) {
    super();

    this.code = 2;
    this.name = 'INVALID_STATE_ERROR';
    this.status = status;
    this.message = `Invalid status: ${status}`;
  }
}

export class NotSupportedError extends Error {
  code: number

  constructor(message: string) {
    super();

    this.code = 3;
    this.name = 'NOT_SUPPORTED_ERROR';
    this.message = message;
  }
}

export class NotReadyError extends Error {
  code: number
  constructor(message: string) {
    super();

    this.code = 4;
    this.name = 'NOT_READY_ERROR';
    this.message = message;
  }
}