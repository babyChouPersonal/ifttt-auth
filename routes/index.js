const express = require('express');

const oauthRouter = express.Router();
const iftttRouter = express.Router();
const oauth = require('./oauth');
const ifttt = require('./ifttt');

const tokenCheckUrls = ['/v1/user/info', '/v1/triggers/', '/v1/actions/'];
const keyCheckUrls = ['/v1/status', '/v1/test/setup'];


oauthRouter.get("/oauth/login", oauth.login);
oauthRouter.get("/oauth/signUp", oauth.signUp);
oauthRouter.post("/oauth/signUp", oauth.signUp);
oauthRouter.post("/oauth/authorize", oauth.authorize);
oauthRouter.post("/oauth/token", oauth.token);


// app.get(
//     ['/test', '/alternative', '/barcus*', '/farcus/:farcus/', '/hoop(|la|lapoo|lul)/poo'],function ( request, response ) {}
// );
iftttRouter.use(tokenCheckUrls, ifttt.tokenChecker);
iftttRouter.use(keyCheckUrls, ifttt.serverKeyChecker);

iftttRouter.get("/v1/user/info", ifttt.info);
iftttRouter.post("/v1/test/setup",ifttt.setup);
iftttRouter.get("/v1/status",ifttt.status);
iftttRouter.post("/v1/triggers/:trigger_slug",ifttt.activatedService, ifttt.trigger_slug);

iftttRouter.delete("/v1/triggers/:trigger_slug/trigger_identity/:trigger_identity", ifttt.trigger_delete);
iftttRouter.post("/v1/triggers/:trigger_slug/fields/:trigger_field_slug/options", ifttt.trigger_field_options);
iftttRouter.post("/v1/triggers/:trigger_slug/fields/:trigger_field_slug/validate", ifttt.trigger_field_validation);

iftttRouter.post("/v1/actions/:actions_slug", ifttt.actions_slug);
iftttRouter.post("/v1/actions/:actions_slug/fields/:action_field_slug/options", ifttt.actions_field_options);


module.exports = { oauthRouter, iftttRouter};