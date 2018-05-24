import {
  Dictionary,
  Component,
  RouteConfig,
  RedirectOption,
  NavigationGuard,
  RoutePropsFunction,
  PathToRegexpOptions,
} from "vue-router/types/router";
import { tap, pipe, flatMap } from "./util";
import { RouteGuardType, RouteGuard } from "./RouteGuard";
import { RouteChildren, IRouteCollection } from "./RouteCollection";

export interface RouteBuilderConfig {
  name?: string;
  redirect?: RedirectOption;
  alias?: string | string[];
  meta?: any;
  beforeEnter?: NavigationGuard;
  props?: boolean | Object | RoutePropsFunction;
  caseSensitive?: boolean;
  pathToRegexpOptions?: PathToRegexpOptions;
}

export class Route {
  private readonly _path: string;
  private readonly _components: Dictionary<Component>;
  private readonly _config: RouteBuilderConfig;
  private _children: RouteChildren;
  private readonly _guards: RouteGuardType[] = [];

  constructor(path: string, view?: Component, views?: Dictionary<Component>, config: RouteBuilderConfig = {}) {
    this._path = path;
    this._components = this.resolveComponents(view, views);
    this._config = config;
  }

  private resolveComponents(view?: Component, views?: Dictionary<Component>): Dictionary<Component> {
    const components = { ...(views || {}) };

    if (view) {
      components.default = view;
    }

    return components;
  }

  guard(...guards: RouteGuardType[]): Route {
    this._guards.push(...guards);

    return this;
  }

  children(children: (routes: RouteChildren) => void): void {
    this._children = tap(new RouteChildren(), children);
  }

  build(...parents: IRouteCollection[]): RouteConfig {
    return tap({ ...this._config, components: { ...this._components } } as RouteConfig, config => {
      const pathResolvers = parents
        .map(route => route.resolveRoutePath.bind(route))
        .reverse()
        .concat(this.resolvePath);

      config.path = pipe(this._path, ...pathResolvers);

      if (this._children && this._children.count > 0) {
        config.children = this._children.build();
      }

      if (!config.beforeEnter || !(config.beforeEnter instanceof Function)) {
        const guards = flatMap<IRouteCollection, RouteGuardType>(parents, parent => parent.guards()).concat(
          ...this._guards,
        );

        if (guards.length > 0) {
          config.beforeEnter = async (to, from, next) => {
            let guardsPassed = true;

            for (const guard of guards) {
              let nextStep = guard instanceof RouteGuard ? guard.handle(to, from) : guard(to, from);

              if (nextStep instanceof Promise) {
                nextStep = await nextStep;
              }

              if (nextStep === true || nextStep === undefined || nextStep === null) {
                continue;
              }

              next(nextStep);
              guardsPassed = false;
              break;
            }

            if (guardsPassed) {
              next();
            }
          };
        }
      }
    });
  }

  private resolvePath(path: string): string {
    const rPath = path.replace(/\/+/g, "/");

    return rPath === "/" ? "/" : rPath.replace(/\/+$/g, "");
  }
}
