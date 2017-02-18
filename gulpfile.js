const gulp       = require('gulp'),
    browserSync  = require('browser-sync').create(),
    sass         = require('gulp-sass'),
    postcss      = require('gulp-postcss'),
    sourcemaps   = require('gulp-sourcemaps'),
    autoprefixer = require('autoprefixer'),
    babel        = require('gulp-babel');

const path = {
    sass: 'app/styles/sass/*.scss',
    js : 'app/scripts/es6/*.js'
}

gulp.task('serve', ['sass', 'js'], () => {

    browserSync.init({ server: './app' })

    gulp.watch(path.sass, ['sass']);
    gulp.watch('app/*.html', ['html']).on('change', browserSync.reload);
})

gulp.task('js', done => {
    return gulp.src(path.js)
        .pipe(babel())
        .pipe(gulp.dest('app/scripts'));
        browserSync.reload()
        done()

})

// gulp.task('js-watch',['js'], done => {
//     browserSync.reload
//     done()
// })

gulp.task('sass', () => {
    return gulp.src(path.sass)
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer() ]))
        .pipe(sass())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app/styles'))
        .pipe(browserSync.stream())
})

gulp.task('html', () => {
    return gulp.src('/app/*html')
        .pipe(gulp.dest('/app'))
})

gulp.task('default', ['serve'])