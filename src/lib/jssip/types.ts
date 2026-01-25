import { EventEmitter } from 'events'

import { IncomingRequest, IncomingResponse, OutgoingRequest } from './SIPMessage'
import type { RTCSession } from './RTCSession';
// import {NameAddrHeader} from './NameAddrHeader'
// import {URI} from './URI'
// import {UA} from './UA'
// import {causes} from './Constants'

export let USER_AGENT: string
export const SIP = 'sip'
export const SIPS = 'sips'

export declare enum causes {
  CONNECTION_ERROR = 'Connection Error',
  REQUEST_TIMEOUT = 'Request Timeout',
  SIP_FAILURE_CODE = 'SIP Failure Code',
  INTERNAL_ERROR = 'Internal Error',
  BUSY = 'Busy',
  REJECTED = 'Rejected',
  REDIRECTED = 'Redirected',
  UNAVAILABLE = 'Unavailable',
  NOT_FOUND = 'Not Found',
  ADDRESS_INCOMPLETE = 'Address Incomplete',
  INCOMPATIBLE_SDP = 'Incompatible SDP',
  MISSING_SDP = 'Missing SDP',
  AUTHENTICATION_ERROR = 'Authentication Error',
  BYE = 'Terminated',
  WEBRTC_ERROR = 'WebRTC Error',
  CANCELED = 'Canceled',
  NO_ANSWER = 'No Answer',
  EXPIRES = 'Expires',
  NO_ACK = 'No ACK',
  DIALOG_ERROR = 'Dialog Error',
  USER_DENIED_MEDIA_ACCESS = 'User Denied Media Access',
  BAD_MEDIA_DESCRIPTION = 'Bad Media Description',
  RTP_TIMEOUT = 'RTP Timeout',
}

export const SIP_ERROR_CAUSES = {
  REDIRECTED: [300, 301, 302, 305, 380],
  BUSY: [486, 600],
  REJECTED: [403, 603],
  NOT_FOUND: [404, 604],
  UNAVAILABLE: [480, 410, 408, 430],
  ADDRESS_INCOMPLETE: [484, 424],
  INCOMPATIBLE_SDP: [488, 606],
  AUTHENTICATION_ERROR: [401, 407]
}
export const ACK = 'ACK'
export const BYE = 'BYE'
export const CANCEL = 'CANCEL'
export const INFO = 'INFO'
export const INVITE = 'INVITE'
export const MESSAGE = 'MESSAGE'
export const NOTIFY = 'NOTIFY'
export const OPTIONS = 'OPTIONS'
export const REGISTER = 'REGISTER'
export const REFER = 'REFER'
export const UPDATE = 'UPDATE'
export const SUBSCRIBE = 'SUBSCRIBE'

export declare enum DTMF_TRANSPORT {
  INFO = 'INFO',
  RFC2833 = 'RFC2833',
}

export let REASON_PHRASE: Record<number, string>
export const ALLOWED_METHODS = 'INVITE,ACK,CANCEL,BYE,UPDATE,MESSAGE,OPTIONS,REFER,INFO,NOTIFY'
export const ACCEPTED_BODY_TYPES = 'application/sdp, application/dtmf-relay'
export const MAX_FORWARDS = 69
export const SESSION_EXPIRES = 90
export const MIN_SESSION_EXPIRES = 60
export const CONNECTION_RECOVERY_MAX_INTERVAL = 30
export const CONNECTION_RECOVERY_MIN_INTERVAL = 2



export type URIScheme = 'sip' | string;

export type Parameters = Record<string, string | null>;

export type Headers = Record<string, string | string[]>;




interface RTCPeerConnectionDeprecated extends RTCPeerConnection {
  /**
   * @deprecated
   * @see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getRemoteStreams
   */
  getRemoteStreams(): MediaStream[];
}

export declare enum SessionDirection {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
}

export declare enum Originator {
  LOCAL = 'local',
  REMOTE = 'remote',
  SYSTEM = 'system',
}

// options
export interface ExtraHeaders {
  extraHeaders?: string[];
}

export interface AnswerOptions extends ExtraHeaders {
  mediaConstraints?: MediaStreamConstraints;
  mediaStream?: MediaStream;
  pcConfig?: RTCConfiguration;
  rtcConstraints?: object;
  rtcAnswerConstraints?: RTCOfferOptions;
  rtcOfferConstraints?: RTCOfferOptions;
  sessionTimersExpires?: number;
}

export interface RejectOptions extends ExtraHeaders {
  status_code?: number;
  reason_phrase?: string;
}

export interface TerminateOptions extends RejectOptions {
  body?: string;
  cause?: causes | string;
}

export interface ReferOptions extends ExtraHeaders {
  eventHandlers?: any;
  replaces?: RTCSession;
}

export interface OnHoldResult {
  local: boolean;
  remote: boolean;
}

export interface DTMFOptions extends ExtraHeaders {
  duration?: number;
  interToneGap?: number;
  transportType?: DTMF_TRANSPORT;
}

export interface HoldOptions extends ExtraHeaders {
  useUpdate?: boolean;
}

export interface RenegotiateOptions extends HoldOptions {
  rtcOfferConstraints?: RTCOfferOptions;
}

// events
export interface DTMF extends EventEmitter {
  tone: string;
  duration: number;
}

export interface Info extends EventEmitter {
  contentType: string;
  body: string;
}

export interface PeerConnectionEvent {
  peerconnection: RTCPeerConnectionDeprecated;
}

export interface ConnectingEvent {
  request: IncomingRequest | OutgoingRequest;
}

export interface SendingEvent {
  request: OutgoingRequest
}

export interface IncomingEvent {
  originator: Originator.LOCAL;
}

export interface EndEvent {
  originator: Originator;
  message: IncomingRequest | IncomingResponse;
  cause: string;
}

export interface IncomingDTMFEvent {
  originator: Originator.REMOTE;
  dtmf: DTMF;
  request: IncomingRequest;
}

export interface OutgoingDTMFEvent {
  originator: Originator.LOCAL;
  dtmf: DTMF;
  request: OutgoingRequest;
}

export interface IncomingInfoEvent {
  originator: Originator.REMOTE;
  info: Info;
  request: IncomingRequest;
}

export interface OutgoingInfoEvent {
  originator: Originator.LOCAL;
  info: Info;
  request: OutgoingRequest;
}

export interface HoldEvent {
  originator: Originator
}

export interface ReInviteEvent {
  request: IncomingRequest;
  callback?: VoidFunction;
  reject: (options?: RejectOptions) => void;
}

export interface ReferEvent {
  request: IncomingRequest;
  accept: Function;
  reject: VoidFunction;
}

export interface SDPEvent {
  originator: Originator;
  type: string;
  sdp: string;
}

export interface IceCandidateEvent {
  candidate: RTCIceCandidate;
  ready: VoidFunction;
}

export interface OutgoingEvent {
  originator: Originator.REMOTE;
  response: IncomingResponse;
}

export interface OutgoingAckEvent {
  originator: Originator.LOCAL;
}

export interface IncomingAckEvent {
  originator: Originator.REMOTE;
  ack: IncomingRequest;
}

export interface MediaStreamTypes {
  audio?: boolean;
  video?: boolean;
}

// listener
export type GenericErrorListener = (error: any) => void;
export type PeerConnectionListener = (event: PeerConnectionEvent) => void;
export type ConnectingListener = (event: ConnectingEvent) => void;
export type SendingListener = (event: SendingEvent) => void;
export type IncomingListener = (event: IncomingEvent) => void;
export type OutgoingListener = (event: OutgoingEvent) => void;
export type IncomingConfirmedListener = (event: IncomingAckEvent) => void;
export type OutgoingConfirmedListener = (event: OutgoingAckEvent) => void;
export type CallListener = IncomingListener | OutgoingListener;
export type ConfirmedListener = IncomingConfirmedListener | OutgoingConfirmedListener;
export type EndListener = (event: EndEvent) => void;
export type IncomingDTMFListener = (event: IncomingDTMFEvent) => void;
export type OutgoingDTMFListener = (event: OutgoingDTMFEvent) => void;
export type DTMFListener = IncomingDTMFListener | OutgoingDTMFListener;
export type IncomingInfoListener = (event: IncomingInfoEvent) => void;
export type OutgoingInfoListener = (event: OutgoingInfoEvent) => void;
export type InfoListener = IncomingInfoListener | OutgoingInfoListener;
export type HoldListener = (event: HoldEvent) => void;
export type MuteListener = (event: MediaStreamTypes) => void;
export type ReInviteListener = (event: ReInviteEvent) => void;
export type UpdateListener = ReInviteListener;
export type ReferListener = (event: ReferEvent) => void;
export type SDPListener = (event: SDPEvent) => void;
export type IceCandidateListener = (event: IceCandidateEvent) => void;

export interface RTCSessionEventMap {
  'peerconnection': PeerConnectionListener;
  'connecting': ConnectingListener;
  'sending': SendingListener;
  'progress': CallListener;
  'accepted': CallListener;
  'confirmed': ConfirmedListener;
  'ended': EndListener;
  'failed': EndListener;
  'newDTMF': DTMFListener;
  'newInfo': InfoListener;
  'hold': HoldListener;
  'unhold': HoldListener;
  'muted': MuteListener;
  'unmuted': MuteListener;
  'reinvite': ReInviteListener;
  'update': UpdateListener;
  'refer': ReferListener;
  'replaces': ReferListener;
  'sdp': SDPListener;
  'icecandidate': IceCandidateListener;
  'getusermediafailed': GenericErrorListener;
  'peerconnection:createofferfailed': GenericErrorListener;
  'peerconnection:createanswerfailed': GenericErrorListener;
  'peerconnection:setlocaldescriptionfailed': GenericErrorListener;
  'peerconnection:setremotedescriptionfailed': GenericErrorListener;
}

declare enum SessionStatus {
  STATUS_NULL = 0,
  STATUS_INVITE_SENT = 1,
  STATUS_1XX_RECEIVED = 2,
  STATUS_INVITE_RECEIVED = 3,
  STATUS_WAITING_FOR_ANSWER = 4,
  STATUS_ANSWERED = 5,
  STATUS_WAITING_FOR_ACK = 6,
  STATUS_CANCELED = 7,
  STATUS_TERMINATED = 8,
  STATUS_CONFIRMED = 9
}
