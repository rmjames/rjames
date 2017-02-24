const gulp       = require('gulp'),
    browserSync  = require('browser-sync').create(),
    sass         = require('gulp-sass'),
    postcss      = require('gulp-postcss'),
    sourcemaps   = require('gulp-sourcemaps'),
    autoprefixer = require('autoprefixer'),
    babel        = require('gulp-babel'),
    minifyCSS    = require('gulp-csso'),
    htmlmin      = require('gulp-htmlmin'),
    uglify       = require('gulp-uglify')

const path = {
    sass: 'app/styles/sass/**/*.scss',
    js: 'app/scripts/babel/**/*.js',
    html: 'app/**/*.html'
}

gulp.task('serve', [ 'html', 'sass', 'js' ], () => {
    browserSync.init({ server: './app' })
    gulp.watch(path.sass, ['sass'])
    gulp.watch(path.js, ['js-watch'])
    gulp.watch('path.html', ['html']).on('change', browserSync.reload);
})

gulp.task('html', () => {
    return gulp.src('path.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('app/dist/index.html'))
})

gulp.task('sass', () => {
    return gulp.src(path.sass)
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer() ]))
        .pipe(sass())
        .pipe(minifyCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app/dist/css'))
        .pipe(browserSync.stream())
})

gulp.task('js', () => {
    return gulp.src(path.js)
        .pipe(babel())
        .pipe(uglify())
        .pipe(gulp.dest('app/dist/js'));
})

gulp.task('js-watch', ['js'], done => {
    browserSync.reload()
    done()
})

gulp.task('default', ['serve'])
