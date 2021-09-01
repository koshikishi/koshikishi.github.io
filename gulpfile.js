const {src, dest, watch, series, parallel} = require('gulp');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const htmlmin = require('gulp-html-minifier-terser');
const terser = require('gulp-terser');
const squoosh = require('gulp-libsquoosh');
const path = require('path');
const svgmin = require('gulp-svgmin');
const del = require('del');
const browserSync = require('browser-sync').create();

// Compiling of *.css files from *.scss with autoprefixer and minification
const styles = () => {
  return src('source/scss/style.scss')
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
};
exports.styles = styles;

// Minification of *.html files
const html = () => {
  return src('source/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
    }))
    .pipe(dest('build'));
};
exports.html = html;

// Minification of *.js script files
const scripts = () => {
  return src('source/js/*.js')
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('build/js'));
};
exports.scripts = scripts;

// Compression of raster image files with generation of *.webp format
const optimizeImages = () => {
  return src('source/img/*.{png,jpg}')
    .pipe(squoosh((file) => {
      return {
        encodeOptions: {
          webp: {
            quality: 90,
            method: 6,
          },
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
      };
    }))
    .pipe(dest('build/img'));
};
exports.optimizeImages = optimizeImages;

// Compression of vector image *.svg files
const optimizeSvg = () => {
  return src([
    'source/img/*.svg',
    '!source/img/icon-*.svg',
  ])
    .pipe(svgmin({
      multipass: true,
    }))
    .pipe(dest('build/img'));
};
exports.optimizeSvg = optimizeSvg;

// Copying image files
const copyImages = () => {
  return src([
    'source/img/*.{png,jpg,svg}',
    '!source/img/icon-*.svg',
  ])
    .pipe(dest('build/img'))
};
exports.copyImages = copyImages;

// Fast generation of image files in *.webp format
const fastWebp = () => {
  return src('source/img/*.{png,jpg}')
    .pipe(squoosh({
      encodeOptions: {
        webp: {
          method: 0,
        },
      },
    }))
    .pipe(dest('build/img'));
};
exports.fastWebp = fastWebp;

// Deleting files in the build directory before copying
const clean = () => {
  return del('build');
};
exports.clean = clean;

// Copying files to the build directory
const copy = (done) => {
  src([
    'source/fonts/**/*.{woff,woff2}',
    'source/*.ico',
  ], {
    base: 'source',
  })
    .pipe(dest('build'));
  done();
};
exports.copy = copy;

// Starting Browsersync server
const server = (done) => {
  browserSync.init({
    ui: false,
    server: 'build',
    browser: 'google chrome',
    cors: true,
    notify: false,
  });
  done();
};

// Watching changes in project files
const watcher = () => {
  watch('source/scss/**/*.scss', styles);
  watch('source/js/*.js', scripts);
  watch('source/*.html', series(html, refresh));
};
exports.watcher = watcher;

// Refreshing page
const refresh = (done) => {
  browserSync.reload();
  done();
};
exports.refresh = refresh;

// Build the project
exports.build = series(
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
exports.default = series(
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
