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
    protected config: RouteConfig;
    protected childrenRoutes: RouteCollection;
    protected guards: RouteGuard[] = [];

    protected constructor(config: RouteConfig) {
        this.config = config;
        this.childrenRoutes = new RouteCollection({ children: true });
    }

    guard(...guards: RouteGuard[]): RouteBuilder {
        this.guards.push(...guards);
        return this;
    }

    children(fn: (routes: RouteCollection) => void): void {
        fn(this.childrenRoutes);
    }

    build(): RouteConfig {
        let config = { ...this.config };

        if (this.childrenRoutes.count > 0) {
            config.children = this.childrenRoutes.build();
        }

        if (this.guards.length > 0) {
            config.beforeEnter = (to, from, next) => {
                this.guards.every(guard => {
                    const nextStep = guard.handle(to, from);

                    if (nextStep === true || nextStep === null || nextStep === undefined) {
                        return true;
                    }

                    next(nextStep);
                    return false;
                });

                next();
            };
        }

        return config;
    }
}

export class SingleViewRoute extends RouteBuilder {
    constructor(path: string, view: Component, config: RouteBuilderConfig = {}) {
        super({ ...config, path, component: view });
    }
}

export class NamedViewRoute extends RouteBuilder {
    constructor(path: string, views: Dictionary<Component>, config: RouteBuilderConfig = {}) {
        super({ ...config, path, components: views });
    }
}