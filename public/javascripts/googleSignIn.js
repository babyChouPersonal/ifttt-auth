let auth2;
let isSignUp = false;


function initGoogleAPI(_isSignUp){
	const gapiScript = 'https://apis.google.com/js/api.js';

	$.getScript( gapiScript, onGapiLoad);

	isSignUp = _isSignUp;

};

function onGapiLoad() {
	gapi.load('auth2', function(){
		auth2 = gapi.auth2.init({
			client_id: '409027761949-lj2fv3k9e3npb1urpi12j94if7n106t4.apps.googleusercontent.com',
			cookiepolicy: 'single_host_origin',
			scope : 'profile email'
		});
		attachSignin(document.getElementById('btn-google-login'));
	});
}

function attachSignin(element) {
	
	auth2.attachClickHandler(element, {}, (googleUser)=> {
		
		$('#passport').val(googleUser.getAuthResponse().id_token);
		$('#sign-type').val('google');

		if(isSignUp) {
			let profile = auth2.currentUser.get().getBasicProfile();
			$('#inputEmail').val(profile.getEmail());
			$('#inputPassword').val(profile.getId());
			$('#profile').val(JSON.stringify({
				email : profile.getEmail(),
				imageUrl : profile.getImageUrl(),
				name: profile.getName(),
				password: profile.getId()
			}));
			console.log(auth2.currentUser.get().getBasicProfile());
		}
		$('#btn-submit').click();

	}, (error)=> {
		alert(JSON.stringify(error, undefined, 2));
	});
}

function signOut() {
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
		console.log('User signed out.');
	});
}



export {
	initGoogleAPI
};