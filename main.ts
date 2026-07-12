import { main } from "./src"

main().catch(err => {
    console.error("[!] fatal:", err)
    process.exit(1)
})
