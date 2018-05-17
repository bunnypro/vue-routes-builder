import {
    RouteConfig,
    Component,
    Dictionary,
    RedirectOption,
    RoutePropsFunction,
    PathToRegexpOptions,
} from "vue-router/types/router";
import { tap } from "./util";
import { RouteCollection } from "./RouteCollection";

export interface RouteBuilderConfig {
    name?: string;
    redirect?: RedirectOption;
    alias?: string | string[];
    meta?: any;
    props?: boolean | Object | RoutePropsFunction;
    caseSensitive?: boolean;
    pathToRegexpOptions?: PathToRegexpOptions;
}

export class Route {
    private readonly config: RouteConfig;
    private childrenRoutes: RouteCollection;

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

    children(fn: (routes: RouteCollection) => void): void {
        this.childrenRoutes = tap(new RouteCollection({ children: true }), fn);
    }

    build(): RouteConfig {
        return tap({ ...this.config }, config => {
            if (this.childrenRoutes && this.childrenRoutes.count) {
                config.children = this.childrenRoutes.build();
            }
        });
    }
}
