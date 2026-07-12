// Docs:
// https://learn.microsoft.com/en-us/dotnet/api/microsoft.build.experimental.fileaccess.desiredaccess?view=msbuild-18-netcore
export const DesiredAccess = {
    // file-specific (low 16 bits)
    FILE_READ_DATA: 0x00000001,
    FILE_WRITE_DATA: 0x00000002,
    FILE_APPEND_DATA: 0x00000004,
    FILE_READ_EA: 0x00000008,
    FILE_WRITE_EA: 0x00000010,
    FILE_EXECUTE: 0x00000020,
    FILE_DELETE_CHILD: 0x00000040,
    FILE_READ_ATTRIBUTES: 0x00000080,
    FILE_WRITE_ATTRIBUTES: 0x00000100,

    // standard rights
    DELETE: 0x00010000,
    READ_CONTROL: 0x00020000,
    WRITE_DAC: 0x00040000,
    WRITE_OWNER: 0x00080000,
    SYNCHRONIZE: 0x00100000,

    // generic
    ACCESS_SYSTEM_SECURITY: 0x01000000,
    MAXIMUM_ALLOWED: 0x02000000,
    GENERIC_ALL: 0x10000000,
    GENERIC_EXECUTE: 0x20000000,
    GENERIC_WRITE: 0x40000000,
    GENERIC_READ: 0x80000000,
} as const

export type DesiredAccessValue = (typeof DesiredAccess)[keyof typeof DesiredAccess]

export const desiredAccessToStr = (value: number) => {
    const v = value >>> 0
    if (v === 0) return []

    const flags: string[] = []
    let matched = 0

    for (const [name, bit] of Object.entries(DesiredAccess)) {
        const b = bit >>> 0
        
        // Compare both sides as unsigned to survive the 0x80000000 sign bit
        if (b !== 0 && (v & b) >>> 0 === b) {
            flags.push(name)
            matched = (matched | b) >>> 0
        }
    }

    const leftover = (v & ~matched) >>> 0
    if (leftover !== 0) {
        flags.push(`UNKNOWN(0x${leftover.toString(16)})`)
    }

    return flags
}
