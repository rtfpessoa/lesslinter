(function () {

  var _ = require('lodash');
  var crypto = require('crypto');

  var SourceMapConsumer = require('source-map').SourceMapConsumer;

  var LessFile = require('./less-file').LessFile;

  function LessLinter(file, contents, rules, options) {
    this.fileSrc = file;
    this.fileContents = contents;
    this.rules = rules;
    this.options = options;
  }

  LessLinter.prototype.lint = function () {
    var _this = this;

    _.assign(_this.options, {
      less: {},
      csslint: {},
      imports: void 0
    });

    var result = {};

    var lessFile = new LessFile(_this.fileSrc, _this.fileContents, _this.rules, _this.options);
    lessFile.lint(function (_err, _result) {
      if (_err != null) result.error = _err;
      else result = _result;
    });

    if (result.error) return result;

    return {"result": processResult(result)};
  };

  function processResult(result) {
    result || (result = {});
    var lintResult = result.lint;

    if (lintResult && result.sourceMap) {
      var sourceMap = new SourceMapConsumer(result.sourceMap);
      lintResult.messages = injectLessPosition(lintResult.messages, sourceMap);
    } else {
      lintResult.messages = [];
    }

    return lintResult;
  }

  function injectLessPosition(messages, sourceMap) {
    messages || (messages = []);
    return _.map(messages, function (message) {
      if (message.line > 0 && !message.rollup) {
        var originalPosition = sourceMap.originalPositionFor({
          line: message.line,
          column: message.col
        });

        message.lessLine = {
          line: originalPosition.line,
          column: originalPosition.column
        };

        message.sourceFile = originalPosition.source;
      } else {
        // all the generic messages go in the first line
        message.line = 0;
        message.col = 0;
      }

      if (message.lessLine) {
        message.line = message.lessLine.line - 1;
        message.col = message.lessLine.column - 1;
      }

      message.line += 1;
      message.col += 2;

      return message;
    });
  }

  module.exports = LessLinter;

}).call(this);
