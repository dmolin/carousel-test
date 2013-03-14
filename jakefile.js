/*global desc, task, jake, fail, complete */
task("default", ["lint"]);

desc("Linkt code");
task("lint", [], function(){
    var lint = require('./build/lint/lint_runner'),
        files,
        opts,
        globals;

    files = new jake.FileList();
    files.include("**/*.js");
    files.exclude(["node_modules", "js/libs"]);

    opts = {
        bitwise: true,
        curly: false,
        eqeqeq: true,
        forin: true,
        immed: true,
        latedef: false,
        newcap: true,
        noarg: true,
        noempty: true,
        nonew: true,
        regexp: true,
        trailing: true,
        node: true,
        devel: true,
        strict: false,
        sub: true
    };

    globals = {
        describe: false,
        it: false,
        beforeEach: false,
        afterEach: false,
        jQuery: false,
        document: false,
        tash: false
    };

    return lint.validateFileList(files.toArray(), opts, globals) || fail("Lint failed");
});
