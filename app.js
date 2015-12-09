var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    querystring = require('querystring'),
    url = require('url'),
    app = express(),
    api = express(),
    http = require('http'),
    https = require('https');

console.log("Starting server!");

app.use(express.static(__dirname + '/public'));
app.use(bodyParser());
app.use(methodOverride());

api.use(bodyParser());
api.use(methodOverride());

api.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

// ***************************************************
// TODO: Authentication (OAUTH token retrieval) method
// Replace the values in lines #37, #38, #52
// ***************************************************
api.get('/login', function (req, res) {
console.log('going!');

        console.log("Got request to retrieve token!");
        var postData = querystring.stringify({
            'username': '<username>',
            'password': '<password>',
            'grant_type': 'password'
        });

        var options = {
            host: 'api.toonapi.com',
            port: 443,
            path: '/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
                // Generate your basic authenticatio credentials by using your consumer key as username and consumer secret as password
                // Concatenade both fields <key>:<secret> and encode in base64
//                'Authorization':'Basic <base 64 encoded consumer key and secret>'
                'Authorization':'Basic <authorization header>'
            }
        };

        var tokenRequest = https.request(options, function (tokenRes) {
            console.log('STATUS: ' + tokenRes.statusCode);
            console.log('HEADERS: ' + JSON.stringify(tokenRes.headers));
            tokenRes.setEncoding('utf8');
            tokenRes.on('data', function (chunk) {
                console.log("Got token :" + JSON.stringify(chunk));
                res.send(JSON.stringify(chunk));
            });
        });

        tokenRequest.on('error', function (e) {
            console.log('problem with request: ' + e.message);
            console.log(JSON.stringify(e, null, 4));
            res.send(JSON.stringify(e, null, 4));
        });

        tokenRequest.write(postData);
        tokenRequest.end();

});

api.listen(3001);
app.listen(80);
