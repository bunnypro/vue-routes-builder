import Vue from "vue";
import { Route, RawLocation } from "vue-router/types/router";

export type RouteGuardHanldeResult = RawLocation | boolean | ((vm: Vue) => any) | void;

export abstract class RouteGuard {
  abstract handle(from: Route, to: Route): RouteGuardHanldeResult | Promise<RouteGuardHanldeResult>;
}

export type RouteGuardType = RouteGuard | ((to: Route, from: Route) => RouteGuardHanldeResult);
