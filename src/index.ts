// main.ts
import * as frida from "frida"
import { readFileSync } from "fs"
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
import { createDispositionToStr } from "./ntdll/CreateDisposition"
import { ntStatusToStr } from "./ntdll/NtStatus"
import { desiredAccessToStr } from "./ntdll/DesiredAccess"
import { getExtension } from "./shared/utils"
import { ntCreateFileIoStatusInformationToStr } from "./ntdll/NtCreateFileIoStatus"

const TARGET = "C:\\programs\\Notepad++\\notepad++.exe"

// TODO: Move it to OOP
const handleNtCreateFile = (event: NtCreateFileEvent) => {
    const ext = getExtension(event.path)
    if (!["bat", "cmd", "vbs", "js", "exe", "msi", "ps1"].includes(ext)) return

    console.log("[NtCreateFile]")
    console.log(`\tPath: ${event.path}`)
    console.log(`\tCreateDisposition: ${createDispositionToStr(event.createDisposition)}`)
    console.log(
        `\tIoStatusBlock.Information: ${ntCreateFileIoStatusInformationToStr(event.ioStatusBlockInformation)}`,
    )
    console.log(`\tDesiredAccess: ${desiredAccessToStr(event.desiredAccess)}`)
    console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
    console.log()
}

const handleNtOpenFile = (event: NtOpenFileEvent) => {
    console.log("[NtOpenFile]")
    console.log(`\tPath: ${event.path}`)
    console.log(
        `\tIoStatusBlock.Information: ${ntCreateFileIoStatusInformationToStr(event.ioStatusBlockInformation)}`,
    )
    console.log(`\tDesiredAccess: ${desiredAccessToStr(event.desiredAccess)}`)
    console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
    console.log()
}

const handleNtCreateUserProcess = (event: NtCreateUserProcessEvent) => {
    console.log("[NtCreateUserProcess]")
    console.log(`\tImage path: ${event.imagePath}`)
    console.log(`\tCommand line: ${event.commandLine}`)
    console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
    console.log()
}

const handleNtQueryAttributesFile = (event: NtQueryAttributesFileEvent) => {
    console.log("[NtQueryAttributesFile]")
    console.log(`\tPath: ${event.path}`)
    console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
    console.log()
}

const handleNtQueryFullAttributesFile = (event: NtQueryFullAttributesFileEvent) => {
    console.log("[NtQueryFullAttributesFile]")
    console.log(`\tPath: ${event.path}`)
    console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
    console.log()
}

const handleNtDeleteFile = (event: NtDeleteFileEvent) => {
    console.log("[NtDeleteFile]")
    console.log(`\tPath: ${event.path}`)
    console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
    console.log()
}

const handleRtlSetCurrentDirectory_U = (event: RtlSetCurrentDirectory_UEvent) => {
    console.log("[RtlSetCurrentDirectory_U]")
    console.log(`\tPath: ${event.path}`)
    console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
    console.log()
}

const handleLdrLoadDll = (event: LdrLoadDllEvent) => {
    console.log("[LdrLoadDll]")
    console.log(`\tDllPath: ${event.dllPath}`)
    console.log(`\tDllName: ${event.dllName}`)
    console.log(`\tStatus: ${ntStatusToStr(event.status)}`)
    console.log()
}

export const main = async () => {
    // Read agent script compiled by frida-compile
    const source = readFileSync("agent.js", "utf8")

    const device = await frida.getLocalDevice()
    const pid = await device.spawn(TARGET) // suspended
    console.log(`[*] Spawned ${TARGET} (pid ${pid})`)

    const session = await device.attach(pid)
    const script = await session.createScript(source)

    script.message.connect(msg => {
        if (msg.type === "error") {
            console.error("[!] Agent error:", msg.stack)
            return
        }

        const event = msg.payload as NtEvent

        switch (event.fn) {
            case "NtCreateFile":
                handleNtCreateFile(event)
                break
            case "NtOpenFile":
                handleNtOpenFile(event)
                break
            case "NtCreateUserProcess":
                handleNtCreateUserProcess(event)
                break
            case "NtQueryAttributesFile":
                handleNtQueryAttributesFile(event)
                break
            case "NtQueryFullAttributesFile":
                handleNtQueryFullAttributesFile(event)
                break
            case "NtDeleteFile":
                handleNtDeleteFile(event)
                break
            case "RtlSetCurrentDirectory_U":
                handleRtlSetCurrentDirectory_U(event)
                break
            case "LdrLoadDll":
                handleLdrLoadDll(event)
                break
        }
    })

    await script.load() // hook installed while frozen
    await device.resume(pid)
    console.log("[*] Running [Ctrl+C to exit]")
    console.log()

    process.on("SIGINT", async () => {
        await session.detach()
        process.exit(0)
    })
}
