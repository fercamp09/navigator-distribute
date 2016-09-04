// Copyright 2015-2016, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START app]
'use strict';

// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
var PubSub = require('@google-cloud/pubsub');

// Instantiate a pubsub client
var pubsubClient = PubSub({
	projectId: 'navigator-cloud',
	keyFilename: 'navigator-cloud-0137da819614.json'
});

var topic = pubsubClient.topic('navigator-location');

var restify = require('restify');

var server = restify.createServer();

// Creates a JSON client
var client = restify.createJsonClient({
  url: 'http://104.154.240.176:18003'
});

var username, location;

server.post('/track', function track(req, res, next) {
	var data = new Buffer('');

	req.on('data', function (chunk) {
		data = Buffer.concat([chunk,data]);
	});

	req.on('end', function () {
		var jsonData = JSON.parse(data);
		username = jsonData.username;

		client.post('/track', jsonData, function(error, request, response, obj){
			location = obj.location;

			var message = {username: username, location: location, timestamp: new Date()};

			topic.publish({
				data: message
			}, function(err) {});

			res.send(200, obj);
		});
		
	});

	return next();
 });

server.listen(8080, function() {
 	console.log('%s listening at %s', server.name, server.url);
});

//This code is only for testing purposes, it should be commented out while on production
// topic.subscribe('navigator-location', {reuseExisting: true, autoAck: true}, function(err, subscription) {
// 	// Register listeners to start pulling for messages.
// 	function onError(err) {}
// 	function onMessage(message) {
// 		console.log('Subscription message: %s',JSON.stringify(message));
// 	}
// 	subscription.on('error', onError);
// 	subscription.on('message', onMessage);
// });
