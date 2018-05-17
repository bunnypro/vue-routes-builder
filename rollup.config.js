import path from "path";
import typescript from "rollup-plugin-typescript2";
import babel from "rollup-plugin-babel";
import license from "rollup-plugin-license";

export default {
    input: "./lib/index.ts",
    output: {
        file: "./dist/index.js",
        format: "cjs",
    },
    plugins: [
        typescript(),
        babel({
            exclude: "node_modules/**",
            presets: [
                [
                    "env",
                    {
                        modules: false,
                    },
                ],
            ],
            plugins: ["external-helpers"],
        }),
        license({
            sourceMap: true,
            banner: {
                file: path.join(__dirname, "license"),
                encoding: "utf-8", // Default is utf-8
            },
        }),
    ],
};
