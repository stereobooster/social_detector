/**
 * https://github.com/stereobooster/social_detector
 * v0.1.0
 */
(function (window, undefined) {
	var document = window.document,
	load_script = function(src){
		var t = 'script',
		g=document.createElement(t),
		s=document.getElementsByTagName(t)[0];
		g.src=src;
		s.parentNode.insertBefore(g,s);
	},
	detectors_loaded,
	detectors_total = 0,
	login_status = function(network, status) {
		detectors_loaded+=1;
		window._gaq.push(['_setCustomVar', detectors_loaded, network + '_State', (status ? '' : 'Not') + 'LoggedIn', 1]);
		if (detectors_loaded >= detectors_total) {
			window._gaq.push(['_trackEvent', 'Social', 'Detection', undefined,  undefined, true]);
		}
	},
	img = function(src, name){
		var i = new Image();
		i.onload=function(){login_status(name, true); i = i.onload = i.onerror = undefined; };
		i.onerror=function(){login_status(name, false); i = i.onload = i.onerror = undefined; };
		i.src=src;
	},
	detectors = {
		google: {
			img_url: 'https://accounts.google.com/CheckCookie?continue=https://www.google.com/intl/en/images/logos/accounts_logo.png'
		},
		google_plus: {
			img_url: 'https://plus.google.com/up/?continue=https://www.google.com/intl/en/images/logos/accounts_logo.png&type=st&gpsrc=ogpy0'
		},
		twitter: {
			img_url: 'https://twitter.com/login?redirect_after_login=%2Fimages%2Fspinner.gif'
		},
		facebook: {
			src: '//connect.facebook.net/en_US/all.js',
			init: function(name){
				window.fbAsyncInit = function(){
					FB.init({ appId:this.appId, status:true, cookie:true, xfbml:true});
					FB.getLoginStatus(function(response){
						login_status(name, response.status!=='unknown');
					});
				};
			}
		},
		vkontakte: {
			src: 'http://vkontakte.ru/js/api/openapi.js',
			init: function(name){
				window.vkAsyncInit = function() {
					VK.init({ apiId: this.appId });
					VK.Auth.getLoginStatus(function(response) {
						login_status(name, response.session);
					});
				};
			}
		}
	},
	detector,
	init = function () {
		detectors_loaded = 0;
		for (var detector_name in detectors) {
			detector = detectors[detector_name];
			detectors_total+=1;
			if (detector.appId) {
				load_script(detector.src);
				detector.init(detector_name);
			} else if (detector.img_url) {
				img(detector.img_url, detector_name);
			} else {
				detectors_loaded+=1;
			}
		}
	},
	social_detector = function (options) {
		window._gaq = window._gaq || [];
		if (options.ga) {
			window._gaq.push(['_setAccount', options.ga]);
			window._gaq.push(['_trackPageview']);
			load_script(('https:'===location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js');
		}
		if (options.facebook) {
			detectors.facebook.appId = options.facebook;
		}
		if (options.vkontakte) {
			detectors.vkontakte.appId = options.vkontakte;
		}
		if (options.callback) {
			login_status = options.callback;
		}
		init();
	};
	window.social_detector = social_detector;
}(window));
