'use client';

import { useEffect, useRef } from 'react';
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
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMap();
  }, []);

  const loadMap = () => {
    if (typeof window !== 'undefined') {
      // Add Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);

      // Load Leaflet JS if it's not already loaded
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.async = true;
        script.onload = () => {
          // Once Leaflet is loaded, load our custom map script
          loadMapScript();
        };
        document.head.appendChild(script);
      } else {
        // Leaflet already loaded, just load our custom map script
        loadMapScript();
      }
    }
  };

  const loadMapScript = () => {
    // Only load the map script if it hasn't been loaded yet
    if (typeof window.initMap === 'undefined') {
      const mapScript = document.createElement('script');
      mapScript.src = '/map.js';
      mapScript.async = true;
      mapScript.onload = () => {
        console.log('Map script loaded');
        if (typeof window.initMap === 'function' && !window.mapInitialized) {
          window.mapInitialized = true;
          console.log('Initializing map');
        }
      };
      document.body.appendChild(mapScript);
    } else if (!window.mapInitialized) {
      window.mapInitialized = true;
      console.log('Map script already loaded, initializing map');
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
        <div id="map" ref={mapRef}></div>
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