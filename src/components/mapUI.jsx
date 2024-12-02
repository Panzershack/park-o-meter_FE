import React, { useState} from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

export default function MapInterface() {
  const position = { lat: 51.750576, lng: -0.236069 }; // Center of the map
  const [open, setOpen] = useState(false);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div style={{ height: "100vh", width: "100%", marginTop: "65px"}} >
        <Map
          center={position}
          zoom={15}
          mapId={import.meta.env.VITE_PUBLIC_MAP_ID}
        >
          <AdvancedMarker position={position} onClick={() => setOpen(true)}>
            <Pin
                background={"blue"}
                borderColor={"black"}
                glyphColor={"white"}
            />
          </AdvancedMarker>

          {open && (
            <InfoWindow position={position} onCloseClick={() => setOpen(false) }>
                <p>This project started here</p>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
