# Vue Routes Builder

[![Build Status](https://travis-ci.org/bunnypro/vue-routes-builder.svg?branch=master)](https://travis-ci.org/bunnypro/vue-routes-builder)
[![codecov](https://codecov.io/gh/bunnypro/vue-routes-builder/branch/master/graph/badge.svg)](https://codecov.io/gh/bunnypro/vue-routes-builder)
[![npm](https://img.shields.io/npm/v/vue-routes-builder.svg)](https://www.npmjs.com/package/vue-routes-builder)
[![License](https://img.shields.io/:license-MIT-green.svg)](https://github.com/bunnypro/vue-routes-builder/blob/master/license)

This library allows you to build a vue-router routes with **method chaining**, enable the ability to use **multiple route guards**, and also **grouping routes** with advantages of prefixing routes group and passing route guards.

## Installing

`yarn add -D vue-routes-builder`

## Usage

* [Create Routes](#create-routes)
* [Add Route](#add-route)
* [Create Route Children](#create-children)
* [Attach RouteGuard(s) to a Route](#attach-guard)
* [Create Grouped Routes](#create-group)
* [Append RouteCollection](#append-routes)
* [Create RouteGuard](#create-guard)

<a name="create-routes"></a>

### Create Routes (RouteCollection)

vue-routes-builder export default the `RouteCollection` class that can be aliased with `Routes`.

`RouteCollection` accept one optional string parameter as a prefix path.

```ts
import Routes from "vue-routes-builder";
/** another imports ... **/
const routes = new Routes(); // prefix path is /
// or
const routes = new Routes("dashboard"); // prefix path is /dashboard

/** routes declaration ... **/

// VueRouter initialization
new VueRouter({
  routes: routes.build(),
});
```

<a name="add-route"></a>

### Add Route

Use `add` method of RouteCollection to add a Route. The `add` method accept 4 parameters, first is a string path, second is the component, third is named view components and fourth is a `RouteBuilderConfig`.

* The first parameter is mandatory.
* The second is mandatory but you can pass `null` if you specify the third parameter.
* The third parameter is optional but you must pass `null` or empty object `{}` if you want to provide the fourth parameter.
* The fourth parameter is optional.

```ts
const routes = new Routes();

routes.add("/", LandingPage);

routes.add("dashboard", DashboardPage, {
  menu: DashboardMenu,
});
// same as
routes.add("dashboard", null, {
  default: DashboardPage,
  menu: DashboardMenu,
});

route.add("post/:id", PostPage, null, { props: true });
```

<a name="create-children"></a>

### Create Route Children

To Create Route Children you can use `children method` from Route object that accessible with chaining after `add` method.

The `children` method requires one parameter to be a callback of children routes declaration.

The callback accept one parameter to be a RouteCollection

```ts
routes.add("profile", ProfilePage).children(children => {
  children.add("/", ProfileGeneralPage);
  children.add("setting", ProfileSettingPage);
});
```

<a name="attach-guard"></a>

### Attach RouteGuard(s) to a Route

To attach RouteGuard(s) to a route you can use `guard` from Route object that accessible with chaining after `add` method. You can specify more that one RouteGuard(s).

This library will build your RouteGuard(s) and attach them to `beforeEnter` property of vue-router RouteConfig option. **If you specify the `beforeEnter` property to RouteBuilderConfig option the RouteGuard(s) will not be builded**

```ts
routes.add("dashboard", DashboardPage).guard(
  new AuthenticationGuard(),
  new AccountActivatedGuard(),
  (to, from) => {},
  ...
);
```

<a name="create-group"></a>

### Create Grouped Routes

To create a grouped routes you can use `group` method of RouteCollection object.

The `group` method accept two parameters, the first parameter is an object of RouteGroupConfig with `prefix` and `guards` property, and the second parameter is either a callback of routes declaration or a RouteCollection object.

The callback of routes declaration accept one parameter to be a RouteCollection.

```ts
// with callback of routes declaration
route.group({ prefix: 'dashboard' }, group => {
  group.add('profile', DashboardProfile);
  ...
});
// you can also pass guard(a) to group
route.group({ prefix: 'dashboard', guards: [new AuthenticationGuard()] }, group => {
  ...
});

// with RouteCollection object
const dashboardRoutes = new RouteCollection();
dashboardRoutes.add('profile', DashboardProfile);

routes.group({ prefix: 'dashboard' }, dashboardRoutes);
```

<a name="append-routes"></a>

### Append RouteCollection

To append two RouteCollection you can use `append` method of RouteCollection object.

```ts
const routes = new RouteCollection();
const authRoutes = new RouteCollection();

routes.append(authRoutes);
```

<a name="create-guard"></a>

### Create RouteGuard

To create a route guard, simply create a class with extending RouteGuard abstract class. RouteGuard abstract class provide one method called `handle` that accept two parameters, both parameters are vue-router Route object. `handle` method must return one/more of string|boolean|void|vue-router Location|((vm: Vue) => any) or Promise of those types if you want to create an async guard.

Another way to create a RouteGuard is just create a function that have parameters and return type like `RouteGuard::handle` method

```ts
import { Route } from "vue-router/types/router";
import Routes { RouteGuard } from 'vue-routes-builder';

class TokenAvailabilityGuard extends RouteGuard {
  handle(to: Route, from: Route): string|boolean {
    if (tokenAvailableInLocalStorage) {
      return true;
    }

    return '/auth';
  }
}

// async guard
class TokenAuthenticationGuard extends RouteGuard {
  async handle(to: Route, from: Route): Promise<string|boolean> {
    const response = await fetch('https://some/authentication/api?token=savedToken');
    const authentication = await response.json();

    if (authentication.authenticated) {
      return true;
    }

    return '/auth';
  }
}

const FunctionGuard = (to: Route, from: Route): string {};

routes.group({
  guards: [
    new TokenAvailabilityGuard(),
    new TokenAuthenticationGuard(),
    FunctionGuard,
    ...
  ]
}, ...);
```
