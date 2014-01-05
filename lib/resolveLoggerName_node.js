var nodePath = require('path');
require('raptor-ecma/es6');
var packaging = require('raptor-packaging');

function removeExt(path) {
    var lastDot = path.lastIndexOf('.');
    if (lastDot !== -1) {
        return path.substring(0, lastDot);
    }
    else {
        return path;
    }
}

function readPackage(path) {
    try {
        return packaging.readPackage(path);
    }
    catch(e) {
        if (e.fileNotFound === true) {
            return null;
        }
        else {
            throw e;
        }
    }
}

function getModuleBaseFromPaths(dir, paths, path) {
    for (var i=0; i<paths.length; i++) {
        var basePath = paths[i];
        if (path.startsWith(basePath)) {
            return basePath;
        }
    }
    return undefined;
}

function loggerName(path) {
    path = removeExt(path);
    var basePath;

    var curDir = nodePath.dirname(path);
    var rootPkg;

    while (true) {
        if (curDir === '/' || curDir === '.' || curDir === '') {
            break;
        }

        var packagePath = nodePath.join(curDir, 'package.json');
        var pkg = readPackage(packagePath);
        
        if (pkg && (pkg.version || pkg.dependencies || pkg.raptor.paths)) {
            rootPkg = pkg;
            // We have reached the top-level directory of a module
            break;
        }
    
        curDir = nodePath.dirname(curDir);
    }

    var moduleName = rootPkg.name || nodePath.basename(rootPkg.__dirname);

    if (basePath) {
        return nodePath.relative(basePath, path);
    }
    else {
        if (rootPkg.__dirname === path) {
            return moduleName;
        }
        else {
            return moduleName + '/' + nodePath.relative(rootPkg.__dirname, path);    
        }
    }
}

module.exports = loggerName;