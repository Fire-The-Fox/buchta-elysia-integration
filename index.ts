import { Elysia } from "elysia";
import { Buchta } from "buchta";
import { basename, dirname } from "path";
import { BuchtaLogger } from "buchta/src/utils/logger";

const extraRoutes: Map<string, any> = new Map();

const earlyHook = (build: Buchta) => {
    build.on("fileLoad", (data) => {
        data.route = "/" + basename(data.path);
        const func = async (_: any) => {
            return Bun.file(data.path);
        }

        extraRoutes.set(data.route, func);
    })
}

const fixRoute = (route: string) => {
    if (!route.endsWith("/")) {
        route += "/";
    }

    return route;
}

export const buchta = (app: Elysia) => {
    const buchta = new Buchta(true);
    buchta.earlyHook = earlyHook;

    buchta.setup().then(function() {
        for (const [route, func] of extraRoutes) {
            app.get(route, func);
        }

        // @ts-ignore I forgot this.pages 💀
        for (const route of buchta.pages) {
            if (route.func) {
                app.get(fixRoute(dirname(route.route)), async (_: any) => {
                    return new Response(await route.func(dirname(route.route), fixRoute(dirname(route.route))),
                                        { headers: { "Content-Type": "text/html" } });
                });
            } else {
                if (!buchta.config?.ssr && "html" in route) {
                    app.get(fixRoute(dirname(route.route)), (ctx: any) => {
                        return new Response(route.html, { headers: { "Content-Type": "text/html" } });
                    });
                }
                if (!("html" in route)) {
                    app.get(route.route, () => Bun.file(route.path));
                    app.get(route.originalRoute, () => Bun.file(route.path));
                }
            }
        }
        const logger = BuchtaLogger(false);
        logger("Buchta is running on top of elysia!", "info");
        app.listen(buchta.config?.port ?? 3000);
    });
    return app;
}
