import { initGoogleAPI } from './googleSignIn.js';
import { initFacebookAPI } from './facebookSignIn.js';


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function init() {
	let url = window.location.href;
	$('input[name="client_id"]').val(getParameterByName('client_id', url));
	$('input[name="response_type"]').val(getParameterByName('response_type', url));
	$('input[name="redirect_uri"]').val(getParameterByName('redirect_uri', url));
	$('input[name="scope"]').val(getParameterByName('scope', url));
	$('input[name="state"]').val(getParameterByName('state', url));

	initGoogleAPI();
	initFacebookAPI();
}

init();

export {
	init
};