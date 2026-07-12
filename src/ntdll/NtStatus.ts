// Docs:
// https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-erref/596a1078-e883-4972-9bbc-49e60bebca55
export const NtStatus = {
    STATUS_SUCCESS: 0x00000000,
    STATUS_PENDING: 0x00000103,
    STATUS_BUFFER_OVERFLOW: 0x80000005,
    STATUS_NO_MORE_FILES: 0x80000006,
    STATUS_UNSUCCESSFUL: 0xc0000001,
    STATUS_NOT_IMPLEMENTED: 0xc0000002,
    STATUS_INVALID_PARAMETER: 0xc000000d,
    STATUS_NO_SUCH_FILE: 0xc000000f,
    STATUS_END_OF_FILE: 0xc0000011,
    STATUS_ACCESS_DENIED: 0xc0000022,
    STATUS_OBJECT_NAME_INVALID: 0xc0000033,
    STATUS_OBJECT_NAME_NOT_FOUND: 0xc0000034,
    STATUS_OBJECT_NAME_COLLISION: 0xc0000035,
    STATUS_OBJECT_PATH_NOT_FOUND: 0xc000003a,
    STATUS_SHARING_VIOLATION: 0xc0000043,
    STATUS_FILE_LOCK_CONFLICT: 0xc0000054,
    STATUS_DELETE_PENDING: 0xc0000056,
    STATUS_PRIVILEGE_NOT_HELD: 0xc0000061,
    STATUS_FILE_IS_A_DIRECTORY: 0xc00000ba,
    STATUS_NOT_A_DIRECTORY: 0xc0000103,
} as const

export type NtStatusValue = (typeof NtStatus)[keyof typeof NtStatus]

const NTSTATUS_NAMES: Record<number, string> = Object.fromEntries(
    Object.entries(NtStatus).map(([name, value]) => [value >>> 0, name]),
)

export function ntStatusToStr(value: number): string {
    const name = NTSTATUS_NAMES[value >>> 0]

    return name ?? `UNKNOWN(0x${(value >>> 0).toString(16).padStart(8, "0")})`
}
