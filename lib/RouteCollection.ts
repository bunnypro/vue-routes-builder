import { Component, Dictionary, RouteConfig } from "vue-router/types/router";
import { tap, flatMap } from "./util";
import { RouteGuardType } from "./RouteGuard";
import { Route, RouteBuilderConfig } from "./Route";

export interface RouteCollectionConfig {
  prefix?: string;
  guards?: RouteGuardType[];
}

export interface IRouteCollection {
  build(...parents: IRouteCollection[]): RouteConfig[];
  guards(): RouteGuardType[];
  resolveRoutePath(path: string): string;
}

export class RouteCollection implements IRouteCollection {
  protected readonly _prefix: string;
  protected readonly _guards: RouteGuardType[];
  protected readonly _routes: (Route | IRouteCollection)[] = [];

  constructor(config: RouteCollectionConfig = {}) {
    this._prefix = config.prefix || "/";
    this._guards = config.guards || [];
  }

  get count(): number {
    return this._routes.length;
  }

  add(path: string, view?: Component, config: RouteBuilderConfig = {}): Route {
    return tap(new Route(path, view, config), Array.prototype.push.bind(this._routes));
  }

  group(config: RouteCollectionConfig, group: RouteCollection | ((routes: RouteCollection) => void)): void {
    if (group instanceof RouteCollection) {
      this._routes.push(new RouteCollectionWrapper(config, group));
      return;
    }

    this._routes.push(tap(new RouteCollection(config), group));
  }

  append(routes: RouteCollection): void {
    this._routes.push(routes);
  }

  guards(): RouteGuardType[] {
    return [...this._guards];
  }

  build(...parents: IRouteCollection[]): RouteConfig[] {
    return flatMap<Route | IRouteCollection, RouteConfig>(this._routes, route => route.build(...parents, this));
  }

  resolveRoutePath(path: string): string {
    return `/${this._prefix}/${path}`.replace(/\/+/g, "/");
  }
}

export class RouteChildren extends RouteCollection {
  resolveRoutePath(path: string): string {
    const rPath = super.resolveRoutePath(path);

    return rPath === "/" ? "/" : rPath.replace(/^\/+/g, "");
  }
}

export class RouteCollectionWrapper implements IRouteCollection {
  protected readonly _prefix: string;
  protected readonly _guards: RouteGuardType[];
  protected readonly _routes: RouteCollection;

  constructor(config: RouteCollectionConfig, routes: RouteCollection) {
    this._prefix = config.prefix || "/";
    this._routes = routes;
    this._guards = config.guards || [];
  }

  get count(): number {
    return this._routes.count;
  }

  guards(): RouteGuardType[] {
    return [...this._guards];
  }

  build(...parents: IRouteCollection[]): RouteConfig[] {
    return this._routes.build(...parents, this);
  }

  resolveRoutePath(path: string): string {
    return `/${this._prefix}/${path}`.replace(/\/+/g, "/");
  }
}

export class RouteChildrenWrapper extends RouteCollectionWrapper {
  resolveRoutePath(path: string): string {
    const rPath = super.resolveRoutePath(path);

    return rPath === "/" ? "/" : rPath.replace(/^\/+/g, "");
  }
}
