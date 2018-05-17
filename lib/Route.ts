import {
    RouteConfig,
    Component,
    Dictionary,
    RedirectOption,
    RoutePropsFunction,
    PathToRegexpOptions,
    Route as VueRoute,
    RawLocation,
} from "vue-router/types/router";
import { tap } from "./util";
import { RouteCollection } from "./RouteCollection";
import Vue from "vue";

export interface RouteBuilderConfig {
    name?: string;
    redirect?: RedirectOption;
    alias?: string | string[];
    meta?: any;
    props?: boolean | Object | RoutePropsFunction;
    caseSensitive?: boolean;
    pathToRegexpOptions?: PathToRegexpOptions;
}

export type RouteGuardHanldeResult =
    | RawLocation
    | boolean
    | ((vm: Vue) => any)
    | void;

export abstract class RouteGuard {
    abstract handle(from: VueRoute, to: VueRoute): RouteGuardHanldeResult;
}

export class Route {
    private readonly config: RouteConfig;
    private childrenRoutes: RouteCollection;
    private readonly guards: RouteGuard[] = [];

    constructor(
        path: string,
        view?: Component,
        views?: Dictionary<Component>,
        config: RouteBuilderConfig = {},
    ) {
        this.config = {
            ...config,
            path: this.resolvePath(path),
            components: this.resolveComponents(view, views),
        };
    }

    private resolvePath(path: string): string {
        const rPath = path.replace(/\/+/g, "/");

        return rPath === "/" ? rPath : rPath.replace(/\/+$/g, "");
    }

    private resolveComponents(
        view?: Component,
        views?: Dictionary<Component>,
    ): Dictionary<Component> {
        const components = { ...(views || {}) };

        if (view) {
            components.default = view;
        }

        return components;
    }

    guard(...guards: RouteGuard[]): void {
        this.guards.push(...guards);
    }

    children(fn: (routes: RouteCollection) => void): void {
        this.childrenRoutes = tap(new RouteCollection({ children: true }), fn);
    }

    build(): RouteConfig {
        return tap({ ...this.config }, config => {
            if (this.childrenRoutes && this.childrenRoutes.count) {
                config.children = this.childrenRoutes.build();
            }

            if (this.guards.length > 0) {
                config.beforeEnter = (to, from, next) => {
                    const guardPassed = this.guards.every(guard => {
                        const nextStep = guard.handle(to, from);

                        if (
                            nextStep === true ||
                            nextStep === undefined ||
                            nextStep === null
                        ) {
                            return true;
                        }

                        next(nextStep);
                        return false;
                    });

                    if (guardPassed) {
                        next();
                    }
                };
            }
        });
    }
}
