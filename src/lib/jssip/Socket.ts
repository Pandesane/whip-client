
import { Logger } from "./Logger";
import * as Utils from "./Utils"
import * as Grammar from "./Grammar"




export interface WeightedSocket {
  socket: Socket;
  weight: number
}

export interface Socket {
  get via_transport(): string;
  set via_transport(value: string);

  get url(): string;

  get sip_uri(): string;

  connect(): void;

  disconnect(): void;

  send(message: string | ArrayBufferLike | Blob | ArrayBufferView): boolean;

  isConnected(): boolean;

  isConnecting(): boolean;

  onconnect(): void;

  ondisconnect(error: boolean, code?: number, reason?: string): void;

  ondata<T>(event: T): void;
}


const logger = new Logger('Socket');

/**
 * Interface documentation: https://jssip.net/documentation/$last_version/api/socket/
 *
 * interface Socket {
 *  attribute String via_transport
 *  attribute String url
 *  attribute String sip_uri
 *
 *  method connect();
 *  method disconnect();
 *  method send(data);
 *
 *  attribute EventHandler onconnect
 *  attribute EventHandler ondisconnect
 *  attribute EventHandler ondata
 * }
 *
 */

export const isSocket = (socket: any) => {
  // Ignore if an array is given.
  if (Array.isArray(socket)) {
    return false;
  }

  if (typeof socket === 'undefined') {
    logger.warn('undefined JsSIP.Socket instance');

    return false;
  }

  // Check Properties.
  try {
    if (!Utils.isString(socket.url)) {
      logger.warn('missing or invalid JsSIP.Socket url property');
      throw new Error('Missing or invalid JsSIP.Socket url property');
    }

    if (!Utils.isString(socket.via_transport)) {
      logger.warn('missing or invalid JsSIP.Socket via_transport property');
      throw new Error('Missing or invalid JsSIP.Socket via_transport property');
    }

    if (Grammar.parse(socket.sip_uri, 'SIP_URI') === -1) {
      logger.warn('missing or invalid JsSIP.Socket sip_uri property');
      throw new Error('missing or invalid JsSIP.Socket sip_uri property');
    }
  }
  catch (e) {
    return false;
  }

  // Check Methods.
  try {
    ['connect', 'disconnect', 'send'].forEach((method) => {
      if (!Utils.isFunction(socket[method])) {
        logger.warn(`missing or invalid JsSIP.Socket method: ${method}`);
        throw new Error(`Missing or invalid JsSIP.Socket method: ${method}`);
      }
    });
  }
  catch (e) {
    return false;
  }

  return true;
};
