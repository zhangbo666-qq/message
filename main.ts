import { join } from "node:path"

Deno.serve(async (request: Request): Promise<Response> => {
    const { pathname } = new URL(request.url)
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