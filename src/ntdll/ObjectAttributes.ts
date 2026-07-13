// Docs:
// https://learn.microsoft.com/en-us/windows/win32/api/ntdef/ns-ntdef-_object_attributes
import { readUnicodeString } from "../shared/strings"

export type ObjectAttributes = {
    objectName: string
}

const FIELDS_OFFSET = {
    ObjectName: 0x10,
} as const

export const readObjectAttributes = (ptr: NativePointer): ObjectAttributes => {
    return {
        objectName: readUnicodeString(ptr.add(FIELDS_OFFSET.ObjectName).readPointer()),
    }
}
