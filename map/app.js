/*
for now all i need is to render pins for the location of the events and if someone i clicking the pin he can navigate their

- make pins for the data in the database
- make a popup for the event name and address linking url and the name of the venue

how are i am going to create a app now? 

how can i create now a 

hello my name is and i am going to be in 

if i run every day 21 km how would that change my life?

how are i am going to do this app now. need to pull data from supabase for this. h

its time to go fully all in hypercaffeinated

i like, hello my name is and i am going to cook really hard. hello my name is herl
*/


//pull data from database 

// app.js
mapboxgl.accessToken = "pk.eyJ1IjoieWFjaHR5NjYiLCJhIjoiY2x4aTZndXJuMW8xdzJpcHJyYTFiMnl1cSJ9.BQezezawWYgnD6sBZMsvnw";
var map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [-74.5, 40], // starting position [lng, lat]
    zoom: 9 // starting zoom
});

