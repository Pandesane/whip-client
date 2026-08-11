// import type { SvelteMap } from "svelte/reactivity"

export type CallType = "video" | "audio"

export type VoidCallBack = () => void


export type ChatCallBack = (data: any) => void
export type FilePickerCallBack = (file: File) => void
export type AsteriskMediaCallBack = (stream: MediaStream) => void



export type FileUploadType = "image" | "video" | "audio"

export type ChatFileUploadCallBack = (message_uuid?: string) => void

export type FormValidation = {
  errors: Map<string, string>;
  successful: Map<string, string>;
  numberOfFields?: number;
  success: boolean
}


export type FileUploadStatus = "start" | "progress" | "finished" |"present";