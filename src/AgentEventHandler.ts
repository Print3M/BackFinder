import { createDispositionToStr } from "./ntdll/CreateDisposition"
import { desiredAccessToStr } from "./ntdll/DesiredAccess"
import { ntCreateFileIoStatusInformationToStr } from "./ntdll/NtCreateFileIoStatus"
import { ntStatusToStr } from "./ntdll/NtStatus"
import type {
    LdrLoadDllEvent,
    NtCreateFileEvent,
    NtCreateUserProcessEvent,
    NtDeleteFileEvent,
    NtEvent,
    NtOpenFileEvent,
    NtQueryAttributesFileEvent,
    NtQueryFullAttributesFileEvent,
    RtlSetCurrentDirectory_UEvent,
} from "./shared/types"
import { getExtension, isDirWritable, isFileOrDir, isFileWritable } from "./shared/utils"

type Config = {
    allowedExtensions?: string[]
    outputType: "raw" | "csv"
}

class AgentEventHandler {
    #event: NtEvent
    #config: Config

    constructor(event: NtEvent, config: Config) {
        this.#event = event
        this.#config = config
    }

    async Run() {
        switch (this.#event.fn) {
            case "NtCreateFile":
                await this.#ntCreateFile(this.#event)
                break
            case "NtOpenFile":
                await this.#ntOpenFile(this.#event)
                break
            case "NtCreateUserProcess":
                await this.#ntCreateUserProcess(this.#event)
                break
            case "NtQueryAttributesFile":
                await this.#ntQueryAttributesFile(this.#event)
                break
            case "NtQueryFullAttributesFile":
                await this.#ntQueryFullAttributesFile(this.#event)
                break
            case "NtDeleteFile":
                await this.#ntDeleteFile(this.#event)
                break
            case "RtlSetCurrentDirectory_U":
                await this.#rtlSetCurrentDirectory_U(this.#event)
                break
            case "LdrLoadDll":
                await this.#ldrLoadDll(this.#event)
                break
        }
    }

    async #ntCreateFile(event: NtCreateFileEvent) {
        const path = this.#sanitizePath(event.path)

        if (this.#isPathFiltered(path)) return

        console.log("[NtCreateFile]")
        console.log(`\tPath: ${path}`)
        console.log(`\tCreateDisposition: ${createDispositionToStr(event.createDisposition)}`)
        console.log(
            `\tIoStatusBlock.Information: ${ntCreateFileIoStatusInformationToStr(event.ioStatusBlockInformation)}`,
        )
        console.log(`\tDesiredAccess: ${desiredAccessToStr(event.desiredAccess)}`)
        console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
        await this.#checkACL(path)
        console.log()
    }

    async #ntOpenFile(event: NtOpenFileEvent) {
        const path = this.#sanitizePath(event.path)

        if (this.#isPathFiltered(path)) return

        console.log("[NtOpenFile]")
        console.log(`\tPath: ${path}`)
        console.log(
            `\tIoStatusBlock.Information: ${ntCreateFileIoStatusInformationToStr(event.ioStatusBlockInformation)}`,
        )
        console.log(`\tDesiredAccess: ${desiredAccessToStr(event.desiredAccess)}`)
        console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
        await this.#checkACL(path)
        console.log()
    }

    async #ntCreateUserProcess(event: NtCreateUserProcessEvent) {
        const imagePath = this.#sanitizePath(event.imagePath)

        if (this.#isPathFiltered(imagePath)) return

        console.log("[NtCreateUserProcess]")
        console.log(`\tImage path: ${imagePath}`)
        console.log(`\tCommand line: ${event.commandLine}`)
        console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
        await this.#checkACL(imagePath)
        console.log()
    }

    async #ntQueryAttributesFile(event: NtQueryAttributesFileEvent) {
        const path = this.#sanitizePath(event.path)

        if (this.#isPathFiltered(path)) return

        console.log("[NtQueryAttributesFile]")
        console.log(`\tPath: ${path}`)
        console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
        await this.#checkACL(path)
        console.log()
    }

    async #ntQueryFullAttributesFile(event: NtQueryFullAttributesFileEvent) {
        const path = this.#sanitizePath(event.path)

        if (this.#isPathFiltered(path)) return

        console.log("[NtQueryFullAttributesFile]")
        console.log(`\tPath: ${path}`)
        console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
        await this.#checkACL(path)
        console.log()
    }

    async #ntDeleteFile(event: NtDeleteFileEvent) {
        const path = this.#sanitizePath(event.path)

        if (this.#isPathFiltered(path)) return

        console.log("[NtDeleteFile]")
        console.log(`\tPath: ${path}`)
        console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
        await this.#checkACL(path)
        console.log()
    }

    async #rtlSetCurrentDirectory_U(event: RtlSetCurrentDirectory_UEvent) {
        const path = this.#sanitizePath(event.path)

        if (this.#isPathFiltered(path)) return

        console.log("[RtlSetCurrentDirectory_U]")
        console.log(`\tPath: ${path}`)
        console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
        await this.#checkACL(path)
        console.log()
    }

    async #ldrLoadDll(event: LdrLoadDllEvent) {
        const dllPath = this.#sanitizePath(event.dllPath)
        const dllName = this.#sanitizePath(event.dllName)

        if (this.#isPathFiltered(dllName)) return

        console.log("[LdrLoadDll]")
        console.log(`\tDllPath: ${dllPath}`)
        console.log(`\tDllName: ${dllName}`)
        console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
        await this.#checkACL(dllPath)
        console.log()
    }

    #isPathFiltered(path: string) {
        const ext = getExtension(path)

        const { allowedExtensions } = this.#config
        if (!allowedExtensions) return

        return !allowedExtensions.includes(ext)
    }

    #sanitizePath(path: string) {
        let sanitized = path.trim()
        if (path.startsWith("\\??\\")) {
            sanitized = path.substring(4)
        }

        return sanitized
    }

    async #checkACL(path: string) {
        const what = await isFileOrDir(path)

        console.log(`\tACL check [${path}]`)

        switch (what) {
            case "dir": {
                const isWritable = await isDirWritable(path)
                console.log("\t\tObject type: DIRECTORY")
                console.log(`\t\tIs writable: ${isWritable}`)
                break
            }
            case "file": {
                const isWritable = await isFileWritable(path)
                console.log("\t\tObject type: FILE")
                console.log(`\t\tIs writable: ${isWritable}`)
                break
            }
            case "non-existing": {
                console.log("\t\tObject type: NON_EXISTING")
                console.log(`\t\tIs parent dir writable: TODO`)
                break
            }
            case "unknown": {
                console.log("\t\tType: UNKNOWN")
                break
            }
        }
    }
}

export default AgentEventHandler
