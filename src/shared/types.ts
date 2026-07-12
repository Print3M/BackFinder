export type NtBaseEvent = {
    fn: "UNKNOWN"
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

export type NtEvent = NtBaseEvent | NtCreateFileEvent | NtOpenFileEvent | NtCreateUserProcessEvent
