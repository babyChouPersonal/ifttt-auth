let isSignUp = false;

function initFacebookAPI(_isSignUp){

	isSignUp = _isSignUp;
	
	window.fbAsyncInit = function() {
		FB.init({
			appId      : '148570815762352',
			cookie     : true,
			xfbml      : true,
			version    : 'v2.11'
		});

		FB.AppEvents.logPageView();

		$('#fb-btn').click(()=>{
			FB.login(checkLoginState, {scope: 'email,public_profile', return_scopes: true});
		});

	};

	(function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

};


function checkLoginState(event) {
	if (event.authResponse) {

		$('#passport').val(event.authResponse.accessToken);
		$('#sign-type').val('facebook');

		if(isSignUp) {
			FB.api('/me', { fields: 'name, email, picture' }, (response) =>{
				// console.log(response);

				$('#inputEmail').val(response.email);
				$('#inputPassword').val(response.id);

				$('#profile').val(JSON.stringify({
					email : response.email,
					imageUrl : response.picture.data.url,
					name: response.name,
					password: response.id
				}));


				$('#btn-submit').click();
			});

		}else{
			$('#btn-submit').click();
		}

		
	}
	
}

function signOut() {}



export {
	initFacebookAPI
};