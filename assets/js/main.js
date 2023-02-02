$("document").ready(function () {
    /* ************************* Global Variables ************************* */
    var city;
    const apiKey = "af52c19731d2e5e20addf72f208445a9";
    let queryURL;
    let ajaxFlag = 0;
    let citiesSearchedObject = {};
    let citiesSearchedObjectsArray = [];
//   main functions
    function initialize() {
      loadCities();
    }
    function runQ(url, thenFunction) {
      $.ajax({
        url: url,
        method: "GET",
      }).then(function (response) {
        if (thenFunction) {
          thenFunction(response);
        } else {
          return response;
        }
      });
    }
    // load list of cities
    function loadCities() {
      $(".listSearchedCities").empty();
      // load cities from localStorage
      if (localStorage.getItem("searchedCitiesObjects")) {
        citiesSearchedObjectsArray = localStorage.getItem(
          "searchedCitiesObjects"
        );
        citiesSearchedObjectsArray = JSON.parse(citiesSearchedObjectsArray);
        // show when city is searched
        if (citiesSearchedObjectsArray) {
          citiesSearchedObjectsArray.forEach(function (object) {
            var newSearchedCity = $("<a>");
            newSearchedCity.attr("href", "#");
            newSearchedCity.attr("searchedCity", object.city);
            newSearchedCity.attr(
              "class",
              "list-group-item list-group-item-action list-group-item-light listItemSearchedCity"
            );
            newSearchedCity.text(object.city);
            $(".listSearchedCities").append(newSearchedCity);
          });
          displayCityInCurrentWeather(
            citiesSearchedObjectsArray[0].city,
            citiesSearchedObjectsArray[0].data
          );
        }
      } else {
        citiesSearchedObjectsArray = [];
      }
      $(".listSearchedCities").hide();
      $(".listSearchedCities").fadeIn(1000);
    }
  
    function displayCityInSearchedCities(res) {
      $("#cityInput").val("");
      // add city
      citiesSearchedObject = {
        city: city,
        data: res,
      };
      citiesSearchedObjectsArray.unshift(citiesSearchedObject);
      // save city data to localStorage
      var citiesSearchedObjectsArrayString = JSON.stringify(
        citiesSearchedObjectsArray
      );
      localStorage.setItem(
        "searchedCitiesObjects",
        citiesSearchedObjectsArrayString
      );
      // add new city to list!
      var newSearchedCity = $("<a>");
      newSearchedCity.attr("href", "#");
      newSearchedCity.attr("searchedCity", city);
      newSearchedCity.attr(
        "class",
        "list-group-item list-group-item-action list-group-item-light listItemSearchedCity"
      );
      newSearchedCity.text(city);
      $(".listSearchedCities").prepend(newSearchedCity);
      $(".listSearchedCities").hide();
      $(".listSearchedCities").fadeIn(1000);
      displayCityInCurrentWeather(
        citiesSearchedObjectsArray[0].city,
        citiesSearchedObjectsArray[0].data
      );
    }
// for current city
    function displayCityInCurrentWeather(city, cityData) {
      var current=cityData.list[0];
    //   console.log(current);
      date = new Date(current.dt * 1000);
      var utc_date = date.toUTCString();
      date = moment.utc(utc_date);
      date = date.format("MMMM Do YYYY");
      var icon = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
      temp = 1.8*(current.main.temp - 273.15).toFixed(1)+32+ " ºF";
      wind = current.wind.speed + " MPH";
      humid = current.main.humidity + "%";
    // show in DOM 
      $(".currentData .city").text(city);
      $(".currentData .date").text(date);
      $(".currentData .icon").attr("src", icon);
      $(".currentData .icon").show();
      $(".currentData .weather").text(
        "Weather: " + current.weather[0].description
      );
      $(".currentData .temp").text("Temp: " + temp);
      $(".currentData .humid").text(
        "Humidity: " + humid
      );
      $(".currentData .wind").text(
        "Wind speed: " + wind
      );
      $(".currentData").hide();
      $(".currentData").fadeIn(1000);
      displayForcastDay(cityData);
    }
  
// for the 5-day forecast
    function displayForcastDay(cityData) {
      cityData = cityData.list;
      cityData.forEach(function (dayData, index) {
        if (index == 6 || index%8 == 6) {
            // console.log(index);
            // console.log(dayData);
          date = new Date(dayData.dt * 1000);
          var utc_date = date.toUTCString();
          date = moment.utc(utc_date);
          date = date.format("MMMM Do YYYY");
        //   console.log(date);
          var icon = `https://openweathermap.org/img/wn/${dayData.weather[0].icon}@2x.png`;
          var temp = 1.8*(dayData.main.temp - 273.15).toFixed(1)+32 + "ºF";
          var humid = dayData.main.humidity + "%";
          var windSpeed = dayData.wind.speed + " MPH";

          // show in DOM
          var i = (index - 6)/8;
          $(".forecast .date").eq(i).text(date);
          $(".forecast .icon").eq(i).attr("src", icon);
          $(".forecast .icon").eq(i).show();
          $(".forecast .temp").eq(i).text("Temp: " + temp);
          $(".forecast .wind").eq(i).text("Wind: " + windSpeed);
          $(".forecast .humid").eq(i).text("Humidity: " + humid); 
        }
      });
      $(".forecast").hide();
      $(".forecast").fadeIn(1000);
    }
    function getData(res) {
      if (ajaxFlag === 0) {
        ajaxFlag = 1;
        // get api & city data
        queryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${res.coord.lat}&lon=${res.coord.lon}&appid=${apiKey}`;
        runQ(queryURL, getData);
      } else {
        displayCityInSearchedCities(res);
      }
    }
    /* ************************* Event Listeners ************************* */
    initialize();
    // what happens when city search button is clicked
    $("#searchBtn").on("click", function (event) {
      event.preventDefault();
      city = $("#cityInput").val();
      ajaxFlag = 0;
      // get long and lat for city
      queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
      runQ(queryURL, getData);
    });
    // what happens when existing city button is clicked - show that city's data on page
    $(".listSearchedCities").on("click", function (event) {
      citiesSearchedObjectsArray.forEach(function (object) {
        if (object.city === $(event.target).attr("searchedcity")) {
          displayCityInCurrentWeather(object.city, object.data);
        }
      });
    });
  });