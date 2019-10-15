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

if (!auth.personal_access_token) {
    console.error('You haven\'t supplied the application with the needed personal_access_token');
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

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

api.get('/login', function (req, res) {

    console.log('Received a request for a new token!');
    res.json(JSON.stringify({ "access_token" : auth.personal_access_token}));

});

api.listen(SERVERPORT);
console.log('Api started on *:' + SERVERPORT);

app.use(express.static(__dirname + '/public'));
app.listen(WEBPORT);
console.log('Webserver started on *:' + WEBPORT);
