import "../../styles/global.css";
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
  const [route, setRoute] = useState(null);
  const [map, setMap] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, mapOptions));
    }
  }, [map]);

  return (
    <>
      <div ref={ref} id="map" style={{ height: "100vh", width: "100%" }} />
      {map && <Directions setRoute={setRoute} />}
      {map && route && <RouteAnimation map={map} route={route} />}
    </>
  );
}

function RouteAnimation({ map, route }) {
  useEffect(() => {
    if (!route || route.length === 0) return;
    // Center the map on the midpoint of the route
    const middleIndex = Math.floor(route.length / 2);
    map.setCenter(route[middleIndex]);

    // Draw the route with a blue polyline
    const polyline = new google.maps.Polyline({
      path: route,
      geodesic: true,
      strokeColor: "#0000FF", // Blue color
      strokeOpacity: 1.0,
      strokeWeight: 4,
    });
    polyline.setMap(map);

    // Mark the start and end points with red markers
    const startMarker = new google.maps.Marker({
      position: route[0],
      map: map,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      },
    });

    const endMarker = new google.maps.Marker({
      position: route[route.length - 1],
      map: map,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      },
    });

    // Log for debugging
    console.log("Route drawn with", route.length, "points.");

    // Cleanup markers and polyline when the route updates
    return () => {
      polyline.setMap(null);
      startMarker.setMap(null);
      endMarker.setMap(null);
    };
  }, [map, route]);

  return null;
}

function Directions({ setRoute }) {
  const [origin] = useState("WD23 4HH");
  const [destination] = useState("WD23 4PA");

  useEffect(() => {
    fetchDirections(origin, destination, setRoute);
  }, [origin, destination, setRoute]);

  return (
    <div className="directions">
      <h2>Direction</h2>
      <h3>Origin</h3>
      <p>{origin}</p>
      <h3>Destination</h3>
      <p>{destination}</p>
    </div>
  );
}

async function fetchDirections(origin, destination, setRoute) {
  try {
    const [originResults, destinationResults] = await Promise.all([
      getGeocode({ address: origin }),
      getGeocode({ address: destination }),
    ]);
    const [originLocation, destinationLocation] = await Promise.all([
      getLatLng(originResults[0]),
      getLatLng(destinationResults[0]),
    ]);

    console.log("Origin & Destination:", { originLocation, destinationLocation });

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: originLocation,
        destination: destinationLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          const routePath = result.routes[0].overview_path.map((point) => ({
            lat: point.lat(),
            lng: point.lng(),
          }));
          console.log("Route Path:", routePath);
          setRoute(routePath);
        } else {
          console.error("Directions request failed due to", status);
        }
      }
    );
  } catch (error) {
    console.error("Error fetching directions:", error);
  }
}
