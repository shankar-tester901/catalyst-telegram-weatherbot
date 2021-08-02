const catalyst = require('zcatalyst-sdk-node');
var axios = require('axios');
OPENWEATHER_API_KEY = <put ur key>;
OPENWEATHER_API_URL = "http://api.openweathermap.org/data/2.5/weather?q="
TELEGRAM_API_TOKEN = '<put ur telegram token>'
let telegram_url = "https://api.telegram.org/bot" + TELEGRAM_API_TOKEN + "/sendMessage";
let openWeatherUrl = OPENWEATHER_API_URL;

module.exports = (context, basicIO) => {

    var info = basicIO.getAllArguments();

    console.log(info);


    /**This has to be executed in Postman to set the web hook. bot is followed by the telegram token
 * 
 * https://api.telegram.org/bot<token>/setwebhook
 * {
    "url": "<url of the Catalyst function call>"
}
 */

    async function getWeather(info, context) {
        console.log(info);
        var message;
        message = info.edited_message;
        console.log(message);
        if (message == undefined) {
            message = info.message;
        }
        let reply = "Welcome to telegram weather bot";
        let city_check = message.text.toLowerCase().indexOf('/');
        console.log('City check index ' + city_check);
        if (city_check == -1) {
            sendMessage(telegram_url, message.chat.id, 'Error: Try type in the format  - Check /London ', context);
        }
        if (message.text.toLowerCase().indexOf("hi") !== -1) {
            sendMessage(telegram_url, message.chat.id, reply, context);
        } else if ((message.text.toLowerCase().indexOf("check") !== -1) && (city_check !== -1)) {
            city = message.text.split('/')[1];
            console.log(city);

            get_forecast(city).then(response => {
                sendMessage(telegram_url, message.chat.id, response, context);
            });
        } else {
            reply = "Error: Try giving in the format  - Check /London ";
            sendMessage(telegram_url, message.chat.id, reply, context);

        }
    }


    function sendMessage(url, id, reply, context) {

        axios.post(url, {
            chat_id: id,
            text: reply
        }).then(response => {
            console.log("Message posted from service");
            context.close();
        }).catch(error => {
            console.log(error);
            context.close();
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
    };

    getWeather(info, context);
}
