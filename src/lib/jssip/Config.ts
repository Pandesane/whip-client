
import * as Utils from "./Utils"
import * as JsSIP_C from "./Constants"
import * as Grammar from "./Grammar"
import { URI } from "./URI";
import * as  Socket from "./Socket";
import * as Exceptions from "./Exceptions"



// Default settings.
export const settings = {
  // SIP authentication.
  authorization_user: null,
  password: null,
  realm: null,
  ha1: null,
  authorization_jwt: null,

  // SIP account.
  display_name: null,
  uri: null,
  contact_uri: null,

  // SIP instance id (GRUU).
  instance_id: null,

  // Preloaded SIP Route header field.
  use_preloaded_route: false,

  // Session parameters.
  session_timers: true,
  session_timers_refresh_method: JsSIP_C.UPDATE,
  session_timers_force_refresher: false,
  no_answer_timeout: 60,

  // Registration parameters.
  register: true,
  register_expires: 600,
  register_from_tag_trail: '',
  registrar_server: null,

  // Connection options.
  sockets: null,
  connection_recovery_max_interval: JsSIP_C.CONNECTION_RECOVERY_MAX_INTERVAL,
  connection_recovery_min_interval: JsSIP_C.CONNECTION_RECOVERY_MIN_INTERVAL,

  // Global extra headers, to be added to every request and response
  extra_headers: null,

  /*
   * Host address.
   * Value to be set in Via sent_by and host part of Contact FQDN.
  */
  via_host: `${Utils.createRandomToken(12)}.invalid`
};

// Configuration checks.
const checks = {
  mandatory: {

    sockets(sockets: any) {
      /* Allow defining sockets parameter as:
       *  Socket: socket
       *  Array of Socket: [socket1, socket2]
       *  Array of Objects: [{socket: socket1, weight:1}, {socket: Socket2, weight:0}]
       *  Array of Objects and Socket: [{socket: socket1}, socket2]
       */
      const _sockets = [];

      if (Socket.isSocket(sockets)) {
        _sockets.push({ socket: sockets });
      }
      else if (Array.isArray(sockets) && sockets.length) {
        for (const socket of sockets) {
          if (Object.prototype.hasOwnProperty.call(socket, 'socket') &&
            Socket.isSocket(socket.socket)) {
            _sockets.push(socket);
          }
          else if (Socket.isSocket(socket)) {
            _sockets.push({ socket: socket });
          }
        }
      }
      else {
        return;
      }

      return _sockets;
    },

    uri(uri: any) {
      if (!/^sip:/i.test(uri)) {
        uri = `${JsSIP_C.SIP}:${uri}`;
      }
      const parsed: any = URI.parse(uri);

      if (!parsed) {
        return;
      }
      else if (!parsed.user) {
        return;
      }
      else {
        return parsed;
      }
    }
  },

  optional: {

    authorization_user(authorization_user: any) {
      if (Grammar.parse(`"${authorization_user}"`, 'quoted_string') === -1) {
        return;
      }
      else {
        return authorization_user;
      }
    },
    authorization_jwt(authorization_jwt: any) {
      if (typeof authorization_jwt === 'string') {
        return authorization_jwt;
      }
    },
    user_agent(user_agent: any) {
      if (typeof user_agent === 'string') {
        return user_agent;
      }
    },

    connection_recovery_max_interval(connection_recovery_max_interval: any) {
      if (Utils.isDecimal(connection_recovery_max_interval)) {
        const value = Number(connection_recovery_max_interval);

        if (value > 0) {
          return value;
        }
      }
    },

    connection_recovery_min_interval(connection_recovery_min_interval: any) {
      if (Utils.isDecimal(connection_recovery_min_interval)) {
        const value = Number(connection_recovery_min_interval);

        if (value > 0) {
          return value;
        }
      }
    },

    contact_uri(contact_uri: any) {
      if (typeof contact_uri === 'string') {
        const uri = Grammar.parse(contact_uri, 'SIP_URI');

        if (uri !== -1) {
          return uri;
        }
      }
    },

    display_name(display_name: any) {
      return display_name;
    },

    instance_id(instance_id: any) {
      if ((/^uuid:/i.test(instance_id))) {
        instance_id = instance_id.substr(5);
      }

      if (Grammar.parse(instance_id, 'uuid') === -1) {
        return;
      }
      else {
        return instance_id;
      }
    },

    no_answer_timeout(no_answer_timeout: any) {
      if (Utils.isDecimal(no_answer_timeout)) {
        const value = Number(no_answer_timeout);

        if (value > 0) {
          return value;
        }
      }
    },

    session_timers(session_timers: any) {
      if (typeof session_timers === 'boolean') {
        return session_timers;
      }
    },

    session_timers_refresh_method(method: any) {
      if (typeof method === 'string') {
        method = method.toUpperCase();

        if (method === JsSIP_C.INVITE || method === JsSIP_C.UPDATE) {
          return method;
        }
      }
    },

    session_timers_force_refresher(session_timers_force_refresher: any) {
      if (typeof session_timers_force_refresher === 'boolean') {
        return session_timers_force_refresher;
      }
    },

    password(password: any) {
      return String(password);
    },

    realm(realm: any) {
      return String(realm);
    },

    ha1(ha1: any) {
      return String(ha1);
    },

    register(register: any) {
      if (typeof register === 'boolean') {
        return register;
      }
    },

    register_expires(register_expires: any) {
      if (Utils.isDecimal(register_expires)) {
        const value = Number(register_expires);

        if (value >= 0) {
          return value;
        }
      }
    },

    register_from_tag_trail(register_from_tag_trail: any) {
      if (typeof register_from_tag_trail === 'function') {
        return register_from_tag_trail;
      }

      return String(register_from_tag_trail);
    },

    registrar_server(registrar_server: any) {
      if (!/^sip:/i.test(registrar_server)) {
        registrar_server = `${JsSIP_C.SIP}:${registrar_server}`;
      }

      const parsed: any = URI.parse(registrar_server);

      if (!parsed) {
        return;
      }
      else if (parsed.user) {
        return;
      }
      else {
        return parsed;
      }
    },

    use_preloaded_route(use_preloaded_route: any) {
      if (typeof use_preloaded_route === 'boolean') {
        return use_preloaded_route;
      }
    },

    extra_headers(extra_headers: any) {
      const _extraHeaders = [];

      if (Array.isArray(extra_headers) && extra_headers.length) {
        for (const header of extra_headers) {
          if (typeof header === 'string') {
            _extraHeaders.push(header);
          }
        }
      }
      else {
        return;
      }

      return _extraHeaders;
    }
  }
};

export const load = (dst: any, src: any) => {
  // Check Mandatory parameters.
  for (const parameter in checks.mandatory) {
    if (!src.hasOwnProperty(parameter)) {
      throw new Exceptions.ConfigurationError(parameter);
    }
    else {
      const value: any = src[parameter];
      // @ts-ignore
      const checked_value: any = checks.mandatory[parameter](value);

      if (checked_value !== undefined) {
        dst[parameter] = checked_value;
      }
      else {
        throw new Exceptions.ConfigurationError(parameter, value);
      }
    }
  }

  // Check Optional parameters.
  for (const parameter in checks.optional) {
    if (src.hasOwnProperty(parameter)) {
      const value = src[parameter];

      /* If the parameter value is null, empty string, undefined, empty array
       * or it's a number with NaN value, then apply its default value.
       */
      if (Utils.isEmpty(value)) {
        continue;
      }
      // @ts-ignore
      const checked_value = checks.optional[parameter](value);

      if (checked_value !== undefined) {
        dst[parameter] = checked_value;
      }
      else {
        throw new Exceptions.ConfigurationError(parameter, value);
      }
    }
  }
};
