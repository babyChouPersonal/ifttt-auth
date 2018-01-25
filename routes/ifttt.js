const jwt = require('jsonwebtoken');
const config = require('../shared/config'); 
const logger = require('../shared/logger');
const helper = require('../shared/helper');
const uuidv4 = require('uuid/v4');

const jwtSecret = config.JWT_SECRET;
const iftttServerKey = config.IFTTT_SERVICE_KEY;
const queryDB = helper.queryDB;
const tokenDecrypt = helper.tokenDecrypt;

function updateIftttInfo(uuid, deviceID, triggerID, slugName, state) {
    return queryDB({
        TableName : 'DeviceAccountInfo',
        Key:{
            "UUID": uuid,
            "DEVICE_ID": deviceID
        },
        UpdateExpression : `set CDN_SERVICES.IFTTT.TRIGGER_ID = :triggerID, CDN_SERVICES.IFTTT.TRIGGER_SLUG.${slugName} = :slugName`,
        ExpressionAttributeValues: {
            ':triggerID': triggerID,
            ':slugName': state //'activating'
        }
    },'update','Update DB error');

}


// ****************** START IFTTT API ******************

module.exports.serverKeyChecker = function(req, res, next) {
    let reqServerKey = req.get('IFTTT-Channel-Key') || req.get('IFTTT-Service-Key');

    if(reqServerKey !== iftttServerKey) {
        return res.status(401).send({
            errors: [{
                message: "service key error."
            }]
        });
    }else{
        next();
    }


};


module.exports.tokenChecker = function(req, res, next) {
    var token = req.token || req.body.token || req.query.token || req.headers['x-access-token'];
    console.log(token );
    if (token) {
        jwt.verify(token, jwtSecret, function (err, decoded) {
        
            if (err) {
                logger.info(err);
                return res.status(401).json({
                    "errors": [{
                        "message": "Failed to authenticate token."
                    }]
                });

            } else {
                const jwtData = helper.tokenDecrypt(token);
               
                req.decoded = decoded;
                req.body.username = jwtData.payload.username;
                req.body.refresh_token = jwtData.payload.refresh_token;

 
                queryDB({
                    TableName : 'DeviceAccountInfo',
                    ProjectionExpression : 'CDN_SERVICES, DEVICE_ID',
                    FilterExpression: '#UUID = :uuid',
                    ExpressionAttributeNames: {
                        '#UUID':'UUID'
                    },
                    ExpressionAttributeValues: {
                        ':uuid': req.body.username
                    },
                    limit:1
                },'scan','Query DeviceAccountInfo error')
                .then(data => {
                    
                    if(data.Count > 0) {
                        req.body.iftttInfo = data.Items[0].CDN_SERVICES.IFTTT;
                        req.body.deviceID = data.Items[0].DEVICE_ID;

                        next();
                    }else{

                        return res.status(403).json({
                            "errors": [{
                                "message": "Authenticate error."
                            }]
                        });
                    }
                })
                .catch(err => {
                    logger.info(err);
                    return res.status(500).json({
                        "errors": [{
                            "message": "DB error. " + err
                        }]
                    });
                });

            }
        });

    }else{
        logger.info('No token provided.!!!');
        return res.status(401).send({
            errors: [{
                message: "No token provided."
            }]
        });
    }

};


module.exports.activatedService = function(req, res, next) {
    const uuid = req.body.username;
    if(!!req.body.trigger_identity) {
        let iftttInfo = req.body.iftttInfo;
        let deviceID = req.body.deviceID;
        let triggerID = req.body.trigger_identity;

        let slugName = req.path.slice(req.path.indexOf('triggers/')+9);//req.originalUrl capture a003670

        if(iftttInfo.TRIGGER_ID !== triggerID) {


            updateIftttInfo(uuid, deviceID, triggerID, slugName, 'activating')
            .then(data => {
                console.log(data);
                next();
            })
            .catch(err => {
                logger.info(err);

                return res.status(500).json({
                    "errors": [{
                        "message": "DB error " + err
                    }]
                });
            });
        }else{
            next();
        }

    }else{
        logger.info('No trigger_identity');
        return res.status(400).json({
            "errors": [{
                "message": "No trigger_identity"
            }]
        });
    }
};

module.exports.info = function(req, res){


    // var bearer_token = req.header("Authorization").split(" ")[1];
    // console.log(req.body.username);
// console.log(req.body);
    try
    {
        console.log(req.body);
        var username = req.body.username; // Decrypt the username from the code
        console.log(username);
    }
    catch(e)
    {
        return res.json(401, {error:"Invalid access token"});
    }

    res.json({
        "data": {
            "name" : 'Test-'+ username,
            "id" : username
        }
    });
};

module.exports.setup = function(req, res){

    res.status(200).json({
        "data": {
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImVLSlVMNWg1Y0FSdGdCV01FbVppVWZseEltQzMiLCJpYXQiOjE1MTExNDQxMjd9.RKZnw4p2tiLgBToOyQbzF6w5DBmwpkCX5ozOGsmdYDI",
            "samples": {
                "actions": {
                    "do_something": {}
                },
                "actionRecordSkipping": {
                    "do_something": {}
                }
            }
        }
    });
};

module.exports.status = function(req, res){
    res.status(200).end();
};

module.exports.trigger_slug = function(req, res){


    // logger.debug('------ body ------');
    // logger.debug(req.body);
    // logger.debug('------ headers ------\n');
    // logger.debug(req.headers);
    // logger.debug('====================\n');

    let responseData = [];

    queryDB({
        TableName : 'IotDeviceEvents',
        ProjectionExpression : 'EVENT_ID, CREATE_TIME, EVENT_TYPE',
        FilterExpression: '#UUID = :uuid and TRIGGER_ID = :triggerID and CREATE_TIME <= :createTime',
        // FilterExpression: '#UUID = :uuid and TRIGGER_ID = :triggerID',
        ExpressionAttributeNames: {
            '#UUID':'UUID'
        },
        ExpressionAttributeValues: {
            ':uuid': req.body.username,
            ':triggerID': req.body.trigger_identity,
            ':createTime': Date.now()
        },
        limit: req.body.limit || 50
    },'scan','Query DB error')
    .then(data => {

        if(data.Count > 0) {

            data.Items.forEach((obj, i)=>{
                let createTime = Number(obj.CREATE_TIME);

                responseData.push({
                    created_at : new Date(createTime).toISOString(),
                    meta : {
                        id : obj.EVENT_ID,
                        timestamp : createTime
                    }
                });
            });

            // responseData.sort((a, b)=>{
            //     return a.meta.timestamp - b.meta.timestamp;
            // });

            // console.log(responseData);


            res.status(200)
                .json({
                    data : responseData
                });

        }else if(data.Count === 0){
            logger.info("No Data");
            res.status(200)
                .json({
                    data : []
                });
        }else{
            logger.info("Token authenticate token error.");
            res.status(401).json({
                "errors": [{
                    "message": "Token authenticate token error."
                }]
            });
        }
    })
    .catch(err => {
        logger.info(err);
        res.status(500).json({
            "errors": [{
                "message": "DB error " + err
            }]
        });
    });

    
   

};

module.exports.trigger_delete = function(req, res){
    res.status(200).end();
};

module.exports.trigger_field_options = function(req, res){};
module.exports.trigger_field_validation = function(req, res){};


module.exports.actions_slug = function(req, res){
    /*data[0][id]
    (string) A database ID, timestamp, URL, or other value which uniquely identifies the resource created or modified during action execution.
    data[0][url]
    (optional string) URL to the created or modified resource.*/
    res.status(200)
        .json({
            data : [{
                "id": "234325",
                "url": "http://example.com/posts/234325"
            }]
        });
};

module.exports.actions_field_options = function(req, res){};