const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('@splunk/webpack-configs/base.config').default;

const DEBUG = process.env.NODE_ENV !== 'production';

module.exports = merge(baseConfig, {
    entry: {
        latch_app: path.join(__dirname, 'src/index.tsx'),
    },
    output: {
        // Splunk Web serves an app's compiled bundles from appserver/static.
        // This build writes straight into the Splunk app package so no copy
        // step is needed between "frontend build" and "Splunk app contents".
        path: path.resolve(__dirname, '../../splunk-app/latch/appserver/static/build'),
        // 'auto' derives the base URL for lazily-loaded chunks from the
        // executing <script> tag's own src, so it resolves correctly
        // regardless of locale prefix or Splunk Web root path.
        publicPath: 'auto',
        // Every build is content-hashed; wipe prior hashes so stale, no
        // longer referenced bundles never linger in the release package.
        clean: true,
    },
    // Source maps are omitted from the production build so the release
    // package never ships source alongside compiled output (see README /
    // SECURITY.md). Development builds keep a fast eval map for local work.
    devtool: DEBUG ? 'eval-source-map' : false,
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
});
