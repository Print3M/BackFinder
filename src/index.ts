// main.ts
import * as frida from "frida"
import { readFileSync } from "fs"
import type { NtEvent } from "./shared/types"
import AgentEventHandler from "./AgentEventHandler"

const TARGET = "C:\\programs\\Notepad++\\notepad++.exe"

export const main = async () => {
    // Read agent script compiled by frida-compile
    const source = readFileSync("agent.js", "utf8")

    const device = await frida.getLocalDevice()
    const pid = await device.spawn(TARGET) // suspended
    console.log(`[*] Spawned ${TARGET} (pid ${pid})`)

    const session = await device.attach(pid)
    const script = await session.createScript(source)

    // Serialize handling so each message's async work (e.g. #checkACL's
    // filesystem I/O) runs to completion before the next message is processed.
    // The message emitter does not await async listeners, so without this a
    // handler that suspends on `await` lets the next message's output print
    // before the current one finishes.
    let queue = Promise.resolve()

    script.message.connect(msg => {
        queue = queue
            .then(async () => {
                if (msg.type === "error") {
                    console.error("[!] Agent error:", msg.stack)
                    return
                }

                const event = msg.payload as NtEvent
                const handler = new AgentEventHandler(event, { outputType: "raw" })

                await handler.Run()
            })
            .catch(err => {
                console.error("[!] Handler error:", err)
            })
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
