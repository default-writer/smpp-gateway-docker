var express = require("express");
var bodyParser = require("body-parser");
var api = require("./api");
var app = express();

// create application/json parser
var jsonParser = bodyParser.json();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

api(app, jsonParser);

var server = app.listen(3000, function () {
    console.log("listen at port ", server.address().port);
});
