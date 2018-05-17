import { Component, Dictionary, RouteConfig } from "vue-router/types/router";
import { RouteBuilderConfig, Route } from "./Route";

export interface RouteCollectionConfig {
    base?: string;
    children?: boolean;
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
    ) {
        this.routes.push(
            new Route(this.resolveRoutePath(path), view, views, config),
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
