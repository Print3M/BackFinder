// Docs:
// https://learn.microsoft.com/en-us/windows/win32/api/winternl/nf-winternl-ntcreatefile
export const CreateDisposition = {
    FILE_SUPERSEDE: 0,
    FILE_OPEN: 1,
    FILE_CREATE: 2,
    FILE_OPEN_IF: 3,
    FILE_OVERWRITE: 4,
    FILE_OVERWRITE_IF: 5,
} as const

export type CreateDispositionValue = (typeof CreateDisposition)[keyof typeof CreateDisposition]

const DISPOSITION_NAMES: Record<number, string> = Object.fromEntries(
    Object.entries(CreateDisposition).map(([name, value]) => [value, name]),
)

export function createDispositionToStr(value: number): string {
    const name = DISPOSITION_NAMES[value]

    return name ?? `UNKNOWN(0x${(value >>> 0).toString(16)})`
}
