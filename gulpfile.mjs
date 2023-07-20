import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import postcss from 'gulp-postcss';
import postcssNormalize from 'postcss-normalize';
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import rename from 'gulp-rename';
import htmlmin from 'gulp-html-minifier-terser';
import webpack from 'webpack-stream';
import webpackConfig from './webpack.config.mjs';
import sharp from 'gulp-sharp-optimize-images';
import svgmin from 'gulp-svgmin';
import {deleteAsync} from 'del';
import {create as bsCreate} from 'browser-sync';

const {src, dest, watch, series, parallel} = gulp;
const browserSync = bsCreate();

// Paths to files
const Path = {
  Source: {
    ROOT: 'source',
    STYLES: 'source/styles',
    JS: 'source/js',
    IMAGES: 'source/images',
    ICONS: 'source/images/icons',
    FAVICONS: 'source/images/favicons',
    FONTS: 'source/fonts',
  },
  Build: {
    ROOT: 'build',
    STYLES: 'build/css',
    JS: 'build/js',
    IMAGES: 'build/images',
  },
};

// Compiling *.css files from *.scss with autoprefixer and minification
const sass = gulpSass(dartSass);

export const styles = () => src(`${Path.Source.STYLES}/style.scss`)
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(postcss([
    postcssNormalize(),
    postcssPresetEnv({
      features: {
        'overflow-wrap-property': {
          method: 'copy',
        },
      },
      enableClientSidePolyfills: false,
    }),
    autoprefixer(),
    cssnano(),
  ]))
  .pipe(rename({
    suffix: '.min',
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(dest(Path.Build.STYLES))
  .pipe(browserSync.stream());

// Minification of *.html files
export const html = () => src(`${Path.Source.ROOT}/*.html`)
  .pipe(htmlmin({
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
  }))
  .pipe(dest(Path.Build.ROOT));

// Transpilation and minification of *.js script files
export const scripts = () => src(`${Path.Source.JS}/main.js`)
  .pipe(webpack(webpackConfig))
  .pipe(dest(Path.Build.JS));

// Compressing raster image files with generation of *.webp and *.avif format
export const optimizeImages = () => src([
  `${Path.Source.IMAGES}/**/*.{png,jpg}`,
  `!${Path.Source.FAVICONS}/**`,
])
  .pipe(sharp({
    webp: {
      quality: 80,
      effort: 6,
    },
    avif: {
      quality: 65,
      effort: 9,
    },
  }))
  .pipe(dest(Path.Build.IMAGES))
  .pipe(src(`${Path.Source.IMAGES}/**/*.{png,jpg}`))
  .pipe(sharp({
    png_to_png: {
      compressionLevel: 9,
      effort: 10,
    },
    jpg_to_jpg: {
      quality: 80,
      progressive: true,
      mozjpeg: true,
    },
  }))
  .pipe(dest(Path.Build.IMAGES));

// Compressing vector image *.svg files
export const optimizeSvg = () => src([
  `${Path.Source.IMAGES}/**/*.svg`,
  `!${Path.Source.ICONS}/**`,
])
  .pipe(svgmin({
    multipass: true,
  }))
  .pipe(dest(Path.Build.IMAGES));

// Copying image files
export const copyImages = () => src([
  `${Path.Source.IMAGES}/**/*.{png,jpg,svg}`,
  `!${Path.Source.ICONS}/**`,
])
  .pipe(dest(Path.Build.IMAGES));

// Fast generation of image files in *.webp and *.avif format
export const fastImages = () => src([
  `${Path.Source.IMAGES}/**/*.{png,jpg}`,
  `!${Path.Source.FAVICONS}/**`,
])
  .pipe(sharp({
    webp: {
      effort: 0,
    },
    avif: {
      effort: 0,
    },
  }))
  .pipe(dest(Path.Build.IMAGES));

// Deleting files in the build directory before copying
export const clean = () => deleteAsync(Path.Build.ROOT);

// Copying files to the build directory
export const copy = (done) => {
  src([
    `${Path.Source.FONTS}/**/*.{woff,woff2}`,
    `${Path.Source.ROOT}/*.ico`,
    `${Path.Source.ROOT}/*.webmanifest`,
  ], {
    base: Path.Source.ROOT,
  })
    .pipe(dest(Path.Build.ROOT));
  done();
};

// Refreshing page
export const refresh = (done) => {
  browserSync.reload();
  done();
};

// Start Browsersync server
export const server = (done) => {
  browserSync.init({
    ui: false,
    server: Path.Build.ROOT,
    cors: true,
    notify: false,
  });
  done();
};

// Watching changes in project files
export const watcher = () => {
  watch(`${Path.Source.STYLES}/**/*.scss`, styles);
  watch(`${Path.Source.JS}/**/*.js`, scripts);
  watch(`${Path.Source.ROOT}/*.html`, series(html, refresh));
};

// Build the project for production
export const build = series(
  clean,
  parallel(
    copy,
    styles,
    html,
    scripts,
    optimizeImages,
    optimizeSvg,
  ),
);

// Build the project and start Browsersync server
export const dev = series(
  clean,
  parallel(
    copy,
    styles,
    html,
    scripts,
    optimizeSvg,
    copyImages,
    fastImages,
  ),
  server,
  watcher,
);

export default dev;
