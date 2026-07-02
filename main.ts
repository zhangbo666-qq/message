import { join } from "node:path"

Deno.serve(async (request: Request): Promise<Response> => {
    const { origin, pathname } = new URL(request.url)

    if (pathname === "/favicon.ico") {
        const filePath = join(Deno.cwd(), "res/favicon.ico")
        const icon = await Deno.readFile(filePath)
        return new Response(icon, {
            status: 200,
            headers: {
                "Content-Type": "image/x-icon",
            }
        })
    }

    if (pathname === "/") {
        const files = Deno.readDirSync(join(Deno.cwd(), "files"))
            .filter(dirEntry => dirEntry.isFile && dirEntry.name.endsWith(".json"))
            .map(dirEntry => `${origin}/files/${dirEntry.name}`)
            .toArray()
        return new Response(JSON.stringify(files), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            }
        })
    }

    if (!/\/files\/.+.json/.test(pathname)) {
        return new Response("不是有效的文件路径", { status: 403 })
    }

    const filePath = join(Deno.cwd(), decodeURIComponent(pathname))
    try {
        const fileContent = await Deno.readTextFile(filePath)
        return new Response(fileContent, {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            }
        })
    }
    catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            return new Response("File not found", { status: 404 })
        } else {
            return new Response("Internal Server Error", { status: 500 })
        }
    }
})