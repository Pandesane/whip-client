
//  %Livekitex.Room{
//      name: "pande-room",
//      sid: "RM_CqbpG52rkrsg",
//      empty_timeout: 300,
//      departure_timeout: 20,
//      max_participants: 0,
//      creation_time: 1786470057,
//      turn_password: "IfWZsmslLLiqJQCkVp2EwYmraiyqiSSBPem08CF765N",
//      enabled_codecs: [
//        %{mime: "audio/PCMU", fmtp_line: ""},
//        %{mime: "audio/PCMA", fmtp_line: ""},
//        %{mime: "audio/opus", fmtp_line: ""},
//        %{mime: "audio/red", fmtp_line: ""},
//        %{mime: "video/VP8", fmtp_line: ""},
//        %{mime: "video/H264", fmtp_line: ""},
//        %{mime: "video/VP9", fmtp_line: ""},
//        %{mime: "video/AV1", fmtp_line: ""},
//        %{mime: "video/H265", fmtp_line: ""},
//        %{mime: "video/rtx", fmtp_line: ""}
//      ],
//      metadata: "",
//      num_participants: 0,
//      num_publishers: 0,
//      active_recording: false,
//      version: nil
//    }

export interface IRoom {
  name: string
}