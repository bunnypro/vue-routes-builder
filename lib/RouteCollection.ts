import { Component, Dictionary, RouteConfig } from "vue-router/types/router";
import { RouteBuilderConfig, Route, RouteGuard } from "./Route";
import { tap } from "./util";

export interface RouteCollectionConfig {
    base?: string;
    children?: boolean;
}

export interface RouteGroupConfig {
    prefix: string;
    guards?: RouteGuard[];
}

export class RouteCollection {
    private readonly base: string;
    private readonly children: boolean;
    private readonly routes: Route[] = [];

    constructor(
        { base = "/", children = false }: RouteCollectionConfig = {
            base: "/",
            children: false,
        },
    ) {
        this.base = this.resolveBasePath(base);
        this.children = children;
    }

    add(
        path: string,
        view?: Component,
        views?: Dictionary<Component>,
        config: RouteBuilderConfig = {},
    ): Route {
        return tap(
            new Route(this.resolveRoutePath(path), view, views, config),
            Array.prototype.push.bind(this.routes),
        );
    }

    group(
        { prefix, guards = [] }: RouteGroupConfig,
        fn: (routes: RouteCollection) => void,
    ) {
        this.routes.push(
            ...tap(
                new RouteCollection({
                    base: this.resolveRoutePath(prefix),
                    children: this.children,
                }),
                fn,
            ).routes.map(route => tap(route, r => r.guard(...guards))),
        );
    }

    private resolveBasePath(path: string): string {
        const rPath = `/${path}`.replace(/\/+/g, "/");

        return rPath === "/" ? rPath : rPath.replace(/\/+$/g, "");
    }

    private resolveRoutePath(path: string): string {
        const rPath = `${this.base}/${path}`.replace(/\/+/g, "/");

        if (rPath === "/") {
            return rPath;
        }

        return this.children ? rPath.replace(/^\/+/g, "") : rPath;
    }

    get count(): number {
        return this.routes.length;
    }

    build(): RouteConfig[] {
        return this.routes.map(route => route.build());
    }
}
