(function () {
  var crypto = require('crypto');
  var chalk = require('chalk');
  var _ = require('lodash');

  var LessParser = require('./less-parser');
  var CSSLint = require('./csslint-extended').CSSLint;

  function LessFile(filePath, contents, rules, options) {
    this.filePath = filePath;
    this.fileContents = contents;
    this.lintRules = rules;
    this.options = options != null ? options : {};
    this.options.sourceMap = true;
  }

  LessFile.prototype.lint = function (callback) {
    return this.getCss((function (_this) {
      return function (err, output) {
        if (err) {
          return callback(new Error("Error parsing " + (chalk.yellow(_this.filePath)) + ": " + err.message));
        }

        var lintResult;
        try {
          lintResult = CSSLint.verify(output.css, _this.lintRules);
        } catch (_err) {
          return callback(new Error("Error linting " + (chalk.yellow(_this.filePath)) + ": " + _err.message));
        }

        var result = {
          file: _this.filePath,
          less: _this.fileContents,
          css: output.css,
          sourceMap: output.map
        };

        var ref;
        if ((lintResult != null ? (ref = lintResult.messages) != null ? ref.length : void 0 : void 0) > 0) {
          result.lint = lintResult;
        }

        return callback(null, result);
      };
    })(this));
  };

  LessFile.prototype.getCss = function (callback) {
    if (!this.fileContents) return callback(null, '');

    if (_.endsWith(this.filePath, ".less")) {
      var parser = new LessParser(this.filePath, this.options);
      return parser.parse(this.fileContents, callback);
    } else if (_.endsWith(this.filePath, ".css")) {
      return callback(null, {"css": this.fileContents});
    } else {
      return callback("extension not supported");
    }

  };

  module.exports.LessFile = LessFile;

}).call(this);
