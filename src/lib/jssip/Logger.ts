import debug from "debug";
// const debug = require('debug');

const APP_NAME = 'JsSIP';


export class Logger {
  _debug: any
  _warn: any
  _error: any
  constructor(prefix?: string) {
    if (prefix) {
      // @ts-ignore
      this._debug = debug.default(`${APP_NAME}:${prefix}`);
      // @ts-ignore

      this._warn = debug.default(`${APP_NAME}:WARN:${prefix}`);
      // @ts-ignore

      this._error = debug.default(`${APP_NAME}:ERROR:${prefix}`);
    }
    else {
      // @ts-ignore

      this._debug = debug.default(APP_NAME);
      // @ts-ignore

      this._warn = debug.default(`${APP_NAME}:WARN`);
      // @ts-ignore

      this._error = debug.default(`${APP_NAME}:ERROR`);
    }
    /* eslint-disable no-console */
    // @ts-ignore

    this._debug.log = console.info.bind(console);
    // @ts-ignore

    this._warn.log = console.warn.bind(console);
    // @ts-ignore
    this._error.log = console.error.bind(console);
    /* eslint-enable no-console */
  }

  get debug() {
    return this._debug;
  }

  get warn() {
    return this._warn;
  }

  get error() {
    return this._error;
  }
};
