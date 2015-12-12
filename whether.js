var FARENHEIT = 0,
    CELCIUS = 1;

var Weather = function(){

    var cityName = "",
        cityCoord = {},
        temp = 0,
        weatherState = "";

    this.getTemp = function() { return temp }
    this.getCityName = function() { return cityName }
    this.getCityCoord = function() { return cityCoord }
    this.getWeatherState = function() { return weatherState }

    //set a new random city
    this.setCity = function(cityID, complete) {

        var self = this; // Preserve context outside AJAX

        //call API and store to fields
        $.getJSON("http://api.openweathermap.org/data/2.5/weather?id=" + cityID + "&APPID=" + keys.weather, function(data){

            // Function calls default to "window" as their context, must specify self.
            updateCityData.call(self, data);
            complete.call(self);
        });
    }

    var updateCityData = function(data) {

        cityName = data.name;

        cityCoord = { lat: parseFloat(data.coord.lat),
                      lng: parseFloat(data.coord.lon) };

        temp = data.main.temp;

        var stateID = data.weather[0].id;
        weatherState = weatherStateList[stateID];

    }
}

var Map = function(mapID) {

    // TODO: Integrate GeoCoder API to get country name from coords

    var myOptions = {

         zoom: 5,
         center: { lat: 0, lng: 0 },

         mapTypeId: google.maps.MapTypeId.ROADMAP,
         disableDefaultUI: true,
    };

    //set the coordinate for the map
    this.setCoord = function(aLatLng) {
        myOptions.center = aLatLng;
        updateMap();
    }

    //set the zoom level for the map
    this.setZoom = function(aZoom) {
        myOptions.zoom = aZoom;
        updateMap();
    }

    var updateMap = function() {
        var map = new google.maps.Map(document.getElementById(mapID), myOptions);

        var marker = new google.maps.Marker({
            position: myOptions.center,
            map: map,
            title: 'Whether?'
        });
    }
}

var UserInterface = function() {

    var SCROLL_TEMP_RATIO = 50,
        SCROLL_DESC_RATIO = 100;

    var DRAG_TEMP_RATIO = 25,
        DRAG_DESC_RATIO = 50;

    var MIN_TEMPERATURE = -256,
        MAX_TEMPERATURE = 256;

    var scrollIncrementY = 0,
        scrollIncrementX = 0,
        dragIncrementY = 0,
        dragIncrementX = 0;

    var temp = 0,
        weatherStates = [],
        weatherStateIndex = 0;

    var element = {
        sidebar:       $("#sidebar"),
        city:          $("#sidebar h1"),
        country:       $("#sidebar h4"),
        temp:          $("#forcast .temp"),
        stateParent:   $("#forcast .state"),
        stateChild:    "<span></span>",
        icon:          $("#forcast .icon"),
        button:        $("div#board button"),
        score:         $("h2#score"),
        round:         $("h2#round")
    }

    var MIDDLE_STATE_CLASS = "m",
        RIGHT_STATE_CLASS = "r",
        LEFT_STATE_CLASS = "l";

    this.setCity = function(c) {
        // TODO: Add linebreaks to long names
        element.city.text(c);
    }
    this.setCountry = function(c) { element.country.text(c) }

    this.setWeatherState = function(a) {
        weatherStates = a;
        weatherStateIndex = 0;

        element.stateParent.children().remove();
        for (var i = 0; i < weatherStates.length; i++) {
            $(element.stateChild).appendTo(element.stateParent)
                                 .text(weatherStates[i]);
        }
        updateWeatherState();
    }

    this.setTemperature = function(t) {
        temp = t;
        element.temp.text(t);
    }

    this.getWeatherStateIndex = function() { return weatherStateIndex }
    this.getTemperature = function() { return temp }

    this.setContinueCallback = function(t, callback) {
        element.button.text(t)
                      .unbind("click")
                      .click(function() { callback() });
    }
    this.setRound = function(i, j) { element.round.text(i + "/" + j) }
    this.setScore = function(i) { element.score.text(i) }

    var changeTemperature = function(dt) {

        temp += dt;

        if (temp >= MAX_TEMPERATURE) { temp = MIN_TEMPERATURE + (temp - MAX_TEMPERATURE) }
        if (temp <= MIN_TEMPERATURE) { temp = MAX_TEMPERATURE - (MIN_TEMPERATURE - temp) }

        element.temp.text(temp);
    }

    var updateWeatherState = function() {
        element.stateParent.children().removeClass(LEFT_STATE_CLASS)
                                      .removeClass(RIGHT_STATE_CLASS)
                                      .removeClass(MIDDLE_STATE_CLASS);

        var lastIndex;
        if (weatherStateIndex >= weatherStates.length-1) { lastIndex = 0 }
        else { lastIndex = weatherStateIndex + 1 }

        var nextIndex;
        if (weatherStateIndex <= 0) { nextIndex = weatherStates.length-1 }
        else { nextIndex = weatherStateIndex - 1 }

        $(element.stateParent.children()[weatherStateIndex]).addClass(MIDDLE_STATE_CLASS);
        $(element.stateParent.children()[nextIndex]).addClass(RIGHT_STATE_CLASS);
        $(element.stateParent.children()[lastIndex]).addClass(LEFT_STATE_CLASS);
    }

    var nextWeatherState = function() {
        if (weatherStateIndex >= weatherStates.length-1) { weatherStateIndex = 0 }
        else { weatherStateIndex += 1 }

        updateWeatherState();
    }

    var lastWeatherState = function() {
        if (weatherStateIndex <= 0) { weatherStateIndex = weatherStates.length-1 }
        else { weatherStateIndex -= 1 }

        updateWeatherState();
    }

    var handleIncrements = function(incrementX,
                                    incrementY,
                                    ratioX, ratioY) {

        var resetX = false;
        var resetY = false;

        if (Math.abs(incrementY) >= ratioY) {

            var inc = 1;
            var dt = inc * (incrementY / Math.abs(incrementY));

            changeTemperature(dt);

            resetY = true;
        }
        if (Math.abs(incrementX) >= ratioX) {

            if (incrementX > 0) { nextWeatherState() } 
            else { lastWeatherState() }

            resetX = true;
        }

        return [resetX, resetY];
    }

    $(window).on('keydown', function(event) {
        switch(event.keyCode) {
            case 37:
                lastWeatherState();
                break;
            case 38:
                changeTemperature(1);
                break;
            case 39:
                nextWeatherState();
                break;
            case 40:
                changeTemperature(-1);
        }
    }).on('mousewheel', function(event) {

        scrollIncrementX -= event.deltaX;
        scrollIncrementY -= event.deltaY;

        var resetXY =
        handleIncrements.call(this, 
                              scrollIncrementX,
                              scrollIncrementY,
                              SCROLL_DESC_RATIO,
                              SCROLL_TEMP_RATIO);

        // Reset SCROLL increments
        if (resetXY[0]) { scrollIncrementX = 0 }
        if (resetXY[1]) { scrollIncrementY = 0 }
    });

    element.sidebar.bind('move', function(event) {

        dragIncrementX += event.deltaX;
        dragIncrementY -= event.deltaY;

        var resetXY =
        handleIncrements.call(this, 
                              dragIncrementX,
                              dragIncrementY,
                              DRAG_DESC_RATIO,
                              DRAG_TEMP_RATIO);

        // Reset DRAG incremenets
        if (resetXY[0]) { dragIncrementX = 0 }
        if (resetXY[1]) { dragIncrementY = 0 }
    });
}

var MakeRoundAction = function(userInterface, map, weather) {

    var WEATHER_STATE_OPTIONS = 10,
        MINIMUM_TEMP_K = 300,
        MAXIMUM_TEMP_K = 300;

    var city = "",
        coord = {},
        coordString = "",
        temp = 0,
        initialTemp = 0,
        weatherStates = [],
        correctStateIndex = 0;

    this.setLocale = function(i) { locale = i }

    this.execute = function(complete) {

        // Preserve context
        var self = this;

        weather.setCity(getRandomCityID(), function() {

            makeStates.call(self);

            updateInterface.call(self);
            updateMap.call(self);

            complete(temp, correctStateIndex);
        });
    }

    var getRandomCityID = function() {

        var cityIDList = storedIDList;
        var cityLength = cityIDList.length;

        var randomCityID = 0;

        var r = Math.random();

        for(var i = 0; i < cityLength; i++){
            if( i / cityLength <= r && r < (i + 1) / cityLength){
                randomCityID = cityIDList[i];
                break;
            }
        }

        return randomCityID;
    }

    var convertTemperature = function(t1) {
        var t2 = 0;
        switch(locale) {
            case FARENHEIT:
                t2 = Math.round(1.8*(t1-273.15)+32);
                break;
            case CELCIUS:
                t2 = Math.round(t1 - 273.15);
                break;
            default:
                t2 = Math.round(t1);
                break;
        }
        return t2;
    }

    var getRandomTemp = function() {

        var r = Math.random();
        var t = Math.floor(r * (MAXIMUM_TEMP_K-MINIMUM_TEMP_K)) + MINIMUM_TEMP_K;

        return convertTemperature.call(this,t);
    }

    var makeStates = function() {

        var tempK = weather.getTemp(),
            cityName = weather.getCityName(),
            coordObj = weather.getCityCoord(),
            weatherState = weather.getWeatherState();

        city = cityName;
        coord = coordObj;
        coordString = coordObj.lat + ", " + coordObj.lng;

        temp = convertTemperature.call(this, tempK);
        initialTemp = getRandomTemp.call(this);

        var keys = Object.keys(weatherStateList);

        for (var i = 0; i < WEATHER_STATE_OPTIONS-1; i++) {
            var newState = weatherStateList[keys[ keys.length * Math.random() << 0]];

            if (weatherStates.indexOf(newState) >= 0 ||
                newState == weatherState) {
                i -= 1;
            } else {
                weatherStates.push(newState);
            }
        }

        var randIndex = Math.floor(Math.random()*WEATHER_STATE_OPTIONS);
        weatherStates.splice(randIndex, 0, weatherState);
        correctStateIndex = randIndex;
    }

    var updateInterface = function() {
        userInterface.setCity(city);
        userInterface.setCountry(coordString);
        userInterface.setWeatherState(weatherStates);
        userInterface.setTemperature(initialTemp);
    }

    var updateMap = function() { map.setCoord(coord) }
}

var ScoreRoundAction = function(userInterface) {

    var MAXIMUM_DIFFERENCE = 40,
        STATE_MULTIPLIER = 2,
        SCORE_EXPONENT = 3.5,
        SCORE_MAXIMUM = 100;

    var correctTemp = 0;
    var correctStateIndex = 0;

    var locale;

    var score = 0;

    this.setCorrectTemp = function(t) { correctTemp = t }
    this.setCorrectStateIndex = function(i) { correctStateIndex = i }
    this.setLocale = function(l) { locale = l }
    
    this.getMaxScore = function() { return SCORE_MAXIMUM * STATE_MULTIPLIER}

    this.execute = function(complete) {
        var temp = userInterface.getTemperature();
        var stateIndex = userInterface.getWeatherStateIndex();

        var diff = 0;

        if (locale == FARENHEIT) {
            diff = Math.abs(correctTemp*(5/9) - temp*(5/9));
        } else {
            diff = Math.abs(correctTemp - temp);
        }

        if (diff <= MAXIMUM_DIFFERENCE){
            score = Math.round(Math.pow( ( (MAXIMUM_DIFFERENCE - diff) / MAXIMUM_DIFFERENCE ), SCORE_EXPONENT ) * SCORE_MAXIMUM);
        } 
        else { score = 0 }

        if (stateIndex == correctStateIndex) { score *= STATE_MULTIPLIER }

        score = Math.floor(score);

        complete(score);
    }
}

var ScoreGameAction = function(userInterface, scoreMax) {
    var TOTAL_ROUNDS = 10;

    var score = 0,
        round = 0,
        scoreMax = scoreMax;

    this.execute = function(s) {
        score += s;
        round += 1;
        userInterface.setScore(score, scoreMax);
        userInterface.setRound(round, TOTAL_ROUNDS);
    }
    this.getScore = function() { return score }
    this.getRound = function() { return round }
    this.getShouldContinue = function() { return round < TOTAL_ROUNDS }
}

var Game = function() {

    var locale = FARENHEIT;

    var userInterface = new UserInterface();
    var map = new Map("map");
    var weather = new Weather();

    var makeRound = new MakeRoundAction(userInterface, map, weather);
    var scoreRound = new ScoreRoundAction(userInterface);

    var scoreMax = scoreRound.getMaxScore();
    makeRound.setLocale(locale);

    var scoreGame = new ScoreGameAction(userInterface, scoreMax);

    var roundSequence = function() {
        makeRound.execute(function(correctTemp, correctStateIndex) {
            scoreRound.setCorrectTemp(correctTemp);
            scoreRound.setCorrectStateIndex(correctStateIndex);
            scoreRound.setLocale(locale);
        });
        userInterface.setContinueCallback("guess", function() {
            scoreRound.execute(function(score) {
                scoreGame.execute(score);
                userInterface.setContinueCallback("continue", function() {
                    if (scoreGame.getShouldContinue()) {
                        roundSequence(); // recursion!
                    }
                });
            });
        });
    }
    roundSequence();
}

$(document).ready(function() {
    var whether = new Game();
});