function CodacyFormatter(cssLint) {
  cssLint.addFormatter({
    //format information
    id: "codacy",
    name: "Codacy, clean format",

    /**
     * Return content to be printed before all file results.
     * @return {String} to prepend before all results
     */
    startFormat: function () {
      return "";
    },

    /**
     * Return content to be printed after all file results.
     * @return {String} to append after all results
     */
    endFormat: function () {
      return "";
    },

    /**
     * Given CSS Lint results for a file, return output for this format.
     * @param results {Object} with error and warning messages
     * @param filename {String} relative file path
     * @param options {Object} (Optional) specifies special handling of output
     * @return {String} output for results
     */
    formatResults: function (results, filename, options) {
      var messages = results.messages,
        output = "";
      options = options || {};

      /**
       * Capitalize and return given string.
       * @param str {String} to capitalize
       * @return {String} capitalized
       */
      var capitalize = function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      };

      if (messages.length === 0) {
        return options.quiet ? "" : filename + ": Lint Free!";
      }

      cssLint.Util.forEach(messages, function (message) {
        output += filename + ":>" + "line:" + message.line + "," + message.rule.id + "," +
        capitalize(message.type) + ":" + message.message + "\n";
      });

      return output;
    }
  });
}

module.exports = CodacyFormatter;
