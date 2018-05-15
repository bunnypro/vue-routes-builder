import { Component, RouteConfig, Dictionary } from "vue-router/types/router";
import { RouteBuilderConfig, SingleViewRoute, RouteBuilder, NamedViewRoute } from "./RouteBuilder";
import { tap } from './util';

export class RouteCollection {
    root: string;
    routes: RouteBuilder[] = [];

    constructor(root: string = '/') {
        this.root = this.resolvePath(root);
    }

    guard(): void {

    }

    add(path: string, component: Component, config: RouteBuilderConfig = {}): RouteBuilder {
        return tap(new SingleViewRoute(this.resolveFromRootPath(path), component, config), this.routes.push.bind(this.routes));
    }

    addNamed(path: string, components: Dictionary<Component>, config: RouteBuilderConfig = {}): RouteBuilder {
        return tap(new NamedViewRoute(this.resolveFromRootPath(path), components, config), this.routes.push.bind(this.routes));
    }

    build(): RouteConfig[] {
        return this.routes.map(route => route.build());
    }

    get count(): number {
        return this.routes.length;
    }

    private resolveFromRootPath(path: string): string {
        return this.resolvePath(`${this.root}/${path}`);
    }

    private resolvePath(path: string): string {
        return `/${path.replace(/^\/+|\/+$/g, '')}`;
    }
}