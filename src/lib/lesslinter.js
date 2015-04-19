(function () {

  var _ = require('lodash');
  var chalk = require('chalk');
  var crypto = require('crypto');
  var path = require('path');

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
      if (_err != null) return {"error": _err};

      result = _result;
    });

    return {"result": processResult(_this.fileSrc, result)};
  };

  function processResult(filePath, result) {
    result || (result = {});
    var lintResult = result.lint;

    if (lintResult && result.sourceMap) {
      var sourceMap = new SourceMapConsumer(result.sourceMap);

      var filteredMessages = filterImportsMessages(filePath, lintResult.messages, sourceMap);
      injectLessPosition(filteredMessages, sourceMap);
      adjustMessagePosition(lintResult.messages);
    }

    return lintResult;
  }

  function filterImportsMessages(filePath, messages, sourceMap) {
    return messages.filter(function (message) {
      if (message.line === 0 || message.rollup) return true;

      var source = sourceMap.originalPositionFor({
        line: message.line,
        column: message.col
      }).source;

      if (source === null) return false;

      source && (source = path.resolve(source));

      var isThisFile = (source === filePath);

      // TODO: respect requested imports
      //var stripPath = require('strip-path');
      //var sourceArray = [stripPath(source, process.cwd()), stripPath(source, process.cwd() + '\\')];
      //return isThisFile || grunt.file.isMatch(_this.options.imports, sourceArray);

      return isThisFile;
    });
  }

  function injectLessPosition(messages, sourceMap) {
    messages || (messages = []);
    messages.forEach(function (message) {
      if (message.line !== 0 && !message.rollup) {
        var lessPosition = sourceMap.originalPositionFor({
          line: message.line,
          column: message.col
        });

        message.lessLine = {
          line: lessPosition.line,
          column: lessPosition.column
        };
      }
    });

    return messages;
  }

  function adjustMessagePosition(messages) {
    messages || (messages = []);
    messages.forEach(function (message) {
      if (message.lessLine) {
        message.line = message.lessLine.line - 1;
        message.col = message.lessLine.column - 1;
      }

      message.line += 1;
      message.col += 2;
    });

    return messages;
  }

  module.exports = LessLinter;

}).call(this);
