var gulp = require('gulp');
var webserver = require('gulp-webserver');
var run = require('gulp-run');

/**
 * run "npm start" to import the access logfile
 * and put it into json
 */
gulp.task('importAccessLog', function() {
    return run('npm start').exec();
})

/**
 *  copy chart.js
 */
gulp.task('js', function(){
    return gulp.src('node_modules/chart.js/dist/Chart.js')
        .pipe(gulp.dest('Template/js'))
});

/**
 * server listening
 */
gulp.task('server', function() {
    return gulp.src('Template')
        .pipe(webserver({
            host: '0.0.0.0',
            port: 3000,
            fallback: 'epa.html',
            // open: true,
        }));

});

/**
 * run gulp with this order
 */
gulp.task('default', gulp.series('importAccessLog', 'js', 'server'));

