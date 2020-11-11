const currentTask = process.env.npm_lifecycle_event;
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const fse = require("fs-extra");

// make a new HtmlWebpack plugin for each file in the app folder
let pages = fse
  .readdirSync("./app")
  .filter((file) => {
    return file.endsWith(".html");
  })
  .map(
    (page) =>
      new HtmlWebpackPlugin({
        filename: page,
        template: `./app/${page}`,
      })
  );

// copy images to dist folder after build
class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap("Copy Sounds", () => {
      fse.copySync("./app/assets/sounds", "./dist/assets/sounds");
    });
  }
}

let cssConfig = {
  test: /\.css$/i,
  use: [
    {
      loader: "css-loader",
    },
    "postcss-loader",
  ],
};
// shared config between build and dev tasks
let config = {
  // set entry point (index) for webpack
  entry: "./app/assets/scripts/App.js",
  plugins: pages,
  // set output to custom path
  module: {
    rules: [
      cssConfig,
      {
        test: /\.(png|svg|jpg|gif|m4a|wav)$/,
        use: ["file-loader"],
      },
    ],
  },
};

if (currentTask == "dev") {
  config.output = {
    filename: "bundled.js",
    path: path.resolve(__dirname, "app"),
  };
  config.devServer = {
    before: (app, server) => {
      server._watch("./app/**/*.html");
    },
    host: "0.0.0.0",
    contentBase: path.join(__dirname, "app"),
    hot: true,
    port: 3000,
    stats: "errors-only",
  };
  // set to development
  config.mode = "development";
  cssConfig.use.unshift("style-loader");
}

if (currentTask == "build") {
  config.module.rules.push({
    test: /\.js$/,
    exclude: /(node_modules)/,
    use: {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-env"],
      },
    },
  });
  config.output = {
    filename: "[name].[chunkhash].js",
    chunkFilename: "[name].[chunkhash].js",
    path: path.resolve(__dirname, "dist"),
  };
  config.mode = "production";
  config.optimization = {
    splitChunks: {
      chunks: "all",
    },
  };
  config.plugins = [
    ...config.plugins,
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "styles.[chunkhash].css",
    }),
    new RunAfterCompile(),
  ];
  cssConfig.use.unshift(MiniCssExtractPlugin.loader);
}

module.exports = config;
