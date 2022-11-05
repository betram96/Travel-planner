const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const fetch = require("node-fetch");
const cors = require('cors');
dotenv.config();

// Initialize app
const app = express();

// Configure express to use body-parser as middle-ware.
app.use ( bodyParser.urlencoded({ extended: false }) );
app.use ( bodyParser.json() );
// Configure express to use cors
app.use( cors() );

// Initialize the project folder
app.use(express.static('dist'))

// Create server listening on port 3000
const port = 3000;
app.listen(port, function () {
    console.log(`Running localhost: ${port}`)
});

app.get('/', (request, response) => {
    response.sendFile('dist/index.html');
});

/* GeoNames url and key
   Example: http://api.geonames.org/searchJSON?q=paris&maxRows=1&username=<USERNAME>
*/
const geo_url  = 'http://api.geonames.org/searchJSON?q=';
const geo_key = process.env.GEO_USERNAME;

/* WeatherBit url and key
   Example: https://api.weatherbit.io/v2.0/current?lat=35.7796&lon=-78.6382&key=<KEY>&include=minutely
*/
const weather_url_current = 'https://api.weatherbit.io/v2.0/current?'
const weather_url_forecast = 'https://api.weatherbit.io/v2.0/forecast/daily?'
const weather_key = process.env.WEATHERBIT_KEY;

/* Pixabay url and key
   Example: https://pixabay.com/api/?key=<KEY>&q=london&image_type=photo
*/
const pixabay_url = 'https://pixabay.com/api/?key='
const pixabay_key = process.env.PIXABAY_KEY;

// Retrieve the location sent from client and send request to GeoNames for lat/long coordinates
app.post('/getInput', async (req, res) => {
    // Retrieve the location and date inside the body of the request
    let location = req.body.location;
    let date = req.body.date;

    // Display the data received on terminal console
    console.log("Location received from client: ", location);
    console.log("Departure date received from client: ", date);
    
    // Declare local data variables
    let geo_info = {};
    let weather_info = [];
    let pic_url = {};

    // Create a GET request and send request to GeoNames
    let geo_apiCall = geo_url + location + "&maxRows=1&username=" + geo_key;
    console.log("Sending API call ", geo_apiCall);

    getAPIData(geo_apiCall)
    // Extract lat/long from the data received from GeoNames
    .then ( function(data) {
        geo_info = {
          lat: data.geonames[0].lat,
          long: data.geonames[0].lng
        }    
    
        // Check the date (1) if it is < 7 days away , get the current weather, (2) if it is > 7 days away, get forecasted weather
        let daysAway = calDaysDiff(date);

        let weather_apiCall;
        // Use the coordinates retrieved from GeoNames API, make a request to WeatherBit
        if (daysAway < 0){
          // Alert client if departure date is invalid
          res.send({InvalidDate: true});
          return;
        } else if (daysAway >= 0 && daysAway <= 7){
          weather_apiCall = weather_url_current + "lat=" + geo_info.lat + "&lon=" + geo_info.long + "&key=" + weather_key;
        } else {
          weather_apiCall = weather_url_forecast + "lat=" + geo_info.lat + "&lon=" + geo_info.long + "&key=" + weather_key;
        }
          console.log("Sending API call ", weather_apiCall);
        getAPIData(weather_apiCall)
        // Extract the weather info
        .then ( function(data) {
          
          // Create an array of 16-day forecasted weather
          for (let i=0; i < data.data.length; i++){
            one_weather = {
              Date: data.data[i].datetime,
              Weather: data.data[i].weather.description
            }
            weather_info.push(one_weather);
          }
          
      
        // Now make a request to Pixabay
        let pixabay_apiCall = pixabay_url + pixabay_key + "&q=" + location;
        console.log("Sending API call ", pixabay_apiCall);
        getAPIData(pixabay_apiCall)
        // Extract lat/long from the data received from GeoNames
        .then ( function(data) {
          pic_url = {
            picture: data.hits[0].webformatURL
          }
          
      
        //Compile weather and picture data
        let data_holder = {
          days: daysAway,
          weather: weather_info,
          picture: pic_url.picture
        }

        //Send all data to client
        console.log("Sending this data to client: ", data_holder);
        res.send(data_holder);
      });
    });
  });
});


// Check if the departure date is within 7 days
function calDaysDiff (departure_date) {
  departure_date = new Date(departure_date);
  let today = new Date();
  let daysDiff = Math.floor((Date.UTC(departure_date.getFullYear(), departure_date.getMonth(), departure_date.getDate()) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) ) /(1000 * 60 * 60 * 24));
  return daysDiff;
}

// GET function to request info from GeoNames using entered location by user
const getAPIData = async (getRequest)=>{
    // Fetch the data from the web api
    const rawDataFromAPI = await fetch (getRequest);
    try {
      const dataInJson = await rawDataFromAPI.json();
      // Return to this data in order to pass it to the next promise call
      return dataInJson;
    } catch (e){
      console.log("Error getting data from API ", e);
    }
}