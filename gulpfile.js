/**
 * Created by brenden on 7/18/2015.
 */
//gulp and gulp plugins
var gulp = require("gulp");
var gutil = require("gulp-util");
var concat = require("gulp-concat");
var sass = require("gulp-sass");
var uglify = require("gulp-uglify");
var sourceMap = require("gulp-sourcemaps");
var templateCache = require("gulp-angular-templatecache")

//nodejs stuff for parsing index.html
var fs = require("fs");

//get all the .js files included in index.html so that we can pipe them into gulp / minify them and all that jazz
//simultaneously remove all <script> tags from index.html and then add one that's just "all.js" (and templates.js)
var jsFiles = [];
var indexDotHTML = "";
gulp.task("parseJS",function(cb){
    fs.readFile(__dirname + "/src/index.html", "utf-8", function(err,html){
        if(err){
            console.log(err);
            return;
        }
        var regex = /.*<script.*src="(.*)"><\/script>/;
        var file;
        while(file = regex.exec(html)){
            var f = file[1];
            if(f.indexOf("..") === 0){
                f = f.replace("..",".");
            }
            else if (f.indexOf("./") === 0){
                f = "./src" + f.substring(1);
            }
            jsFiles.push(f);
            html = html.replace(file[0] + "\r\n","")
        }
        indexDotHTML = html.substring(0,html.indexOf("</head>")) + "    <script src=\"./all.js\"></script>\r\n" + html.substring(html.indexOf("</head>"));
        cb();
    });
});

//for writing the index.html
function writeIndex(filename, string) {
    var src = require('stream').Readable({ objectMode: true });
    src._read = function () {
        this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }));
        this.push(null)
    };
    return src;
}

gulp.task('index',["parseJS"], function () {
    return writeIndex("index.html", indexDotHTML)
        .pipe(gulp.dest('build'))
});

gulp.task("sass",function(){
    gulp.src("./src/styles/*.scss")
        .pipe(sass().on("error",sass.logError))
        .pipe(gulp.dest("./build"));
});

//we need to wait for the parse to finish before doing the concat / minify step
gulp.task("buildJS",["parseJS", "angularTemplates"],function(){
    return gulp.src(jsFiles)
        .pipe(sourceMap.init())
        .pipe(concat("all.js"))
        .pipe(uglify())
        .pipe(sourceMap.write("."))
        .pipe(gulp.dest("build"))
});

//handle all angular templates
gulp.task("angularTemplates",["parseJS"],function(){
    jsFiles.splice(1,0,"./build/templates.js");
    return gulp.src("./src/**/*.template.html")
       .pipe(templateCache({standalone:true}))
       .pipe(gulp.dest("build"))

});

gulp.task("watch",function(){
    gulp.watch("./src/**/*.js", ["parseJS","buildJS"]);
    gulp.watch("./src/styles/*.scss",["sass"]);
    gulp.watch("./src/**/*.template.html",["parseJS","buildJS","angularTemplates"]);
    gulp.watch("./src/index.html",["parseJS","buildJS","angularTemplates","index"]);
});




gulp.task("default",["parseJS","buildJS","sass","index","angularTemplates"]);