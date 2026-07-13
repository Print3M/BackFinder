export type NtBaseEvent = {
    fn: "UNKNOWN"
    status: number
}

export type NtCreateFileEvent = {
    fn: "NtCreateFile"
    path: string
    desiredAccess: number
    createDisposition: number
    ioStatusBlockInformation: number
    status: number
}

export type NtOpenFileEvent = {
    fn: "NtOpenFile"
    path: string
    desiredAccess: number
    ioStatusBlockInformation: number
    status: number
}

export type NtCreateUserProcessEvent = {
    fn: "NtCreateUserProcess"
    imagePath: string
    commandLine: string
    status: number
}

export type NtQueryAttributesFileEvent = {
    fn: "NtQueryAttributesFile"
    path: string
    status: number
}

export type NtQueryFullAttributesFileEvent = {
    fn: "NtQueryFullAttributesFile"
    path: string
    status: number
}

export type NtDeleteFileEvent = {
    fn: "NtDeleteFile"
    path: string
    status: number
}

export type RtlSetCurrentDirectory_UEvent = {
    fn: "RtlSetCurrentDirectory_U"
    path: string
    status: number
}

export type LdrLoadDllEvent = {
    fn: "LdrLoadDll"
    dllPath: string
    dllName: string
    status: number
}

export type NtEvent =
    | NtBaseEvent
    | NtCreateFileEvent
    | NtOpenFileEvent
    | NtCreateUserProcessEvent
    | NtQueryAttributesFileEvent
    | NtQueryFullAttributesFileEvent
    | NtDeleteFileEvent
    | RtlSetCurrentDirectory_UEvent
    | LdrLoadDllEvent
