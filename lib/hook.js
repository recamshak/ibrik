(function() {
  var Module, coffee, endsWith, fs, hook, istanbul, originalJSLoader, originalLoader, transformFn;

  fs = require('fs');

  Module = require('module');

  istanbul = require('istanbul');

  coffee = require('coffee-script');

  coffee.register();

  originalLoader = require.extensions['.coffee'];

  originalJSLoader = null;

  hook = Object.create(istanbul.hook);

  transformFn = function(matcher, transformer, verbose) {
    return function(code, filename) {
      var changed, ex, shouldHook, transformed;
      shouldHook = matcher(filename);
      changed = false;
      if (shouldHook) {
        if (verbose) {
          console.error("Module load hook: transform [" + filename + "]");
        }
        try {
          transformed = transformer(code, filename);
          changed = true;
        } catch (_error) {
          ex = _error;
          console.error('Transformation error; return original code');
          console.error(ex.stack);
          console.error(ex);
          console.error(ex.stack);
          transformed = code;
        }
      } else {
        transformed = code;
      }
      return {
        code: transformed,
        changed: changed
      };
    };
  };

  hook.hookRequire = function(matcher, transformer, options) {
    var fn, postLoadHook;
    if (options == null) {
      options = {};
    }
    fn = transformFn(matcher, transformer, options.verbose);
    postLoadHook = null;
    if (options.postLoadHook && typeof options.postLoadHook === 'function') {
      postLoadHook = options.postLoadHook;
    }
    require.extensions['.coffee'] = function(module, filename) {
      var ret;
      ret = fn(fs.readFileSync(filename, 'utf8'), filename);
      if (ret.changed) {
        module._compile(ret.code, filename);
      } else {
        originalLoader(module, filename);
      }
      if (postLoadHook) {
        return postLoadHook(filename);
      }
    };
    istanbul.hook.hookRequire(matcher, transformer, options);
    originalJSLoader = require.extensions['.js'];
    return require.extensions['.js'] = function(module, filename) {
      if (!endsWith(filename, 'coffee-script.js')) {
        originalJSLoader(module, filename);
      }
    };
  };

  hook.unhookRequire = function() {
    if (originalJSLoader) {
      require.extensions['.js'] = originalJSLoader;
      originalJSLoader = null;
    }
    istanbul.hook.unhookRequire();
    return require.extensions['.coffee'] = originalLoader;
  };

  endsWith = function(string, endString) {
    if (string.length < endString.length) {
      return false;
    }
    return string.substr(string.length - endString.length) === endString;
  };

  module.exports = hook;

}).call(this);