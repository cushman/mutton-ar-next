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
    // We'll initialize the map after all scripts are loaded
    const loadMap = () => {
      const mapScriptLoaded = window.L;
      if (mapScriptLoaded && document.getElementById('map')) {
        // Initialize the map when the component mounts and Leaflet is loaded
        const initMapFunction = window.initMap;
        if (typeof initMapFunction === 'function') {
          setTimeout(() => {
            initMapFunction();
          }, 500); // Short delay to ensure DOM is ready
        }
      }
    };

    // Check if scripts are loaded and initialize
    loadMap();

    // Add event listener for DOMContentLoaded to handle app.js initialization
    const handleDOMContentLoaded = () => {
      if (window.setupApp && typeof window.setupApp === 'function') {
        window.setupApp();
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
    } else {
      handleDOMContentLoaded();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
    };
  }, []);

  return (
    <>
      {/* Load Leaflet before other scripts */}
      <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" strategy="beforeInteractive" />
      
      {/* Load A-Frame and AR.js scripts */}
      <Script src="https://aframe.io/releases/1.4.0/aframe.min.js" strategy="beforeInteractive" />
      <Script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js" strategy="beforeInteractive" />
      <Script src="https://raw.githack.com/donmccurdy/aframe-extras/master/dist/aframe-extras.loaders.min.js" strategy="beforeInteractive" />
      
      {/* Load app scripts */}
      <Script src="/models/sheep.js" strategy="afterInteractive" />
      <Script src="/map.js" strategy="afterInteractive" />
      <Script src="/ar.js" strategy="afterInteractive" />
      <Script src="/app.js" strategy="afterInteractive" />
      
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