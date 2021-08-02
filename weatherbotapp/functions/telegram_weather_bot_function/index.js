var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var axios = require('axios');
OPENWEATHER_API_KEY = '<put ur key>'
OPENWEATHER_API_URL = "http://api.openweathermap.org/data/2.5/weather?q="
TELEGRAM_API_TOKEN = '<put ur telegram token>'
let telegram_url = "https://api.telegram.org/bot" + TELEGRAM_API_TOKEN + "/sendMessage";
let openWeatherUrl = OPENWEATHER_API_URL;

app.use(express.json());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.post("/", function(req, res) {
    console.log(req.body);
    var message;

    message = req.body.edited_message;
    console.log(message);
    if (message == undefined) {
        message = req.body.message;
    }
    let reply = "Welcome to telegram weather bot";
    let city_check = message.text.toLowerCase().indexOf('/');
    console.log('City check index ' + city_check);
    if (city_check == -1) {
        sendMessage(telegram_url, message.chat.id, 'Error: Try giving in the format Check /London ', res)
    }
    if (message.text.toLowerCase().indexOf("hi") !== -1) {
        sendMessage(telegram_url, message.chat.id, reply, res);
    } else if ((message.text.toLowerCase().indexOf("check") !== -1) && (city_check !== -1)) {
        city = message.text.split('/')[1];
        console.log(city);

        get_forecast(city).then(response => {
            sendMessage(telegram_url, message.chat.id, response, res)
        });
    } else {
        reply = "Error: Try giving in the format Check /London ";
        sendMessage(telegram_url, message.chat.id, reply, res);
        return res.end();

    }
});


function sendMessage(url, id, reply, res) {

    axios.post(url, {
        chat_id: id,
        text: reply
    }).then(response => {
        console.log("Message posted");
        res.end("ok");
    }).catch(error => {
        console.log(error);
    });
}


function get_forecast(city) {
    let new_url = openWeatherUrl + city + "&appid=" + OPENWEATHER_API_KEY;
    console.log(new_url);
    return axios.get(new_url).then(response => {
        let temp = response.data.main.temp;
        //converts temperature from kelvin to celsuis
        temp = Math.round(temp - 273.15);
        let city_name = response.data.name;
        let resp = "It's " + temp + " degrees in " + city_name;
        return resp;
    }).catch(error => {
        console.log(error);
        return "City not found";

    });
}
module.exports = app;
