import "../../styles/global.css"
import React, { useState, useEffect, useRef } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import { getGeocode, getLatLng } from "use-places-autocomplete";

const mapOptions = {
  mapId: import.meta.env.VITE_PUBLIC_MAP_ID,
  center: { lat: 51.750576, lng: -0.236069 },
  zoom: 18,
  disableDefaultUI: true,
  heading: 25,
  tilt: 60,
};

export default function App() {
  return (
    <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <MyMap />
    </Wrapper>
  );
}

function MyMap() {
    const [route, setRoute] = useState(); //need this to draw the route and make the car run
    const [map, setMap] = useState(null); // Initialize state correctly
    const ref = useRef(null); // Initialize ref correctly

  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, mapOptions));
    }
  }, [map]);

  return <>
  <div ref={ref} id="map" style={{ height: "100vh", width: "100%" }}/>
  {map && <Directions setRoute={setRoute}/>}
  </>
}

function Directions({setRoute}) {
  const [origin] = useState("Newton Court Hatfield"); //these are hardcoded here these can be swapped to dynamic by using the google places API
  const [destination] = useState("Galleri Hatfield");

  useEffect(() => {
    fetchDirections(origin, destination, setRoute);
  }, [origin, destination]);

  return <div className="directions">
    <h2>Direction</h2>
    <h3>Origin</h3>
    <p>{origin}</p>
    <h3>Destination</h3>
    <p>{destination}</p>
  </div>
}

async function fetchDirections(origin, destination, setRoute) {
  const [originResults, destinationResults] = await Promise.all([
  // this function will convert the origin and destination into latitiude and longitude using a package
    getGeocode({address: origin}),
    getGeocode({address: destination}),
  ]);

  const [originLocation, destinationLocation] = await Promise.all([
      getLatLng(originResults[0]),
      getLatLng(destinationResults[0]),
    ]);

    const services = new google.maps.DirectionsService();
    services.route({
      origin: originLocation,
      destination: destinationLocation,
      travelMode: google.maps.TravelMode.DRIVING
    },
    (result, status) => {
      if (status == "OK" && result) {
        const route = result.routes[0].overview_path.map(path => (
          {
            lat: path.lat(), 
            lng: path.lng()
          }));
          setRoute(route);
      }
    }
  );

    console.log({originLocation, destinationLocation});

}