import React, { useState, useEffect, useRef } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";

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
  const [origin] = useState("Newton COurt Hatfield"); //these are hardcoded here these can be swapped to dynamic by using the google places API
  const [destination] = useState("Galleri Hatfield");

  return <div className="direction">

  </div>
}