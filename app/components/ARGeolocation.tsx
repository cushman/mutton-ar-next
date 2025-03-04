'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
// Import styles properly
import '../../public/styles.css';

// Define interfaces for TypeScript
interface LeafletStatic {
  map: (elementId: string) => any;
  tileLayer: (url: string, options?: any) => any;
  marker: (coords: [number, number], options?: any) => any;
  icon: (options: any) => any;
  divIcon: (options: any) => any;
}

// Extend Window interface as a global declaration
declare global {
  interface Window {
    L: LeafletStatic;
    initMap: (containerId?: string) => void;
    mapInitialized: boolean;
  }
}

// Import scripts in the client component
export default function ARGeolocation() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletLoadedRef = useRef(false);

  useEffect(() => {
    console.log("ARGeolocation component mounted");
    loadMap();
  }, []);

  const loadMap = () => {
    if (typeof window !== 'undefined') {
      console.log("loadMap function called");
      
      // Add Leaflet CSS directly to head
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        console.log("Adding Leaflet CSS");
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS if it's not already loaded
      if (!window.L && !leafletLoadedRef.current) {
        console.log("Loading Leaflet JS");
        leafletLoadedRef.current = true;
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => {
          console.log("Leaflet JS loaded");
          loadMapScript();
        };
        document.head.appendChild(script);
      } else if (window.L) {
        // Leaflet already loaded, just load our custom map script
        console.log("Leaflet already loaded");
        loadMapScript();
      }
    }
  };

  const loadMapScript = () => {
    console.log("loadMapScript called");
    
    // Only load the map script if it hasn't been loaded yet
    if (typeof window.initMap === 'undefined') {
      console.log("Loading map.js");
      const mapScript = document.createElement('script');
      mapScript.src = '/map.js';
      mapScript.async = true;
      mapScript.onload = () => {
        console.log('Map script loaded');
        
        // Ensure the map container exists before initializing
        if (mapRef.current && typeof window.initMap === 'function') {
          console.log("Map container exists, initializing...");
          if (!window.mapInitialized) {
            window.mapInitialized = true;
            setTimeout(() => {
              console.log("Calling initMap");
              window.initMap('map');
            }, 500);  // Give a short delay to ensure DOM is ready
          }
        } else {
          console.log("Map container or initMap not available yet");
        }
      };
      document.body.appendChild(mapScript);
    } else if (!window.mapInitialized) {
      console.log("Map script already loaded but not initialized");
      window.mapInitialized = true;
      setTimeout(() => {
        console.log("Calling initMap (already loaded)");
        window.initMap('map');
      }, 100);
    } else {
      console.log("Map already initialized");
    }
  };

  const handleDOMContentLoaded = () => {
    console.log('DOM content loaded event fired');
    if (typeof window.initMap === 'function' && !window.mapInitialized) {
      window.mapInitialized = true;
      console.log('Initializing map from DOMContentLoaded handler');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if the DOM is already loaded
      if (document.readyState === 'complete') {
        handleDOMContentLoaded();
      } else {
        // Otherwise, add an event listener for when it does load
        window.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
        return () => {
          window.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
        };
      }
    }
  }, []);

  return (
    <div className="app-container">
      <div className="tabs">
        <button className="tab-btn active" data-tab="map-view">Map View</button>
        <button className="tab-btn" data-tab="ar-view">AR View</button>
      </div>
      
      <div id="map-view" className="tab-content active">
        <div id="map" ref={mapRef} style={{width: '100%', height: 'calc(100vh - 120px)'}}></div>
        <div id="placed-items-list">
          <h3>Placed Items</h3>
          <ul id="items-list"></ul>
        </div>
      </div>
      
      <div id="ar-view" className="tab-content">
        <div className="ar-controls">
          <button id="back-to-map">Back to Map</button>
        </div>
        <div id="ar-scene"></div>
      </div>
    </div>
  );
} 