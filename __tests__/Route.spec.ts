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
        const route = new Route(
            "/",
            null,
            {
                home: Home,
                about: About,
            },
            { props: true },
        );

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
        const route = new Route(
            "/",
            Home,
            {
                about: About,
            },
            { props: true },
        );

        expect(route.build()).toEqual({
            path: "/",
            components: {
                default: Home,
                about: About,
            },
            props: true,
        });
    });

    test("should resolve correct path", () => {
        const route = new Route("/");

        expect(route.build()).toEqual({
            path: "/",
            components: {},
        });

        const route1 = new Route("//");

        expect(route1.build()).toEqual({
            path: "/",
            components: {},
        });

        const route2 = new Route("/home");

        expect(route2.build()).toEqual({
            path: "/home",
            components: {},
        });

        const route3 = new Route("home");

        expect(route3.build()).toEqual({
            path: "home",
            components: {},
        });

        const route4 = new Route("home/");

        expect(route4.build()).toEqual({
            path: "home",
            components: {},
        });

        const route5 = new Route("/home/");

        expect(route5.build()).toEqual({
            path: "/home",
            components: {},
        });

        const route6 = new Route("//home//");

        expect(route6.build()).toEqual({
            path: "/home",
            components: {},
        });

        const route7 = new Route("//home//about//");

        expect(route7.build()).toEqual({
            path: "/home/about",
            components: {},
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
});
