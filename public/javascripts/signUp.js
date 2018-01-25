import { initGoogleAPI } from './googleSignIn.js';
import { initFacebookAPI } from './facebookSignIn.js';

function init() {

	initGoogleAPI(true);
	initFacebookAPI(true);
}

init();

export {
	init
};