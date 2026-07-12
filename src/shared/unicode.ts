export type UnicodeString = {
    length: number
    maximumLength: number
    buffer: NativePointer
}

export const readUnicodeString = (ptr: NativePointer): string => {
    const unicode = {
        length: ptr.readU16(),
        maximumLength: ptr.add(0x02).readU16(),
        // 4 bytes padding after MaximumLength
        buffer: ptr.add(0x08).readPointer(),
    }

    return unicodeStringToStr(unicode)
}

export const unicodeStringToStr = (str: UnicodeString): string => {
    if (str.buffer.isNull() || str.length === 0) return ""

    return str.buffer.readUtf16String(str.length / 2) ?? "<unreadable>"
}
