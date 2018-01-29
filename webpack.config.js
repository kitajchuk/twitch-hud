const path = require( "path" );
const root = path.resolve( __dirname );
const source = path.join( root, "source" );
const nodeModules = "node_modules";
const webpack = require( "webpack" );
const autoprefixer = require( "autoprefixer" );



const webpackConfig = {
    devtool: "source-map",


    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: [autoprefixer( { browsers: ["last 2 versions"] } )]
            }
        })
    ],


    resolve: {
        modules: [root, source, nodeModules],
        mainFields: ["webpack", "browserify", "web", "hobo", "main"]
    },


    entry: {
        "app": path.resolve( __dirname, "hud/source/js/app.js" )
    },


    output: {
        path: path.resolve( __dirname, "hud/public/js" ),
        filename: "app.js"
    },


    module: {
        rules: [
            { test: /source\/js\/.*\.js$/, exclude: /node_modules|canvas/, use: ["eslint-loader"], enforce: "pre" },
            { test: /source\/js\/.*\.js$/, exclude: /node_modules|canvas/, use: [{ loader: "babel-loader", options: { presets: ["es2015"] } }] },
            { test: /(hobo|hobo.build)\.js$/, use: ["expose-loader?hobo"] },
            { test: /\.(sass|scss)$/, use: ["file-loader?name=../css/[name].css", "postcss-loader", { loader: "sass-loader" }] }
        ]
    }
};



module.exports = ( env ) => {
    // You can enable gzip compression here...
    // if ( env.production ) {
    //     webpackConfig.plugins.push(new CompressionPlugin({
    //         asset: "[path]",
    //         algorithm: "gzip",
    //         test: /\.(js|css)$/,
    //         threshold: 0,
    //         minRatio: 0.8
    //     }));
    // }

    return webpackConfig;
};
