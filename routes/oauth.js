const firebase = require('firebase');
const firebaseAdmin = require("firebase-admin");
const jwt = require('jsonwebtoken');
const config = require('../shared/config'); 
const helper = require('../shared/helper');
const logger = require('../shared/logger');

const jwtSecret = config.JWT_SECRET;
const generate_auth_code_for_user = helper.generate_auth_code_for_user;
const decrypt_randomized_user_code = helper.decrypt_randomized_user_code;
const queryDB = helper.queryDB;
const tokenGen = helper.tokenGen;




module.exports.signUp = function(req, res) {
    const isSignUp = (/post/i.test(req.method));

    if(isSignUp) {
        let profile;
        let displayName = '';

        if(req.body.profile) {
            profile = JSON.parse(req.body.profile);
            displayName = profile.name;
        }

        
        firebaseAdmin.auth().createUser({
            email: req.body.email,
            emailVerified: false,
            password: generate_auth_code_for_user(req.body.password),
            displayName: displayName,
            disabled: false
        })
        .then(function(userRecord) {
            res.json({
                success: true,
                message : 'Sign up success!!. for test:' + userRecord.uid
            });
            console.log("Successfully created new user:", userRecord.uid);
        })
        .catch(function(error) {
            res.json({
                success: false,
                message : error.message
            });
            console.log("Error creating new user:", error);
        });

    }else{
        res.render('signUp');
    }

};

module.exports.login = function(req, res) {
    res.render('login', { client_id: 'Hey', response_type: 'Hello there!'});
};

// ****************** START OAUTH SERVER ******************

module.exports.authorize = function(req, res){
    
    let typeCredentialMapping = {
        google : firebase.auth.GoogleAuthProvider,
        facebook : firebase.auth.FacebookAuthProvider
    };
    let type = req.body['sign-type'];
    
    let credential;

    function signInError(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;

        res.json(error);
    }

    function signInSuccess(user) {
        if (user) {
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;


            queryDB({
                TableName : 'DeviceAccountInfo',
                ExpressionAttributeNames:{
                    "#UUID": "UUID"
                },
                ProjectionExpression : '#UUID',
                FilterExpression: '#UUID = :uuid',
                ExpressionAttributeValues: {
                    ':uuid': uid
                }
            },'scan','uuid not exist')
            .then((data)=>{
                if(data.Count > 0) {
                    const code = generate_auth_code_for_user(uid);
                    console.log('Here is uuid and code',uid, code);
                    console.log(req.body.redirect_uri + "?code=" + encodeURIComponent(code) + "&state=" + req.body.state);
                    res.redirect(req.body.redirect_uri + "?code=" + encodeURIComponent(code) + "&state=" + req.body.state);
                }else{
                    res.json({
                        success: false,
                        message : 'Account not exist!!'
                    });
                }
            })
            .catch((err)=>{
                logger.error("Unable to scan the table. Error JSON:" + JSON.stringify(err, null, 2));
            });
        } else {
            console.log('No account');
            res.json({
                success: false,
                message : 'Account not exist!! Please sign Up'
            });
        }
    }

    switch(type) {
        case 'google':
        case 'facebook':
            let token = req.body.passport;
            credential = typeCredentialMapping[type].credential(token);

            firebase.auth()
                    .signInWithCredential(credential)
                    .then(signInSuccess)
                    .catch(signInError);

            break;
        case 'email':
        default:
        console.log(4566);
            let email = req.body.email;
            let password = req.body.password;

            firebase.auth()
                    .signInWithEmailAndPassword(email, password)
                    .then(signInSuccess)
                    .catch(signInError);
            break;

    }
   

};


// Our standard OAuth token exchange endpoint. We'll take a code that was generated previously in the /generate_oauth_code endpoint
module.exports.token = function(req, res){

    try
    {
        const username = decrypt_randomized_user_code(req.body.code); // Decrypt the username from the code
        console.log(username);
        queryDB({
            TableName : 'DeviceAccountInfo',
            ExpressionAttributeNames:{
                "#UUID": "UUID"
            },
            ProjectionExpression : '#UUID',
            FilterExpression: '#UUID = :uuid',
            ExpressionAttributeValues: {
                ':uuid': username
            }
        },'scan','uuid not exist')
        .then((data)=>{

            if(data.Count > 0) {
                let user = {
                    username : username
                };

                // const token = jwt.sign(user, jwtSecret, {
                //     expiresIn: 60*60*24 //expires In 1 Day
                // });

                const token = tokenGen(user);

                // Re-encrypt our username as the app OAuth access token
                res.status(200).json({
                    token_type : "bearer",
                    access_token : token.token,
                    refresh_token : token.refresh_token
                });

            }else{
                res.status(200).json({
                    success: false,
                    message : 'Token error!!'
                });
            }
        })
        .catch((err)=>{
            console.log(err);
            logger.error("Unable to scan the table. Error JSON:" + JSON.stringify(err, null, 2));
        });
    }
    catch(e)
    {
        return res.status(401).json({error:"Invalid code"});
    }
   
};


