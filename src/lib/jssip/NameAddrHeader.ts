import { URI } from "./URI";
import * as Grammar from "./Grammar.js"
import type { Parameters } from "./types.ts";


// const URI = require('./URI');
// const Grammar = require('./Grammar');


export class NameAddrHeader {
  /**
   * Parse the given string and returns a NameAddrHeader instance or undefined if
   * it is an invalid NameAddrHeader.
   */
  static parse(name_addr_header: any): any | undefined {
    name_addr_header = Grammar.parse(name_addr_header, 'Name_Addr_Header');

    if (name_addr_header !== -1) {
      return name_addr_header;
    }
    else {
      return undefined;
    }
  }
  _uri: URI
  _parameters?: Parameters
  _display_name?: string

  constructor(uri: URI, display_name?: string, parameters?: Parameters) {
    // Checks.
    if (!uri || !(uri instanceof URI)) {
      throw new TypeError('missing or invalid "uri" parameter');
    }

    // Initialize parameters.
    this._uri = uri;
    this._parameters = {};
    this._display_name = display_name;

    for (const param in parameters) {
      if (Object.prototype.hasOwnProperty.call(parameters, param)) {
        this.setParam(param, parameters[param]);
      }
    }
  }

  get uri() {
    return this._uri;
  }

  get display_name(): string | undefined {
    return this._display_name;
  }

  set display_name(value: string) {
    this._display_name = value;
  }

  setParam(key: string, value: string | undefined | null) {
    if (key) {
      this._parameters![key.toLowerCase()] = value ? null : value!.toString();
    }
  }

  getParam(key: string) {
    if (key) {
      return this._parameters![key.toLowerCase()];
    }
  }

  hasParam(key: string): boolean {
    return (this._parameters!.hasOwnProperty(key.toLowerCase()) && true) || false;
  }

  deleteParam(parameter: string) {
    parameter = parameter.toLowerCase();
    if (this._parameters!.hasOwnProperty(parameter)) {
      const value = this._parameters![parameter];

      delete this._parameters![parameter];

      return value;
    }
  }

  clearParams() {
    this._parameters = {};
  }

  clone() {
    return new NameAddrHeader(
      this._uri.clone(),
      this._display_name,
      JSON.parse(JSON.stringify(this._parameters)));
  }

  _quote(str: string) {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');
  }

  toString() {
    let body = this._display_name ? `"${this._quote(this._display_name)}" ` : '';

    body += `<${this._uri.toString()}>`;

    for (const parameter in this._parameters) {
      if (Object.prototype.hasOwnProperty.call(this._parameters, parameter)) {
        body += `;${parameter}`;

        if (this._parameters[parameter] !== null) {
          body += `=${this._parameters[parameter]}`;
        }
      }
    }

    return body;
  }
};
