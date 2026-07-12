export const getExtension = (path: string) => {
    const parts = path.split(".")
    if (parts.length <= 1) return ""

    return parts[parts.length - 1]!.toLowerCase()
}

export const toHex = (v: number) => {
    return "0x" + v.toString(16)
}
