import Vue from "vue";
import { Route, RawLocation } from "vue-router/types/router";

export type RouteGuardResult = RawLocation | boolean | void;

export abstract class RouteGuard {
  abstract handle(from: Route, to: Route): RouteGuardResult | Promise<RouteGuardResult>;
}

export type RouteGuardType = RouteGuard | ((to: Route, from: Route) => RouteGuardResult);
