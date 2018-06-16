import Vue from "vue";
import { Route, RawLocation } from "vue-router/types/router";

export type PossibleRouteGuardResult = RawLocation | boolean | void;
export type AsyncPossibleRouteGuardResult = Promise<PossibleRouteGuardResult>;

export type RouteGuardResult = PossibleRouteGuardResult | AsyncPossibleRouteGuardResult;

export abstract class RouteGuard {
  abstract handle(from: Route, to: Route): RouteGuardResult;
}

export type RouteGuardType = RouteGuard | ((to: Route, from: Route) => RouteGuardResult);
