import { readIoStatusBlock } from "../ntdll/NtCreateFileIoStatus"
import { readObjectAttributes } from "../ntdll/ObjectAttributes"
import { readRtlUserProcessParameters } from "../ntdll/RtlUserProcessParameters"
import type { NtCreateFileEvent, NtCreateUserProcessEvent, NtOpenFileEvent } from "../shared/types"

const NTDLL = Process.getModuleByName("ntdll.dll")

const pNtCreateFile = NTDLL.getExportByName("NtCreateFile")

Interceptor.attach(pNtCreateFile, {
    onEnter(args) {
        this.desiredAccess = args[1]!.toUInt32()
        this.path = readObjectAttributes(args[2]!).objectName
        this.pIoStatus = args[3]
        this.objectAttributes = args[2]!.toUInt32()
        this.createDisposition = args[7]!.toUInt32()
    },
    onLeave(retval) {
        const { information } = readIoStatusBlock(this.pIoStatus)
        const status = retval.toUInt32() >>> 0

        const event: NtCreateFileEvent = {
            fn: "NtCreateFile",
            path: this.path,
            desiredAccess: this.desiredAccess,
            createDisposition: this.createDisposition,
            ioStatusBlockInformation: information,
            status,
        }
        send(event)
    },
})

console.log("[agent] NtCreateFile hooked in pid " + Process.id)

const pNtOpenFile = NTDLL.getExportByName("NtOpenFile")

Interceptor.attach(pNtOpenFile, {
    onEnter(args) {
        this.desiredAccess = args[1]!.toUInt32()
        this.path = readObjectAttributes(args[2]!).objectName
        this.pIoStatus = args[3]
    },
    onLeave(retval) {
        const { information } = readIoStatusBlock(this.pIoStatus)
        const status = retval.toUInt32() >>> 0

        const event: NtOpenFileEvent = {
            fn: "NtOpenFile",
            path: this.path,
            desiredAccess: this.desiredAccess,
            ioStatusBlockInformation: information,
            status,
        }
        send(event)
    },
})

console.log("[agent] NtOpenFile hooked in pid " + Process.id)

const pNtCreateUserProcess = NTDLL.getExportByName("NtCreateUserProcess")

Interceptor.attach(pNtCreateUserProcess, {
    onEnter(args) {
        const rtlUserProcessParameters = readRtlUserProcessParameters(args[8]!)

        this.imagePath = rtlUserProcessParameters.imagePathName
        this.commandLine = rtlUserProcessParameters.commandLine
    },
    onLeave(retval) {
        const status = retval.toUInt32() >>> 0

        const event: NtCreateUserProcessEvent = {
            fn: "NtCreateUserProcess",
            status,
            imagePath: this.imagePath,
            commandLine: this.commandLine,
        }
        send(event)
    },
})

console.log("[agent] NtCreateUserProccess hooked in pid " + Process.id)
