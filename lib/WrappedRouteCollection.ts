import { RouteConfig } from "vue-router/types/router";
import { IRouteCollection } from "./IRouteCollection";
import { RouteGuardType } from "./RouteGuard";
import { RouteGroupConfig } from "./RouteCollection";

export class WrappedRouteCollection implements IRouteCollection {
  private readonly _prefix: string;
  private readonly _guards: RouteGuardType[];
  private readonly _routes: IRouteCollection;

  constructor(config: RouteGroupConfig, routes: IRouteCollection) {
    this._prefix = config.prefix || "/";
    this._routes = routes;
    this._guards = config.guards || [];
  }

  get count(): number {
    return this._routes.count;
  }

  guards(): RouteGuardType[] {
    return [...this._routes.guards(), ...this._guards];
  }

  build(...parents: IRouteCollection[]): RouteConfig[] {
    return this._routes.build(...parents, this);
  }

  resolveRoutePath(path: string): string {
    return `${this._prefix}/${path}`;
  }
}
