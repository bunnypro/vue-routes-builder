import Routes from '../lib';

describe('Routes', () => {
    let routes: Routes;

    const Home = { template: '<div>Home</div>', };
    const About = { template: '<div>About</div>', };

    beforeEach(() => {
        routes = new Routes();
    });

    test('can add a route to Routes object', () => {
        routes.add('home', Home, {
            props: true,
        });

        expect(routes.build()).toEqual([
            {
                path: '/home',
                component: Home,
                props: true,
            },
        ]);
    });

    test('can add named view to Routes object', () => {
        routes.addNamed('home',
            {
                home: Home,
                about: About,
            },
            {
                props: true,
            },
        );

        expect(routes.build()).toEqual([
            {
                path: '/home',
                components: {
                    home: Home,
                    about: About,
                },
                props: true,
            },
        ]);
    });

    test('can add children to Route object', () => {
        routes.add('/', Home).children(child => {
            child.add('about', About);
        });

        expect(routes.build()).toEqual([
            {
                path: '/',
                component: Home,
                children: [
                    {
                        path: '/about',
                        component: About,
                    },
                ],
            },
        ]);
    });
});
