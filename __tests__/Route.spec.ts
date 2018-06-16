import { Route as VueRoute } from "vue-router/types/router";
import { tap } from "../lib/util";
import { RouteGuard } from "../lib/RouteGuard";
import { Route } from "../lib/Route";
import { RouteCollection } from "../lib/RouteCollection";

describe("Route", () => {
  const Home = { template: "<div>Home</div>" };
  const About = { template: "<div>About</div>" };

  test("can be instantiated with default value and options", () => {
    const route = new Route("/", Home, { props: true });

    expect(route.build()).toEqual({
      path: "/",
      components: {
        default: Home,
      },
      props: true,
    });

    const route2 = new Route("/").component(Home).options({ props: true });

    expect(route2.build()).toEqual({
      path: "/",
      components: {
        default: Home,
      },
      props: true,
    });
  });

  test("can be instantiated with named views", () => {
    const route = new Route("/").components({ home: Home, about: About }).options({ props: true });

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
    const route = new Route("/", Home, { props: true }).components({ about: About });
    const route2 = new Route("/").components({ default: Home, about: About }).options({ props: true });

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

  test("can add redirect route config option with dedicated method", () => {
    const route = new Route("/home", Home).redirect("/about");
    const route2 = new Route("/home", Home, { redirect: "/about" });

    expect(route.build()).toEqual(route2.build());
  });

  test("can add alias route config option with dedicated method", () => {
    const route = new Route("/home").options({
      alias: "/profile",
    });

    expect(route.build()).toEqual({
      path: "/home",
      components: {},
      alias: "/profile",
    });

    route.alias("/about");

    expect(route.build()).toEqual({
      path: "/home",
      components: {},
      alias: ["/profile", "/about"],
    });

    route.alias("/dashboard");

    expect(route.build()).toEqual({
      path: "/home",
      components: {},
      alias: ["/profile", "/about", "/dashboard"],
    });

    route.alias(["/a", "/b"]);

    expect(route.build()).toEqual({
      path: "/home",
      components: {},
      alias: ["/profile", "/about", "/dashboard", "/a", "/b"],
    });
  });

  test("can add meta from dedicated method", () => {
    const route = new Route("/home").meta({
      requireAuth: true,
    });

    expect(route.build()).toEqual({
      path: "/home",
      components: {},
      meta: {
        requireAuth: true,
      },
    });
  });

  test("can create children", () => {
    const route = new Route("/home");

    route.children(r => {
      r.add("/about", About);
      r.add("home").components({
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
    handle(from: VueRoute, to: VueRoute): true {
      return true;
    }
  }

  const RedirectedGuard = (from: VueRoute, to: VueRoute): string => {
    return "/";
  };

  test("can add route guards", () => {
    const route = new Route("/home");

    route.guard(new AllowedGuard());

    route.build().beforeEnter(null, null, result => {
      expect([undefined, null]).toContain(result);
    });

    route.guard(RedirectedGuard);

    route.build().beforeEnter(null, null, result => {
      expect(result).toEqual("/");
    });
  });

  test("use user specified beforEnter if exists", () => {
    const route = new Route("/home").options({
      beforeEnter: function(to, from, next) {
        next("/about");
      },
    });

    route.guard(new AllowedGuard(), RedirectedGuard);

    route.build().beforeEnter(null, null, result => {
      expect(result).toEqual("/about");
    });
  });

  test("can add children chained after guards", () => {
    const route = new Route("/home");

    route.guard(RedirectedGuard).children(children => {
      children.add("about");
    });

    tap(route.build(), buidedRoute => {
      buidedRoute.beforeEnter(null, null, result => {
        expect(result).toEqual("/");
      });

      expect(buidedRoute.children[0].beforeEnter).toBeUndefined();
    });
  });

  test("can add RouteCollection to children", () => {
    const route = new Route("/home");
    const children = new RouteCollection();

    children.add("/");
    children.add("/about");
    children.add("home");

    route.children(children);

    expect(route.build()).toEqual({
      path: "/home",
      components: {},
      children: [
        {
          path: "/",
          components: {},
        },
        {
          path: "about",
          components: {},
        },
        {
          path: "home",
          components: {},
        },
      ],
    });
  });
});
