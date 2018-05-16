import { Component, RouteConfig, Dictionary } from "vue-router/types/router";
import { RouteBuilderConfig, RouteBuilder, SingleViewRoute, NamedViewRoute } from "./RouteBuilder";
import { tap } from './util';
import { RouteGuard } from "./RouteGuard";

export interface RouteCollectionConfig {
    root?: string;
    children?: boolean;
}

export class RouteCollection {
    private readonly root: string;
    private routes: RouteBuilder[] = [];
    private guards: RouteGuard[] = [];
    private readonly children: boolean;

    constructor({ root = '/', children = false }: RouteCollectionConfig = { root: '/', children: false }) {
        this.root = this.resolveRootPath(root);
        this.children = children;
    }

    guard(...guards: RouteGuard[]): void {
        this.guards.concat(...tap(guards, guards => {
            this.routes.forEach(route => {
                route.guard(...guards);
            });
        }));
    }

    group(prefix: string, fn: (routes: RouteCollection) => void): void {
        tap(new RouteCollection({ root: this.resolveFromRootPath(prefix), children: this.children }), fn, router => {
            this.routes.push(...router.routes);
        });
    }

    add(path: string, component: Component, config: RouteBuilderConfig = {}): RouteBuilder {
        return tap(
            new SingleViewRoute(this.resolveFromRootPath(path), component, config),
            this.routes.push.bind(this.routes)
        ).guard(...this.guards);
    }

    addNamed(path: string, components: Dictionary<Component>, config: RouteBuilderConfig = {}): RouteBuilder {
        return tap(
            new NamedViewRoute(this.resolveFromRootPath(path), components, config),
            this.routes.push.bind(this.routes)
        ).guard(...this.guards);
    }

    build(): RouteConfig[] {
        return this.routes.map(route => route.build());
    }

    get count(): number {
        return this.routes.length;
    }

    private resolveFromRootPath(path: string): string {
        let fPath = this.clearPath(`/${path}`);

        if (this.children) {
            return [fPath, this.root].every(p => p === '/') ? '/' : `${this.root}${fPath}`.replace(/^\/+|\/+$/g, '');
        }

        if (fPath === '/') {
            return this.root;
        }

        return `${this.root}${fPath}`.replace(/\/+/g, '/');
    }

    private resolveRootPath(path: string): string {
        return this.clearPath(`/${path}`);
    }

    private clearPath(path: string): string {
        let fPath = path.replace(/\/+/g, '/');

        return fPath === '/' ? fPath : fPath.replace(/\/+$/g, '');
    }
}
