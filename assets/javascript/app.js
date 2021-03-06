$(document).ready(function () {

    /*
    =======================================
    Global Variables
    =======================================
    */

    var currencyCode;
    var currencyName;
    var langCode;
    var langName;
    var translateText;
    var currentRate;

    var phrases = [
        "Where can I find an ATM?",
        "Can you tell me where the bank is?",
        "How much does a taxi cost?",
        "Do you accept credit cards?"
    ];

    /*
    =======================================
    OpenWeather API Call
    =======================================
    */

    $("#search").on("click", function () {

        event.preventDefault();

        // Reset Result DOM
        var $p = $("<p>").text("How much to bring.").addClass("white-text").addClass("rate");
        $("#result").empty();
        $("#result").append($p);

        // Create API Query String
        var city = $("#city").val();
        var fahrenheit = "&units=imperial";
        var corsAnywhereUrl = "https://cors-anywhere.herokuapp.com/";
        var apiKey = "c7ff544129cc1648ae3d73196115dbe7";
        var queryURL = corsAnywhereUrl + "http://api.openweathermap.org/data/2.5/weather?q=" + city + fahrenheit + "&APPID=" + apiKey;

        // Clear input field
        $("#city").val("");

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            // Gets country code
            var countryCode = response.sys.country;

            // Gets city name
            var cityName = response.name;

            //Logs Weather
            $("#description").text(response.weather[0].description);

            //logs humidity
            $("#humidity").text("Humidity:  " + response.main.humidity + '%');

            //logs temperature
            $("#temperature").text(response.main.temp + " °F");
            $("#temperature-max").text("Hi: " + response.main.temp_max + " °F");
            $("#temperature-min").text("Lo: " + response.main.temp_min + " °F");

            //Weather Icons
            var iconcode = response.weather[0].icon;
            var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
            var image = $("<img>").attr("src", iconurl).addClass('iconCSS');
            $('#icon').empty();
            $('#icon').append(image);

            // Clears location
            $("#location").empty();

            // Prints Location
            $("#location").append(cityName + ", " + countryCode);

            /*
            =======================================
            Exchange Rate API Call
            =======================================
            */
            var exchangeURL = "https://openexchangerates.org/api/latest.json?app_id=d598f2604826443ebf4e5fef59e51d90";

            // Get currency code and name
            getCodes(countryCode, countryToCode);

            $.ajax({
                url: exchangeURL,
                method: "GET"
            }).then(function (response) {
                // Matches user search to object in currency_codes.js
                for (i in response.rates) {
                    if (i === currencyCode) {
                        // Empties old calculation
                        $("#currency").empty();

                        // Stores new rate
                        currentRate = (Math.round(response.rates[i] * 100) / 100).toLocaleString();

                        // Creates element
                        var $currentRate = $("<p>").text("Rate: " + currentRate + " " + currencyName).addClass("rate");

                        // Appends rate to the DOM
                        $("#currency").append($currentRate);
                    }
                }
            });

            /*
            =======================================
            Translation API Call
            =======================================
            */
            var translateKey = "trnsl.1.1.20190201T052022Z.ae090add23877f52.1b85d9520f4a032cb3316ad3fde315f2aad06966";
            var translateURL;

            // Empties old phrases
            $("#phrases").empty();

            // Loops through phrases array and calls API for each
            for (var i = 0; i < phrases.length; i++) {
                translateText = phrases[i];
                translateURL =
                    "https://translate.yandex.net/api/v1.5/tr.json/translate?key=" +
                    translateKey +
                    "&text=" +
                    translateText +
                    "&lang=" +
                    langCode;
            
                getTranslation(i, translateURL);
            }
        // Error modal if location can't be found or API throws a 404
        }).fail(function () {
            $("#modal1").modal();
            $("#modal1").modal('open');
        });
    });

    /*
    =======================================
    Rate Calculation | Click Handler
    =======================================
    */

    $("#convert").on("click", function() {
        event.preventDefault();

        // Empty Result DOM
        $("#result").empty();

        // Get user input
        var USD = parseInt($("#money").val());

        // Error Modal if entry is blank or NaN
        if (isNaN(USD)) {
            $("#modal2").modal();
            $("#modal2").modal('open');
            $("#money").val("");

            // Reset Result DOM
            var $p = $("<p>").text("How much to bring.").addClass("white-text").addClass("rate");
            $("#result").empty();
            $("#result").append($p);
        } else {
            // Calcualted result
            var result = Math.round(USD * currentRate.replace(",", "")).toLocaleString();

            // Calculate amount in local currency
            var $amountToBring = $("<p>").text("Bring: " + result + " " + currencyName).addClass("white-text");

            // Print to DOM
            $("#result").append($amountToBring).addClass("rate");

            // Clear user input
            $("#money").val("");
        }
    });

    /*
    =======================================
    Function Declarations
    =======================================
    */

    // Find Currency Code from Country Code
    function getCodes(countryCode, countryToCode) {
        for (i in countryToCode) {
            if (i === countryCode) {
                currencyCode = countryToCode[i].CurrencyCode;
                currencyName = countryToCode[i].CurrencyName;
                langCode = countryToCode[i].LangCode;
                langName = countryToCode[i].LangName;
            }
        }
    }

    // Makes translation API call and prints to DOM
    function getTranslation(index, translateURL) {
        $.ajax({
            url: translateURL,
            method: "GET"
        }).then(function (response) {
            // Creates elements for DOM
            var $br = $("<br>");
            var $p = $("<p>");
            var $hr = $("<hr>");
            var $engPhrase = $("<span>").text(phrases[index]).addClass("phrase").addClass("it");
            var $translatedPhrase = $("<span>").text(response.text).addClass("phrase");

            var $phraseGroup = ($p).append($engPhrase).append($br).append($translatedPhrase).append($hr);
            
            $("#phrases").append($phraseGroup);

        });
    }
});