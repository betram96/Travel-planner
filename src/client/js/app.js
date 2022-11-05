// HTML element(s)
const weather = document.getElementById('weather');
const dest = document.getElementById('destination');
const date = document.getElementById('date');
const resultBox = document.getElementById('result');


// This function is called when the Submit button is clicked
// First, it grabs the value in the input field (URL)
// Then send this URL to the server
// The server uses this URL to send the GET request to MeaningCloud then send the info received back to client
// Lastly, client presents this info in UI
function submitText (event) {
    event.preventDefault();
    let input = {
        location: dest.value,
        date: date.value
    }
    // Make sure user enter url
    if (input.location != '' && input.date != ''){
        // Make sure departure date is formatted correctly
        let checkDate = Date.parse(input.date);
        if (isNaN(checkDate) == false){
            postLocationToServer(input)
            .then (function (data) {
                if (data.InvalidDate == true){
                    alert("Invalid departure date!");
                } else {
                    displayResults(data);
                }
            });
        }
        else {
            alert("Invalid date format. You must enter MM/DD/YYYY");
        }
    } else {
        alert("Enter location and date in input field!");
    }
}

// This method sends the inputted URL to server
const postLocationToServer = async (input = '') => {
    const postMsg = await fetch ('/getInput', {
        method: 'POST',
        credentials: 'same-origin', 
        headers: {
          'Content-Type': 'application/json'
    },
        body: JSON.stringify(input)
    });
    try {
        // Wait for server to send back response to make sure our request was successful
        const dataReceived = await postMsg.json();
        // Log this data to console for debugging
        console.log("Results: ", dataReceived);
        return dataReceived;
      } catch (e) {
        console.log("Error getting data from server: ", e);
    }
}

// Use the info sent back from server to present in the UI
const displayResults = async (data) => {
    if (data != ''){
        let parsed = "";
        if (data.days <= 7){
            parsed += "Since you're departing within 7 days, here's the current weather forecast <br/>";
        } else {
            parsed += "Since your depature is more than 7 days away, here's the weather forecast for the next 16 days <br/>";
        }

        // Remove `days` from data object
        data = {
            weather: data.weather,
            picture: data.picture
        }

        // Traverse through the weather data
        for (let i = 0; i < data.weather.length; i++){
            let weatherObj = data.weather[i];
            for (let property in weatherObj){
                parsed += (property + ": " + weatherObj[property] + "    ");
            }
            parsed += '<br/>';
        }
        
        resultBox.style.backgroundColor = "#E0FFFF";
        weather.innerHTML = parsed;

        // Display image from url
        let image = document.createElement('img');
        image.src = `${data.picture}`;
        resultBox.appendChild(image);

        // Reset input field
        dest.value = "";
        date.value = "";

    } else{
        console.log("No results available");
    }
}
export { submitText }