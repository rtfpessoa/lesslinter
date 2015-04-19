(function () {
  var path = require('path');
  var _ = require('lodash');
  var parser = require('less');

  var defaultLessOptions = {
    cleancss: false,
    compress: false,
    dumpLineNumbers: 'comments',
    optimization: null,
    syncImport: true
  };

  function LessParser(fileName, opts) {
    var paths;
    opts = _.defaults(opts || {}, defaultLessOptions);
    paths = [path.dirname(path.resolve(fileName))];

    if (opts.less && opts.less.paths) {
      paths = paths.concat(opts.less.paths);
    }

    this.opts = _.extend({
      filename: path.resolve(fileName),
      paths: paths,
      sourceMaps: true
    }, opts);
  }

  LessParser.prototype.parse = function (less, callback) {
    try {
      return parser.render(less, this.opts, callback);
    } catch (_error) {
      return callback(_error);
    }
  };

  module.exports = LessParser;

}).call(this);
