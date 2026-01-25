
import { Logger } from "../Logger";
import * as JsSIP_C from "../Constants"



// const Logger = require('../Logger');
// const JsSIP_C = require('../Constants');

const logger = new Logger('RTCSession:ReferNotifier');

const C = {
  event_type: 'refer',
  body_type: 'message/sipfrag;version=2.0',
  expires: 300
};


export class ReferNotifier {
  _session: any;
  _id: any;
  _expires: any;
  _active = true;

  constructor(session: any, id: any, expires?: any) {
    this._session = session;
    this._id = id;
    this._expires = expires || C.expires;
    this._active = true;

    // The creation of a Notifier results in an immediate NOTIFY.
    this.notify(100);
  }

  notify(code: any, reason?: any) {
    logger.debug('notify()');

    if (this._active === false) {
      return;
    }

    reason = reason || JsSIP_C.REASON_PHRASE[code] || '';

    let state;

    if (code >= 200) {
      state = 'terminated;reason=noresource';
    }
    else {
      state = `active;expires=${this._expires}`;
    }

    // Put this in a try/catch block.
    this._session.sendRequest(JsSIP_C.NOTIFY, {
      extraHeaders: [
        `Event: ${C.event_type};id=${this._id}`,
        `Subscription-State: ${state}`,
        `Content-Type: ${C.body_type}`
      ],
      body: `SIP/2.0 ${code} ${reason}`,
      eventHandlers: {
        // If a negative response is received, subscription is canceled.
        // TODO: Come back and fix this error below using ts-ignore
        // @ts-ignore
        onErrorResponse() { this._active = false; }
      }
    });
  }
};
