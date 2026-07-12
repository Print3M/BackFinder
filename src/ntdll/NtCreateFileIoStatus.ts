// Docs:
// https://learn.microsoft.com/en-us/windows-hardware/drivers/ddi/wdm/ns-wdm-_io_status_block
export const NtCreateFileIoStatus = {
    FILE_SUPERSEDED: 0,
    FILE_OPENED: 1,
    FILE_CREATED: 2,
    FILE_OVERWRITTEN: 3,
    FILE_EXISTS: 4,
    FILE_DOES_NOT_EXIST: 5,
} as const

export type NtCreateFileIoStatusValue =
    (typeof NtCreateFileIoStatus)[keyof typeof NtCreateFileIoStatus]

const IO_STATUS_INFORMATION_NAMES: Record<number, string> = Object.fromEntries(
    Object.entries(NtCreateFileIoStatus).map(([name, value]) => [value, name]),
)

export function ntCreateFileIoStatusInformationToStr(value: number): string {
    const name = IO_STATUS_INFORMATION_NAMES[value]

    return name ?? `UNKNOWN(${value})`
}

export const readIoStatusBlock = (ptr: NativePointer) => {
    return {
        status: ptr.readS32(),
        information: ptr.add(Process.pointerSize).readPointer().toUInt32(),
    }
}
