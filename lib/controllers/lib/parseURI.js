var dataurl = require('dataurl');
module.exports = function(input){

	return dataurl.parse(input);
}