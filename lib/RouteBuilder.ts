import { RedirectOption } from "vue-router";
import { RoutePropsFunction, PathToRegexpOptions, Component, RouteConfig, Dictionary } from "vue-router/types/router";
import { RouteCollection } from "./RouteCollection";
import { RouteGuard } from './RouteGuard';

export interface RouteBuilderConfig {
    name?: string;
    redirect?: RedirectOption;
    alias?: string | string[];
    meta?: any;
    props?: boolean | Object | RoutePropsFunction;
    caseSensitive?: boolean;
    pathToRegexpOptions?: PathToRegexpOptions;
}

export abstract class RouteBuilder {
    protected path: string;
    protected config: RouteBuilderConfig;
    protected childs: RouteCollection;
    protected guards: RouteGuard[] = [];

    constructor(path: string, config: RouteBuilderConfig = {}) {
        this.childs = new RouteCollection(path);
        this.path = path;
        this.config = config;
    }

    guard(guard: RouteGuard): RouteBuilder {
        this.guards.push(guard);

        return this;
    }

    children(fn: (routes: RouteCollection) => void): void {
        fn(this.childs);
    }

    build(): RouteConfig {
        let route: RouteConfig = {
            ...this.config,
            path: this.path,
        };

        if (this.childs.count > 0) {
            route.children = this.childs.build();
        }

        if (this.guards.length > 0) {
            route.beforeEnter = (to, from, next) => {
                this.guards.every(guard => {
                    const nextStep = guard.handle(to, from);

                    if (nextStep !== true) {
                        next(nextStep);
                        return false;
                    }
                });
            };
        }

        return route;
    }
}

export class SingleViewRoute extends RouteBuilder {
    view: Component;

    constructor(path: string, view: Component, config: RouteBuilderConfig = {}) {
        super(path, config);
        this.view = view;
    }

    build(): RouteConfig {
        return {
            ...super.build(),
            component: this.view,
        };
    }
}

export class NamedViewRoute extends RouteBuilder {
    views: Dictionary<Component>;

    constructor(path: string, views: Dictionary<Component>, config: RouteBuilderConfig = {}) {
        super(path, config);
        this.views = views;
    }

    build(): RouteConfig {
        return {
            ...super.build(),
            components: this.views,
        };
    }
}