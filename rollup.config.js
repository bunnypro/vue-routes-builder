import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';

export default {
    input: './lib/index.ts',
    output: {
        file: './dist/index.js',
        format: 'cjs',
    },
    plugins: [
        typescript(),
        babel({
            exclude: 'node_modules/**',
            presets: [
                [
                    'env',
                    {
                        "modules": false
                    }
                ]
            ],
            plugins: [
                'external-helpers',
            ],
        }),
    ],
};
