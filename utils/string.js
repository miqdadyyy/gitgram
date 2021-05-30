const CronConverter = require('cronstrue');

/**
 * @param {Array.<string>} arr
 */
function joinName(arr) {
  if (arr.length === 1) return arr[0];
  const firsts = arr.slice(0, arr.length - 1);
  const last = arr[arr.length - 1];
  return firsts.join(', ') + ' and ' + last;
}

/**
 *
 * @param {string} str
 * @return {boolean}
 */
function isCronValid(str) {
  try {
    CronConverter.toString(str);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  joinName,
  isCronValid,
};
