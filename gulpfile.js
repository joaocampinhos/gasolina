const gulp = require('gulp');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const pimport = require("postcss-import");
const browserify = require('gulp-browserify');

gulp.task('scripts', () => {
  gulp.src('./client/scripts/scripts.js')
    .pipe(browserify({ insertGlobals : true }))
    .pipe(gulp.dest('./public'))
});

gulp.task('styles', () => {
  gulp.src('./client/styles/styles.css')
    .pipe(postcss([
      pimport(),
      cssnano()
    ]))
    .pipe(gulp.dest('./public'))
});

gulp.task('watch', ['build'], () => {
  gulp.watch("./client/scripts/**/*.js", ['scripts']);
  gulp.watch("./client/styles/**/*.css", ['styles'] );
});

gulp.task('build', ['scripts','styles']);

gulp.task('default', ['watch']);

