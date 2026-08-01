import type { Stats } from "node:fs"
import { access, constants, stat, open, unlink } from "node:fs/promises"
import { join } from "node:path"

export const getExtension = (path: string) => {
    const parts = path.split(".")
    if (parts.length <= 1) return ""

    return parts[parts.length - 1]!.toLowerCase()
}

export const toHex = (v: number) => {
    return "0x" + v.toString(16)
}

export const isFileOrDir = async (
    path: string,
): Promise<"file" | "dir" | "non-existing" | "unknown"> => {
    if (path.startsWith("\\")) return "unknown"

    let out: Stats

    try {
        out = await stat(path)
    } catch {
        return "non-existing"
    }

    if (out.isFile()) return "file"
    if (out.isDirectory()) return "dir"

    return "unknown"
}

export const isFileWritable = async (path: string): Promise<boolean> => {
    let handle

    try {
        handle = await open(path, "r+")

        return true
    } catch (err) {
        // File is writable but currently locked by another process
        return (err as NodeJS.ErrnoException).code === "EBUSY"
    } finally {
        await handle?.close().catch(() => {})
    }
}

export const isDirWritable = async (path: string): Promise<boolean> => {
    let probe

    try {
        if (!(await stat(path)).isDirectory()) return false

        probe = join(path, `test-${crypto.randomUUID()}.tmp`)

        await (await open(probe, "wx")).close()
 
        return true
    } catch (err) {
        return (err as NodeJS.ErrnoException).code === "EBUSY"
    } finally {
        if (probe) await unlink(probe).catch(() => {})
    }
}
