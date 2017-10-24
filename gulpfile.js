"use strict";

var gulp = require("gulp");
var rename = require("gulp-rename");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var minify = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var svgstore=require ("gulp-svgstore")
var webp = require("gulp-webp");
var run = require("run-sequence");
var del = require("del");
var posthtml = require ("gulp-posthtml");
var include = require ("posthtml-include");

gulp.task("build", function(done) {
  run("clean", "copy", "style", "images", "webp", done);
});

gulp.task("style", function() {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Safari versions",
        "last 2 Edge versions"
      ]})
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("sprite", function(){
  return gulp.src("img/icon-*.svg")
  .pipe(svgstore({
  inlineSvg:true
  }))
  .pipe(rename ("sprite.svg"))
  .pipe (gulp.dest ("img"));
});

gulp.task ("html", function(){
  return gulp.src("*.html")
  .pipe (posthtml([
  include()
  ]))
  .pipe(gulp.dest ("."));
});


gulp.task("webp", function() {
  return gulp.src("img/**/*.{png, jpg}")
    .pipe(webp({
      quality: 90
    }))
    .pipe(gulp.dest("build/img"));
});

gulp.task("images", function() {
  return gulp.src("img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("copy", function() {
  return gulp.src([
      "fonts/**/*.{woff,woff2}",
      "img/**",
      "js/**",
      "*.html",
    ], {
      base: "."
    })
    .pipe(gulp.dest("build"));
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("*.html").on("change", server.reload);
});
