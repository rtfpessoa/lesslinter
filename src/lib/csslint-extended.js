var CSSLint = require('csslint').CSSLint;
// import the codacy formatter
(require("./formatters/codacy"))(CSSLint);

module.exports.CSSLint = CSSLint;
