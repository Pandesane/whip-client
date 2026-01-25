import * as JsSIP_C from "./Constants"
import * as Grammar from "./Grammar.js";
import * as Utils from "./Utils"


export type URIScheme = 'sip' | string;

export type Parameters = Record<string, string | null>;

export type Headers = Record<string, string | string[]>;


/**
 * -param {String} [scheme]
 * -param {String} [user]
 * -param {String} host
 * -param {String} [port]
 * -param {Object} [parameters]
 * -param {Object} [headers]
 *
 */
export class URI {
  _scheme: "sip" | string
  _user: string
  _host: string
  _port?: number
  _parameters: Record<string, string | undefined>
  _headers: Record<string, string | string[]>
  /**
    * Parse the given string and returns a JsSIP.URI instance or undefined if
    * it is an invalid URI.
    */
  static parse(uri: string) {
    uri = Grammar.parse(uri, 'SIP_URI');

    if (parseInt(uri) !== -1) {
      return uri;
    }
    else {
      return undefined;
    }
  }

  constructor(scheme: URIScheme, user: string, host: string, port?: number, parameters?: Parameters, headers?: Headers) {
    // Checks.
    if (!host) {
      throw new TypeError('missing or invalid "host" parameter');
    }

    // Initialize parameters.
    this._parameters = {};
    this._headers = {};

    this._scheme = scheme || JsSIP_C.SIP;
    this._user = user;
    this._host = host;
    this._port = port;

    for (const param in parameters) {
      if (Object.prototype.hasOwnProperty.call(parameters, param)) {
        this.setParam(param, parameters[param] ?? undefined);
      }
    }

    for (const header in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, header)) {
        this.setHeader(header, headers[header]);
      }
    }
  }

  get scheme() {
    return this._scheme;
  }

  set scheme(value) {
    this._scheme = value.toLowerCase();
  }

  get user() {
    return this._user;
  }

  set user(value) {
    this._user = value;
  }

  get host() {
    return this._host;
  }

  set host(value) {
    this._host = value.toLowerCase();
  }

  get port(): number | undefined {
    return this._port;
  }

  set port(value: number) {
    this._port = value;
  }

  setParam(key: string, value?: string) {
    if (key) {
      this._parameters[key.toLowerCase()] = (typeof value === 'undefined' || value === null) ? undefined : value.toString();
    }
  }

  getParam(key: string): string | undefined {
    if (key) {
      return this._parameters[key.toLowerCase()];
    }
  }

  hasParam(key: string) {
    if (key) {
      return (this._parameters.hasOwnProperty(key.toLowerCase()) && true) || false;
    }
  }

  deleteParam(parameter: string) {
    parameter = parameter.toLowerCase();
    if (this._parameters.hasOwnProperty(parameter)) {
      const value = this._parameters[parameter];

      delete this._parameters[parameter];

      return value;
    }
  }

  clearParams() {
    this._parameters = {};
  }

  setHeader(name: string, value: string | string[]) {
    this._headers[Utils.headerize(name)] = (Array.isArray(value)) ? value : [value];
  }

  getHeader(name: string): string | string[] {
    return this._headers[Utils.headerize(name)];
  }

  hasHeader(name: string): boolean {
    return (this._headers.hasOwnProperty(Utils.headerize(name)) && true) || false;
  }

  deleteHeader(header: string) {
    header = Utils.headerize(header);
    if (this._headers.hasOwnProperty(header)) {
      const value = this._headers[header];

      delete this._headers[header];

      return value;
    }
  }

  clearHeaders() {
    this._headers = {};
  }

  clone() {
    return new URI(
      this._scheme,
      this._user,
      this._host,
      this._port,
      JSON.parse(JSON.stringify(this._parameters)),
      JSON.parse(JSON.stringify(this._headers)));
  }

  toString() {
    const headers = [];

    let uri = `${this._scheme}:`;

    if (this._user) {
      uri += `${Utils.escapeUser(this._user)}@`;
    }
    uri += this._host;
    if (this._port || this._port === 0) {
      uri += `:${this._port}`;
    }

    for (const parameter in this._parameters) {
      if (Object.prototype.hasOwnProperty.call(this._parameters, parameter)) {
        uri += `;${parameter}`;

        if (this._parameters[parameter] !== null) {
          uri += `=${this._parameters[parameter]}`;
        }
      }
    }

    for (const header in this._headers) {
      if (Object.prototype.hasOwnProperty.call(this._headers, header)) {
        for (const item of this._headers[header]) {
          headers.push(`${header}=${item}`);
        }
      }
    }

    if (headers.length > 0) {
      uri += `?${headers.join('&')}`;
    }

    return uri;
  }

  toAor(show_port: boolean) {
    let aor = `${this._scheme}:`;

    if (this._user) {
      aor += `${Utils.escapeUser(this._user)}@`;
    }
    aor += this._host;
    if (show_port && (this._port || this._port === 0)) {
      aor += `:${this._port}`;
    }

    return aor;
  }
};
