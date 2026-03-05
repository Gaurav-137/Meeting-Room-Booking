import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

function servePublicIndex() {
    return {
        name: "serve-public-index",
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url === "/" || req.url === "/index.html") {
                    const filePath = path.resolve("public/index.html");
                    let html = fs.readFileSync(filePath, "utf-8");
                    server.transformIndexHtml(req.url, html).then((transformed) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "text/html");
                        res.end(transformed);
                    });
                    return;
                }
                next();
            });
        },
    };
}

export default defineConfig({
    plugins: [servePublicIndex(), react()],
});
