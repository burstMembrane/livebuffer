const currentTask = process.env.npm_lifecycle_event;

const postCssOpts = {
  plugins: [
    require("postcss-import"),
    require("postcss-mixins"),
    require("postcss-simple-vars"),
    require("postcss-nested"),
    require("postcss-hexrgba"),
    require("autoprefixer"),
  ],
};

if (currentTask == "build") {
  postCssOpts.plugins.push(
    require("cssnano")({
      preset: "default",
    })
  );
}

module.exports = postCssOpts;
