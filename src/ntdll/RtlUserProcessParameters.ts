// Docs:
// https://learn.microsoft.com/en-us/windows/win32/api/winternl/ns-winternl-rtl_user_process_parameters
import { readUnicodeString } from "../shared/unicode"

export type RtlUserProcessParameters = {
    imagePathName: string
    commandLine: string
}

const FIELDS_OFFSET = {
    ImagePathName: 0x060,
    CommandLine: 0x070,
} as const

export const readRtlUserProcessParameters = (ptr: NativePointer): RtlUserProcessParameters => {
    return {
        imagePathName: readUnicodeString(ptr.add(FIELDS_OFFSET.ImagePathName)),
        commandLine: readUnicodeString(ptr.add(FIELDS_OFFSET.CommandLine)),
    }
}
