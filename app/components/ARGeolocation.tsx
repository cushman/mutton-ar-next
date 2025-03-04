'use client';

import { useEffect } from 'react';
import Script from 'next/script';
// Import styles properly
import '../../public/styles.css';

// Declare global window extensions
declare global {
  // Basic type for Leaflet to avoid 'any'
  interface LeafletStatic {
    map: (elementId: string) => any;
    tileLayer: (url: string, options?: any) => any;
    marker: (coords: [number, number], options?: any) => any;
    icon: (options: any) => any;
    divIcon: (options: any) => any;
  }

  interface Window {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: LeafletStatic;
    initMap: () => void;
    setupApp: () => void;
    mapInitialized: boolean;
  }
}

// Import scripts in the client component
export default function ARGeolocation() {
  useEffect(() => {
    // Add debugging to see what's happening
    console.log("ARGeolocation component mounted");
    
    // We'll initialize the map after all scripts are loaded
    const loadMap = () => {
      console.log("loadMap function called");
      console.log("Leaflet available:", typeof window.L);
      console.log("Map element exists:", !!document.getElementById('map'));
      
      if (window.L && document.getElementById('map')) {
        // Initialize the map when the component mounts and Leaflet is loaded
        console.log("initMap function exists:", typeof window.initMap);
        if (typeof window.initMap === 'function') {
          console.log("Calling initMap function");
          setTimeout(() => {
            window.initMap();
          }, 500); // Short delay to ensure DOM is ready
        }
      } else {
        console.log("Either Leaflet or map element not ready yet");
      }
    };

    // Try to initialize map after a short delay
    setTimeout(loadMap, 1000);
    
    // Also try on window load
    window.addEventListener('load', loadMap);

    // Add event listener for DOMContentLoaded to handle app.js initialization
    const handleDOMContentLoaded = () => {
      console.log("DOMContentLoaded triggered");
      if (window.setupApp && typeof window.setupApp === 'function') {
        console.log("Calling setupApp function");
        window.setupApp();
      } else {
        console.log("setupApp function not available");
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
    } else {
      handleDOMContentLoaded();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
      window.removeEventListener('load', loadMap);
    };
  }, []);

  return (
    <>
      {/* Load Leaflet before other scripts */}
      <Script 
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
        strategy="beforeInteractive"
        onLoad={() => console.log("Leaflet script loaded")}
        onError={() => console.error("Failed to load Leaflet")}
      />
      
      {/* Load A-Frame and AR.js scripts */}
      <Script src="https://aframe.io/releases/1.4.0/aframe.min.js" strategy="beforeInteractive" />
      <Script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js" strategy="beforeInteractive" />
      <Script src="https://raw.githack.com/donmccurdy/aframe-extras/master/dist/aframe-extras.loaders.min.js" strategy="beforeInteractive" />
      
      {/* Load app scripts */}
      <Script 
        src="/models/sheep.js" 
        strategy="afterInteractive" 
        onLoad={() => console.log("Sheep model loaded")}
      />
      <Script 
        src="/map.js" 
        strategy="afterInteractive" 
        onLoad={() => {
          console.log("Map script loaded");
          // Try to initialize map after script loads
          if (window.L && document.getElementById('map')) {
            console.log("Attempting to initialize map after script load");
            setTimeout(() => window.initMap && window.initMap(), 300);
          }
        }}
      />
      <Script src="/ar.js" strategy="afterInteractive" />
      <Script 
        src="/app.js" 
        strategy="afterInteractive" 
        onLoad={() => {
          console.log("App script loaded");
          if (window.setupApp) window.setupApp();
        }}
      />
      
      <div className="app-container">
        <div className="tabs">
          <button className="tab-btn active" data-tab="map-view">Map View</button>
          <button className="tab-btn" data-tab="ar-view">AR View</button>
        </div>
        
        <div className="tab-content active" id="map-view">
          <div id="map"></div>
          <div className="controls">
            <select id="model-select">
              <option value="sheep">Sheep</option>
              <option value="cube">Cube</option>
            </select>
            <button id="place-btn">Place on Map</button>
            <div id="instructions">Click on the map to place the selected object</div>
            <div id="placed-items-list">
              <h3>Placed Items</h3>
              <ul id="items-list"></ul>
            </div>
          </div>
        </div>
        
        <div className="tab-content" id="ar-view">
          <div id="ar-scene-container"></div>
          <div className="ar-controls">
            <button id="back-to-map">Back to Map</button>
          </div>
        </div>
      </div>
    </>
  );
} 