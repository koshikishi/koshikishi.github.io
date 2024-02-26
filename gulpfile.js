import {rmSync} from 'node:fs';
import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import postcss from 'gulp-postcss';
import postcssNormalize from 'postcss-normalize';
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import rename from 'gulp-rename';
import htmlmin from 'gulp-html-minifier-terser';
import {createGulpEsbuild} from 'gulp-esbuild';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import sharp from 'gulp-sharp-responsive';
import svgmin from 'gulp-svgmin';
import {create as bsCreate} from 'browser-sync';

const {src, dest, watch, series, parallel} = gulp;
const browserSync = bsCreate();

// Paths to files
const Path = {
  Source: {
    ROOT: 'src',
    STYLES: 'src/scss',
    SCRIPTS: 'src/js',
    IMAGES: 'src/img',
    ICONS: 'src/icons',
    FAVICONS: 'src/favicons',
    FONTS: 'src/fonts',
  },
  Build: {
    ROOT: 'build',
    STYLES: 'build/css',
    SCRIPTS: 'build/js',
    IMAGES: 'build/img',
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
export const scripts = () => {
  const esbuild = createGulpEsbuild({incremental: false});

  return src(`${Path.Source.SCRIPTS}/main.js`)
    .pipe(esbuild({
      bundle: true,
      format: 'esm',
      outfile: 'main.min.js',
      target: browserslistToEsbuild(),
      minify: true,
      sourcemap: true,
    }))
    .pipe(dest(Path.Build.SCRIPTS));
};

// Compressing raster image files with generation of *.webp and *.avif format
export const optimizeImages = () => src([
  `${Path.Source.IMAGES}/**/*.{png,jpg}`,
  `!${Path.Source.FAVICONS}/**`,
])
  .pipe(sharp({
    formats: [{
      width: ({width}) => width,
      format: 'webp',
      webpOptions: {
        quality: 80,
      },
    }, {
      width: ({width}) => width,
      format: 'avif',
      avifOptions: {
        quality: 65,
      },
    }],
  }))
  .pipe(dest(Path.Build.IMAGES))
  .pipe(src(`${Path.Source.IMAGES}/**/*.{png,jpg}`))
  .pipe(sharp({
    formats: [{
      width: ({width}) => width,
      jpegOptions: {
        quality: 80,
        progressive: true,
        mozjpeg: true,
      },
      pngOptions: {
        compressionLevel: 9,
        adaptiveFiltering: true,
      },
    }],
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
    formats: [{
      width: ({width}) => width,
      format: 'webp',
      webpOptions: {
        effort: 0,
      },
    }, {
      width: ({width}) => width,
      format: 'avif',
      avifOptions: {
        effort: 0,
      },
    }],
  }))
  .pipe(dest(Path.Build.IMAGES));

// Deleting files in the build directory before copying
export const clean = (done) => {
  rmSync(Path.Build.ROOT, {
    force: true,
    recursive: true,
  });
  done();
};

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
  watch(`${Path.Source.SCRIPTS}/**/*.js`, scripts);
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
