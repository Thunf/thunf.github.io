var gulp = require("gulp");

var concat = require("gulp-concat");
var rename = require("gulp-rename");

var uglify = require("gulp-uglify");
var jshint = require("gulp-jshint");

var cssminify = require("gulp-minify-css");

var browserSync = require("browser-sync").create();
var autoprefixer = require("gulp-autoprefixer");

var changed = require("gulp-changed");

var inject = require("gulp-inject");

var mainBowerFiles = require("main-bower-files");

//路径
var paths = {
    js :"./dev/**/*.js",
    css:"./dev/**/*.css"
};

var pathsto = {
    js :"./assets/js/",
    css:"./assets/css/"
};

// js hint
gulp.task("jshint",function(){
    return gulp.src(paths.js)
               .pipe(jshint())
               .pipe(jshint.reporter("default"));
});

// js concat/uglify/minify
gulp.task("jsmini",["jshint"],function(){
    return gulp.src(paths.js)
        .pipe(concat("main.js"))
        .pipe(gulp.dest(pathsto.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(gulp.dest(pathsto.js))
        .pipe(browserSync.reload({stream: true}));
});

// css concat/minify
gulp.task("cssmini",function(){
    return gulp.src(paths.css)
        .pipe(concat("main.css"))
        .pipe(autoprefixer({
            browsers: ['> 1%'],
            cascade: false
        }))
        .pipe(gulp.dest(pathsto.css))
        .pipe(cssminify())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(gulp.dest(pathsto.css))
        .pipe(browserSync.reload({stream: true}));
});

// browser-sync
gulp.task("browser-sync",function(){
    browserSync.init({
        server: "./"
    });
    gulp.watch("./index.html").on("change", browserSync.reload);
    gulp.watch("./yingqin/**/*.*").on("change", browserSync.reload);
});

gulp.task("inject", function(){
    var target = gulp.src("./index.html");
    var source = gulp.src([pathsto.js + "**/*.min.js", pathsto.css + "**/*.min.css"], {read: false});
    var bowerFiles = gulp.src(mainBowerFiles());
    return target.pipe(inject(bowerFiles,{name: "bower"}))
        .pipe(inject(source))
        .pipe(gulp.dest('./'));
});

// watch
gulp.task("watch", function(){
    gulp.watch(paths.js, ["jsmini"]);
    gulp.watch(paths.css, ["cssmini"]);
});

//默认方法
gulp.task("default", ["browser-sync","cssmini","jsmini","watch"],function(){
    console.log("gulp begin to work!");
});