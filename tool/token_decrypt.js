const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../shared/config');
const helper = require('../shared/helper');
const jwtSecret = config.JWT_SECRET;

/*
	algorithm : String,
	secret : String,
	password : password
	return : String
*/
function encrypt(algorithm, secret, password) {

	let cipher = crypto.createCipher(algorithm, secret);
	let crypted = cipher.update(password,'utf8','hex');

	crypted += cipher.final('hex');

	return crypted;

}

/*
	algorithm : String,
	secret : String,
	password : password
	return : String
*/
function decrypt(algorithm, crypted, secret) {
	let decipher = crypto.createDecipher(algorithm, secret);
	let dec = decipher.update(crypted,'hex','utf8');

	dec += decipher.final('utf8');

	return dec;

}

// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjZlMWU1NWIwN2UwMWU4YTBiMDk0NGUwYjIxMTAwZmNhZDE3NDUyZmU1NjkxNDczMjA2NjIxODY1YjY3YWFhNmE1MmZkYTBjN2ZkYTIzNmQ0YzZjYmVmNzg1MGVmNjA5MjUzNTExYzAzOTBiZDYzYjFhYjgyMDdjZDZlNTcwMjc2OTI3MjNkN2I2NjQyYTJlNmY5NzRkMjUzYmViZGNiYzNjMzFjYTVjNzYzNzRhZjAzNGI1ODYzMzZjM2RhNTZkOTAxYjI2ODMzYTRhN2JlYmM3YTMzYzBkMGM0MTA1Mjg1N2I0YWQ4ZDVmOGNkMTQ1MTNkOWUzMWE0NDg4MWE1NDEyNzgyNDk5MDBiOGFiZDZhMTFjNDg3ZDQzNDA0YmIxNWE0MWQ0YzRjNTk0ZDA1MjQ4YjEyNzI1YmI3N2I4MTA0YWUzZWVkZmQ4NzhhNjZkODIzNjdlZjM0MDEzMTM0MWVhOGI2ZGNiOWNmYTMxOWYyOTRhNmNlNTNlZDM4OTMwOTYyMzk5NTJlMjhjNDQ2YjlkZmQ0MzZiZDJiOGUyNWY1M2VhODI4YzU2MGM4OTFhNDQyNDgwZWIwMzQ2ZTM1MTMiLCJpYXQiOjE1MTI2MzQ5MDUsImV4cCI6MTUxMzIzOTcwNX0.hVw73NuiuZeCtFPIoDjbk_66az0gwxFRvb3K6NZg-YI";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IkhDblVkRVk1YVFpQkxjajY1UERFNjFya0t3bVAwR3dTb2dmMjFsSVlqT2twV0lHLWZyYzd6ZzBNMnBmcG90OVBHOG5rLXVQY3pDSzZwSmN1WkdMdFRsNGc4TFI1SVhKMHhxbU9kd3VTTmxHVElHbEF4OXJWMVlhMzFBWGw1NjdhIiwiaWF0IjoxNTE2Nzg4NTg2fQ.eYiHyiwAHcEwlUXM-uZt5_XrcFpCr_rqPQwua7o6cUI";
const jwtData = helper.tokenDecrypt(token);

console.log(jwtData.payload);

