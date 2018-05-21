import { Route as VueRoute } from "vue-router/types/router";
import { tap } from "../lib/util";
import { RouteGuard, RouteGuardHanldeResult } from "../lib/RouteGuard";
import { Route } from "../lib/Route";

describe("Route", () => {
  const Home = { template: "<div>Home</div>" };
  const About = { template: "<div>About</div>" };

  test("can be instantiated with default value and options", () => {
    const route = new Route("/", Home, {}, { props: true });

    expect(route.build()).toEqual({
      path: "/",
      components: {
        default: Home,
      },
      props: true,
    });
  });

  test("can be instantiated with named views", () => {
    const route = new Route("/", null, { home: Home, about: About }, { props: true });

    expect(route.build()).toEqual({
      path: "/",
      components: {
        home: Home,
        about: About,
      },
      props: true,
    });
  });

  test("can be instantiated with default and named views", () => {
    const route = new Route("/", Home, { about: About }, { props: true });
    const route2 = new Route("/", null, { default: Home, about: About }, { props: true });

    expect(route.build()).toEqual({
      path: "/",
      components: {
        default: Home,
        about: About,
      },
      props: true,
    });

    expect(route.build()).toEqual(route2.build());
  });

  test("should resolve correct path", () => {
    tap(new Route("/"), route => {
      expect(route.build()).toEqual({
        path: "/",
        components: {},
      });
    });

    tap(new Route("//"), route => {
      expect(route.build()).toEqual({
        path: "/",
        components: {},
      });
    });

    tap(new Route("/home"), route => {
      expect(route.build()).toEqual({
        path: "/home",
        components: {},
      });
    });

    tap(new Route("home"), route => {
      expect(route.build()).toEqual({
        path: "home",
        components: {},
      });
    });

    tap(new Route("home/"), route => {
      expect(route.build()).toEqual({
        path: "home",
        components: {},
      });
    });

    tap(new Route("/home/"), route => {
      expect(route.build()).toEqual({
        path: "/home",
        components: {},
      });
    });

    tap(new Route("//home//"), route => {
      expect(route.build()).toEqual({
        path: "/home",
        components: {},
      });
    });

    tap(new Route("//home//about//"), route => {
      expect(route.build()).toEqual({
        path: "/home/about",
        components: {},
      });
    });
  });

  test("can create children", () => {
    const route = new Route("/home");

    route.children(r => {
      r.add("/about", About);
      r.add("home", null, {
        home: Home,
        about: About,
      });
    });

    expect(route.build()).toEqual({
      path: "/home",
      components: {},
      children: [
        {
          path: "about",
          components: { default: About },
        },
        {
          path: "home",
          components: {
            home: Home,
            about: About,
          },
        },
      ],
    });
  });

  class AllowedGuard extends RouteGuard {
    handle(from: VueRoute, to: VueRoute): RouteGuardHanldeResult {
      return true;
    }
  }

  class RedirectedGuard extends RouteGuard {
    handle(from: VueRoute, to: VueRoute): RouteGuardHanldeResult {
      return "/";
    }
  }

  test("can add route guards", () => {
    const route = new Route("/home");

    route.guard(new AllowedGuard());

    route.build().beforeEnter(null, null, result => {
      expect([undefined, null]).toContain(result);
    });

    route.guard(new RedirectedGuard());

    route.build().beforeEnter(null, null, result => {
      expect(result).toEqual("/");
    });
  });

  test("use user specified beforEnter if exists", () => {
    const route = new Route("/home", null, null, {
      beforeEnter: function(to, from, next) {
        next("/about");
      },
    });

    route.guard(new AllowedGuard(), new RedirectedGuard());

    route.build().beforeEnter(null, null, result => {
      expect(result).toEqual("/about");
    });
  });

  test("can add children chained after guards", () => {
    const route = new Route("/home");

    route.guard(new RedirectedGuard()).children(children => {
      children.add("about");
    });

    tap(route.build(), buidedRoute => {
      buidedRoute.beforeEnter(null, null, result => {
        expect(result).toEqual("/");
      });

      expect(buidedRoute.children[0].beforeEnter).toBeUndefined();
    });
  });
});
