"use strict";

let pack = require('../package.json')

const VERSION = process.env.VERSION || pack.version
const YEAR = new Date().getFullYear();

const BANNER = `/*!
 * ${pack.name} v${VERSION}
 * (c) ${YEAR} ${pack.author.name}
 * Release under the ${pack.license} License.
 */`;


module.exports = BANNER;