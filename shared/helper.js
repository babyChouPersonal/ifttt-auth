const jwt = require('jsonwebtoken');
const int_encoder = require('int-encoder');
const crypto = require('crypto');
const config = require('./config'); 
const db = require('../shared/db');
const logger = require('../shared/logger');

const awsDB = db.docClient;
const ENCRYPTION_KEY = config.ENCRYPTION_KEY;
const jwtSecret = config.JWT_SECRET;

int_encoder.alphabet();



function encrypt_string(string) {
    var cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
    var crypted = cipher.update(string, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return int_encoder.encode(crypted, 16);
}

function decrypt_string(string) {
    key = int_encoder.decode(string, 16);
    var decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    var dec = decipher.update(key, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

function random(max)
{
    return Math.floor((Math.random() * max) + 1);
}

function generate_randomized_user_code(username)
{
    return encrypt_string(username + ":" + random(100));
}

function decrypt_randomized_user_code(user_code)
{
    var user_random = decrypt_string(user_code);

    return user_random.split(":")[0];
}

function generate_auth_code_for_user(username)
{
    return generate_randomized_user_code(username);
}


/*
    assets : Object {}
    return : { token:String , refreshToken: String }
*/
function tokenGen(assets) {
    const buf = crypto.randomBytes(16);
    const refreshToken = buf.toString('hex');
    const payload = Object.assign({ refreshToken : refreshToken }, assets);
    const encrypted = { token: encrypt_string(JSON.stringify(payload)) };

    // const token = jwt.sign(encrypted, jwtSecret, {
    //     expiresIn: (60*60*24)*EXPIRES_DAY, //expires In 7 Day
    // });

    const token = jwt.sign(encrypted, jwtSecret);

    return { token, refreshToken };
}

/*
    token : jwt Object
    return : { header:String , payload: String }
*/
function tokenDecrypt(token) {
    const decoded = jwt.decode(token, {complete: true});
    const header = decoded.header;
    const decryptToken = decrypt_string(decoded.payload.token);
    const payload = JSON.parse(decryptToken);

    return {
        header,
        payload
    };

}



/*
    params: Object
    method : String
    myLog : String
    return : Promise
*/
function queryDB(params, method, myLog) {

    return new Promise((resolve, reject) => {

        function _callback(err, data) {
            if(err) {
                reject(err);
                logger.log('debug', myLog);
            }else{
                resolve(data);
            }
        }

        switch(method) {
            case 'put':
                awsDB.put(params, _callback);
                break;
            case 'delete':
                awsDB.delete(params, _callback);
                break;
            case 'update':
                awsDB.update(params, _callback);
                break;
            case 'scan':
                awsDB.scan(params, _callback);
                break;
            case 'query':
                awsDB.query(params, _callback);
                break;
            case 'batchWrite':
                awsDB.batchWrite(params, _callback);
                break;
            case 'batchGet':
                awsDB.batchGet(params, _callback);
                break;
            case 'createSet':
                awsDB.createSet(params, _callback);
                break;
            default:
                reject(-1);
                logger.log('debug', 'No this method!!!');
                break;
        }


    });
}

const helper = {
    encrypt_string : encrypt_string,
    decrypt_string : decrypt_string,
    random : random,
    generate_randomized_user_code : generate_randomized_user_code,
    decrypt_randomized_user_code : decrypt_randomized_user_code,
    generate_auth_code_for_user : generate_auth_code_for_user,
    queryDB : queryDB,
    tokenGen,
    tokenDecrypt
};


module.exports = helper;