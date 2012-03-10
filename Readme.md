# social_detector

Inspired by http://www.tomanthony.co.uk/blog/detect-visitor-social-networks/

## Usage

Simplest usage

```html
<script src="social_detector.js"></script>
<script>
	social_detector({
		facebook: 'facebook_app_id',
		vkontakte: 'vkontakte_app_id'
	});
</script>
```

## How to get appId

Described in [seomoz blog post](http://www.seomoz.org/blog/visitor-social-network-login-status-google-analytics), section "Setup a Facebook App"

## How to view report in GA

Described in [seomoz blog post](http://www.seomoz.org/blog/visitor-social-network-login-status-google-analytics) section "Setting up Google Analytics"

## Options

Required

```
facebook - Facebook appId. Required if you want detect login status for facebook.com
vkontakte - Vkontakte appId. Required if you want detect login status for vk.com (aka vkontakte.ru)
```

Optional

```
ga - Google analytics site's ID. If you set it, it will load GA script, set `_setAccount` and `_trackPageview`.
callback - Callback function. Set it if you don't want to report to GA, but process it manually
```

## TODO

  - add detection of another social networks
