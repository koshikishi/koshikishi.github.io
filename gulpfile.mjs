import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import rename from 'gulp-rename';
import htmlmin from 'gulp-html-minifier-terser';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import path from 'path';
import svgmin from 'gulp-svgmin';
import {deleteAsync} from 'del';
import {create as bsCreate} from 'browser-sync';

const {src, dest, watch, series, parallel} = gulp;
const browserSync = bsCreate();

// Compiling of *.css files from *.scss with autoprefixer and minification
const sass = gulpSass(dartSass);

export const styles = () => src('source/scss/style.scss')
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(postcss([
    autoprefixer(),
    cssnano(),
  ]))
  .pipe(rename({
    suffix: '.min',
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(dest('build/css'))
  .pipe(browserSync.stream());

// Minification of *.html files
export const html = () => src('source/*.html')
  .pipe(htmlmin({
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
  }))
  .pipe(dest('build'));

// Minification of *.js script files
export const scripts = () => src('source/js/*.js')
  .pipe(sourcemaps.init())
  .pipe(terser())
  .pipe(rename({
    suffix: '.min',
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(dest('build/js'));

// Compression of raster image files with generation of *.webp format
export const optimizeImages = () => src('source/img/**/*.{png,jpg}')
  .pipe(squoosh((file) => ({
    encodeOptions: {
      ...(path.dirname(file.path).split(path.sep).pop() === 'favicons' ? {} : {
        webp: {
          quality: 90,
          method: 6,
        },
      }),
      ...(path.extname(file.path) === '.png' ? {
        oxipng: {
          level: 6,
        },
      } : {
        mozjpeg: {
          quality: 80,
        },
      }),
    },
  })))
  .pipe(dest('build/img'));

// Compression of vector image *.svg files
export const optimizeSvg = () => src([
  'source/img/**/*.svg',
  '!source/img/icon-*.svg',
])
  .pipe(svgmin({
    multipass: true,
  }))
  .pipe(dest('build/img'));

// Copying image files
export const copyImages = () => src([
  'source/img/**/*.{png,jpg,svg}',
  '!source/img/icon-*.svg',
])
  .pipe(dest('build/img'));

// Fast generation of image files in *.webp format
export const fastWebp = () => src([
  'source/img/**/*.{png,jpg}',
  '!source/img/favicons/**',
])
  .pipe(squoosh({
    encodeOptions: {
      webp: {
        method: 0,
      },
    },
  }))
  .pipe(dest('build/img'));

// Deleting files in the build directory before copying
export const clean = () => deleteAsync('build');

// Copying files to the build directory
export const copy = (done) => {
  src([
    'source/fonts/**/*.{woff,woff2}',
    'source/*.ico',
    'source/*.webmanifest',
  ], {
    base: 'source',
  })
    .pipe(dest('build'));
  done();
};

// Refreshing page
export const refresh = (done) => {
  browserSync.reload();
  done();
};

// Starting Browsersync server
export const server = (done) => {
  browserSync.init({
    ui: false,
    server: 'build',
    cors: true,
    notify: false,
  });
  done();
};

// Watching changes in project files
export const watcher = () => {
  watch('source/scss/**/*.scss', styles);
  watch('source/js/*.js', scripts);
  watch('source/*.html', series(html, refresh));
};

// Build the project
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
    fastWebp,
  ),
  server,
  watcher,
);

export default dev;
