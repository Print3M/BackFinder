import { readIoStatusBlock } from "../ntdll/NtCreateFileIoStatus"
import { readObjectAttributes } from "../ntdll/ObjectAttributes"
import { readRtlUserProcessParameters } from "../ntdll/RtlUserProcessParameters"
import type {
    LdrLoadDllEvent,
    NtCreateFileEvent,
    NtCreateUserProcessEvent,
    NtDeleteFileEvent,
    NtOpenFileEvent,
    NtQueryAttributesFileEvent,
    NtQueryFullAttributesFileEvent,
    RtlSetCurrentDirectory_UEvent,
} from "../shared/types"
import { readUnicodeString, readWString } from "../shared/strings"

const NTDLL = Process.getModuleByName("ntdll.dll")

type AttachCtx<TEnter, TSend> = {
    fn: string
    onEnter: (args: InvocationArguments) => TEnter
    onLeave: (data: TEnter, retval: InvocationReturnValue) => TSend
}

const attach = <TEnter, TSend>(ctx: AttachCtx<TEnter, TSend>) => {
    const pFunc = NTDLL.getExportByName(ctx.fn)

    Interceptor.attach(pFunc, {
        onEnter(args) {
            const data = ctx.onEnter(args)
            Object.assign(this, data)
        },
        onLeave(retval) {
            const data = ctx.onLeave(this as TEnter, retval)
            send(data)
        },
    })

    console.log(`[agent] ${ctx.fn} hooked in pid ` + Process.id)
}

attach({
    fn: "NtCreateFile",
    onEnter(args) {
        return {
            desiredAccess: args[1]!.toUInt32(),
            path: readObjectAttributes(args[2]!).objectName,
            pIoStatus: args[3]!,
            objectAttributes: args[2]!.toUInt32(),
            createDisposition: args[7]!.toUInt32(),
        }
    },
    onLeave(data, retval) {
        const { information } = readIoStatusBlock(data.pIoStatus)
        const status = retval.toUInt32() >>> 0

        return {
            fn: "NtCreateFile",
            path: data.path,
            desiredAccess: data.desiredAccess,
            createDisposition: data.createDisposition,
            ioStatusBlockInformation: information,
            status,
        } satisfies NtCreateFileEvent
    },
})

attach({
    fn: "NtOpenFile",
    onEnter(args) {
        return {
            desiredAccess: args[1]!.toUInt32(),
            path: readObjectAttributes(args[2]!).objectName,
            pIoStatus: args[3]!,
        }
    },
    onLeave(data, retval) {
        const { information } = readIoStatusBlock(data.pIoStatus)
        const status = retval.toUInt32() >>> 0

        return {
            fn: "NtOpenFile",
            path: data.path,
            desiredAccess: data.desiredAccess,
            ioStatusBlockInformation: information,
            status,
        } satisfies NtOpenFileEvent
    },
})

attach({
    fn: "NtCreateUserProcess",
    onEnter(args) {
        const rtlUserProcessParameters = readRtlUserProcessParameters(args[8]!)

        return {
            imagePath: rtlUserProcessParameters.imagePathName,
            commandLine: rtlUserProcessParameters.commandLine,
        }
    },
    onLeave(data, retval) {
        const status = retval.toUInt32() >>> 0

        return {
            fn: "NtCreateUserProcess",
            status,
            imagePath: data.imagePath,
            commandLine: data.commandLine,
        } satisfies NtCreateUserProcessEvent
    },
})

attach({
    fn: "NtQueryAttributesFile",
    onEnter(args) {
        return {
            path: readObjectAttributes(args[0]!).objectName,
        }
    },
    onLeave(data, retval) {
        const status = retval.toUInt32() >>> 0

        return {
            fn: "NtQueryAttributesFile",
            path: data.path,
            status,
        } satisfies NtQueryAttributesFileEvent
    },
})

attach({
    fn: "NtQueryFullAttributesFile",
    onEnter(args) {
        return {
            path: readObjectAttributes(args[0]!).objectName,
        }
    },
    onLeave(data, retval) {
        const status = retval.toUInt32() >>> 0

        return {
            fn: "NtQueryFullAttributesFile",
            path: data.path,
            status,
        } satisfies NtQueryFullAttributesFileEvent
    },
})

attach({
    fn: "NtDeleteFile",
    onEnter(args) {
        return {
            path: readObjectAttributes(args[0]!).objectName,
        }
    },
    onLeave(data, retval) {
        const status = retval.toUInt32() >>> 0

        return {
            fn: "NtDeleteFile",
            path: data.path,
            status,
        } satisfies NtDeleteFileEvent
    },
})

attach({
    fn: "RtlSetCurrentDirectory_U",
    onEnter(args) {
        return {
            path: readUnicodeString(args[0]!),
        }
    },
    onLeave(data, retval) {
        const status = retval.toUInt32() >>> 0

        return {
            fn: "RtlSetCurrentDirectory_U",
            path: data.path,
            status,
        } satisfies RtlSetCurrentDirectory_UEvent
    },
})

attach({
    fn: "LdrLoadDll",
    onEnter(args) {
        return {
            dllPath: readWString(args[0]!),
            dllName: readUnicodeString(args[2]!)
        }
    },
    onLeave(data, retval) {
        const status = retval.toUInt32() >>> 0

        return {
            fn: "LdrLoadDll",
            dllPath: data.dllPath,
            dllName: data.dllName,
            status,
        } satisfies LdrLoadDllEvent
    },
})
