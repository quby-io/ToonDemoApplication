var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    querystring = require('querystring'),
    url = require('url'),
    app = express(),
    api = express(),
    http = require('http'),
    https = require('https'),
    auth = new require('./auth');

const SERVERPORT = 3001;
const WEBPORT = 8080;

if (!auth.APIKEY || !auth.APISECRET) {
    console.error('You haven\'t supplied the application with the needed APIKEY or APISECRET credentials');
    process.exit(1);
}

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({extended: false}));
api.use(methodOverride());

api.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

api.get('/login', function (req, res) {

    console.log('Received a request for a new token!');
    auth.username = auth.username || req.body.username;
    auth.password = auth.password || req.body.password;

    if (!auth.username || !auth.password) {
        res.status(500);
        res.send('Username or Password is missing!');
        return;
    }

    var postData = querystring.stringify({
        'username': auth.username,
        'password': auth.password,
        'grant_type': 'password'
    });

    var options = {
        host: 'api.toonapi.com',
        port: 443,
        path: '/token',
        method: 'POST',
        rejectUnauthorized: false,
        requestCert: true,
        agent: false,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'Authorization': 'Basic ' + new Buffer(auth.APIKEY + ":" + auth.APISECRET).toString('base64')
        }
    };

    var tokenRequest = https.request(options, function (tokenRes) {
        console.log('STATUS: ' + tokenRes.statusCode);
        console.log('HEADERS:' + tokenRes.headers);
        tokenRes.setEncoding('utf8');

        if (tokenRes.statusCode == 200) {
            tokenRes.on('data', function (chunk) {
                console.log("Got token :" + chunk);
                res.json(chunk);
            });

        } else {
            console.error("Error getting the token");
            tokenRes.on('data', function (chunk) {
                res.status(500);
                res.json(chunk);
            });
        }
    });

    tokenRequest.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        console.log(JSON.stringify(e, null, 4));
        res.status(500);
        res.send(JSON.stringify(e, null, 4));
    });

    tokenRequest.write(postData);
    tokenRequest.end();

});

api.listen(SERVERPORT);
console.log('Api started on *:' + SERVERPORT);

app.use(express.static(__dirname + '/public'));
app.listen(WEBPORT);
console.log('Webserver started on *:' + WEBPORT);
