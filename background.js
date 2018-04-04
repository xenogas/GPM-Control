var listener = function(details) {
	console.log(`loading: ${details.url}`);
	if( details.method == "POST" ) {
		// console.log(details.requestBody.formData);
		var body = details.requestBody.formData;
		// the data is now available as body.title[0]
		// its in an array in case the same key is used multiple
		// times in the request.  Since we will only be using
		// each as a single element, we can safely just reference [0]
		console.log(body);
	}
}
var filter = {
	// urls: ['<all_urls>']
	urls: ['*://*.totumiter.com/*']
};

function extractRequestData(request) {
	console.log(request.formData);
}

browser.webRequest.onBeforeRequest.addListener(
	listener,
	filter,
	['blocking', 'requestBody']
);
console.log('extension loaded');