var gulp = require("gulp");

var concat = require("gulp-concat");
var rename = require("gulp-rename");

var uglify = require("gulp-uglify");
var jshint = require("gulp-jshint");

var cssminify = require("gulp-minify-css");


//路径
var paths = {
	js :'./dev/**/*.js',
	css:'./dev/**/*.css'
};

var pathsto = {
	js :'./assets/js/',
	css:'./assets/css/'
};

//js语法校验
gulp.task('jshint',function(){
	return gulp.src(paths.js)
			   .pipe(jshint())
			   .pipe(jshint.reporter('default'));
});

//js连接、压缩、歧义化
gulp.task('jsmini',['jshint'],function(){
	gulp.src(paths.js)
		.pipe(concat('main.js'))
		.pipe(gulp.dest(pathsto.js))
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min',
			extname: '.js'
		}))
		.pipe(gulp.dest(pathsto.js));
});

//css连接、压缩
gulp.task('cssmini',function(){
	gulp.src(paths.css)
		.pipe(concat('main.css'))
		.pipe(gulp.dest(pathsto.css))
		.pipe(cssminify())
		.pipe(rename({
			suffix: '.min',
			extname: '.css'
		}))
		.pipe(gulp.dest(pathsto.css));
});


//监测文件改动
gulp.task('watch',function(){
	var jsw = gulp.watch(paths.js, ['jsmini']);
	var	cssw = gulp.watch(paths.css, ['cssmini']);
});

//默认方法
gulp.task('default', ['cssmini','jsmini','watch'],function(){
	console.log("ww");
});