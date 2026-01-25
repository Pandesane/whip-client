import * as Constants from "./Constants";
import * as Exceptions from "./Exceptions"
import * as Utils from "./Utils";
import * as Grammar from "./Grammar.js";
import { UA } from "./UA";
import { URI } from "./URI";
import { NameAddrHeader } from "./NameAddrHeader";
import { WebSocketInterface } from "./WebSocketInterface"
import { debug } from "debug";
export type {
  IncomingRTCSessionEvent,
  OutgoingRTCSessionEvent,
  UAConfiguration
} from "./UA";


export type { RTCSessionEventMap } from "./RTCSession";


export type { Socket, WeightedSocket } from "./Socket";

import { RTCSession } from "./RTCSession";

// debug('version %s', pkg.version);

/**
 * Expose the JsSIP module.
 */
export {
  Constants,
  Exceptions,
  Utils,
  UA,
  URI,
  NameAddrHeader,
  WebSocketInterface,
  Grammar,
  RTCSession,
  // Expose the debug module.
  debug,

  // get name() { return pkg.title; },
  // get version() { return pkg.version; }
};
