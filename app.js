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
			//console.log('Response from remote service: %s',JSON.stringify(obj));
			location = obj.location;

			console.log('Here I should publish that user: %s is in %s',username,location);

			res.send(200, obj);
		});
		
	});

	return next();
 });

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
