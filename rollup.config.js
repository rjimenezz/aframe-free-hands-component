import terser from '@rollup/plugin-terser';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/free-hands.min.js',
        format: 'iife'
    },
    plugins: [terser()]
};