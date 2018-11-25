  // Load in the required modules
  const NativeUI = require('NativeUI');
  const TouchGestures = require('TouchGestures');
  const Networking = require('Networking');
  const Reactive = require('Reactive');
  const Scene = require('Scene');
  const Diagnostics = require('Diagnostics');
  const Time = require('Time');

  // Variables
  const textFromUser  = 'userInput';
  const message = 'whereRequest';
  const urlGet = 'https://f2eb9537.ngrok.io/v1/getGeolocation/15';
  const urlPost = 'https://f2eb9537.ngrok.io/v1/postHaiku';
  const urlClosest = 'https://f2eb9537.ngrok.io/v1/getClosestHaiku/15';
  const line1 = '3dHaikuLine1';
  const line2 = '3dHaikuLine2';
  const line3 = '3dHaikuLine3';
  const longitude = '';
  const latitude = '';
  const request = {
    method: 'POST',
    body: JSON.stringify({text: textFromUser, latitude: latitude, longitude: longitude, mood: userMood}),
    headers: {'Content-type': 'application/json; charset=UTF-8'}
  }
  const userMood = 'userMood';
  const latitudeClosest = '';
  const longitudeClosest = '';
  const closestHaiku = '';
  const closestMood = '';
  const dist = 100;
  const distanceToClosestHaiku = 'distToClosest';
  const particles1 = 'emitter1';
  const particles2 = 'emitter2';

  //Assingments
  userMood = 1;

  //Functions
  function parseLines(haikuLinesSeparatedWithDot){
    var arr = haikuLinesSeparatedWithDot.split(".");
    NativeUI.setText(line1, arr[0]);
    NativeUI.setText(line2, arr[1]);
    NativeUI.setText(line3, arr[2]);
    NativeUI.setText(distanceToClosestHaiku, '');
  }
  function getLocation(){
    // Perform network request with Networking module
    Networking.fetch(urlGet).then(function(result) {
      // The result object contains information about the request,
      // such as status code and response body.
      if ((result.status >= 200) && (result.status < 300)) {
        // If the request was successful, we'll chain the JSON forward
        return result.json();
      }
      // If the request was not successful, we should throw an error
      throw new Error("HTTP status code " + result.status);
    }).then(function(json){
      latitude = json.latitude;
      longitude = json.longitude;
    }
    ).catch(function(error) {
      // Here we process any errors that may happen with the request
      message.text = error.message;
    });
  }
  function postHaiku(){
    Networking.fetch(urlPost, request).then(function(result){
      Diagnostics.log(result.status);
      if ((result.status >= 200) && (result.status < 300)) {
        // If the request was successful, we'll chain the JSON forward
          Diagnostics.log(result);
          Diagnostics.log(result.json());
      }
    });
  }
  function getClosestHaiku(){
    // Perform network request with Networking module
    Networking.fetch(urlClosest).then(function(result) {
      // The result object contains information about the request,
      // such as status code and response body.
      if ((result.status >= 200) && (result.status < 300)) {
        // If the request was successful, we'll chain the JSON forward
        return result.json();
      }
      // If the request was not successful, we should throw an error
      throw new Error("HTTP status code " + result.status);
    }).then(function(json){
      latitudeClosest = json.latitude;
      longitudeClosest = json.longitude;
      closestHaiku = json.text;
      closestMood = json.mood;
    }
    ).catch(function(error) {
      // Here we process any errors that may happen with the request
      message.text = error.message;
    });
  }
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }
  function distFromClosest(lat1,lon1,lat2,lon2) {
    var R = 6371000; // Radius of the earth in m
    var dLat = deg2rad(lat2-lat1);
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in m
    return d;
  }
  function checkNear(){
    getLocation();
    getClosestHaiku();
    Diagnostics.log(closestHaiku);
    dist = distFromClosest(latitude,longitude,latitudeClosest,longitudeClosest);
    if (dist < 20 || dist != 0 && closestHaiku != ""){
      parseLines(closestHaiku);
    }
    else {
      NativeUI.setText(distanceToClosestHaiku, '>20m from closest Haiku');
    }
  }

  // Register a tap gesture to enter NativeUI to edit texts
  TouchGestures.onTap().subscribe(function() {
    NativeUI.enterTextEditMode(textFromUser);
    // Monitor user input and diveto lines
    NativeUI.getText(textFromUser).monitor().subscribe(function(f) {
      var str = f.newValue;
      //Write to closestHaiku
      closestHaiku = str;
      //Divide user input to lines
      parseLines(str);
      getLocation();
      // Perform post of Haiku and location
      postHaiku();
    });
  });

  var cancelableTimer = Time.setTimeout(
    function (elapsedTime) {
      Diagnostics.log('You should not see this message in the console.');
    }, 2900);

  // Repeating timer:
  Time.ms.interval(1700).subscribe(
  function (elapsedTime) {
    // NOTE: Time.ms may differ slightly from the elapsed
    // time passed to the callback. Time.ms shows the exact
    // time since the effect started, whereas the callback
    // exposes an exact multiple of the specified interval.
    Diagnostics.log(Time.ms.lastValue);
    Diagnostics.log(elapsedTime);
    Time.clearTimeout(cancelableTimer);
    //Check nearby
    checkNear();
    Diagnostics.log('Wo hoo.');
  });
