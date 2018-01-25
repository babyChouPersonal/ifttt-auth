const AWS = require('aws-sdk');

AWS.config.update({
  region: "us-east-1",  
  accessKeyId: "AKIAJIQZ2CS77BZXKXMQ",
  secretAccessKey: "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"  
});



module.exports = {
	docClient : new AWS.DynamoDB.DocumentClient(),
	dynamodb : new AWS.DynamoDB()
};