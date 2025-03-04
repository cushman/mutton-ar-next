'use client';

import { useEffect, useRef, useState } from 'react';
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
    THREE: any;
    initAR: () => void;
    cleanupAR: () => void;
    checkARSupport: () => boolean;
  }
}

// Import scripts in the client component
export default function ARGeolocation() {
  const mapRef = useRef<HTMLDivElement>(null);
  const arSceneRef = useRef<HTMLDivElement>(null);
  const leafletLoadedRef = useRef(false);
  const threeLoadedRef = useRef(false);
  const [activeTab, setActiveTab] = useState('map-view');

  useEffect(() => {
    console.log("ARGeolocation component mounted");
    loadMap();
    
    return () => {
      // Clean up AR resources when component unmounts
      if (typeof window !== 'undefined' && window.cleanupAR) {
        window.cleanupAR();
      }
    };
  }, []);

  // Effect to handle tab changes
  useEffect(() => {
    console.log(`Tab changed to: ${activeTab}`);
    
    if (activeTab === 'map-view') {
      // Make sure map is initialized when switching to map view
      if (typeof window !== 'undefined' && window.L && mapRef.current) {
        if (!window.mapInitialized && typeof window.initMap === 'function') {
          console.log("Initializing map on tab change");
          window.initMap('map');
        }
      }
    } else if (activeTab === 'ar-view') {
      // Load Three.js and initialize AR when switching to AR view
      loadThreeJS();
    }
  }, [activeTab]);

  const handleTabClick = (tabId: string) => {
    console.log(`Switching to tab: ${tabId}`);
    setActiveTab(tabId);
  };

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

  const loadThreeJS = () => {
    if (typeof window !== 'undefined') {
      if (!window.THREE && !threeLoadedRef.current) {
        console.log("Loading Three.js");
        threeLoadedRef.current = true;
        
        // Load Three.js
        const threeScript = document.createElement('script');
        threeScript.src = 'https://unpkg.com/three@0.157.0/build/three.min.js';
        threeScript.async = true;
        threeScript.onload = () => {
          console.log("Three.js loaded");
          
          // Load AR script after Three.js is loaded
          const arScript = document.createElement('script');
          arScript.src = '/ar.js';
          arScript.async = true;
          arScript.onload = () => {
            console.log("AR script loaded");
            
            if (typeof window.initAR === 'function') {
              console.log("Initializing AR");
              window.initAR();
            } else {
              console.error("initAR function not available");
            }
          };
          document.body.appendChild(arScript);
        };
        document.head.appendChild(threeScript);
      } else if (window.THREE) {
        console.log("Three.js already loaded");
        
        // Check if AR script is loaded
        if (typeof window.initAR === 'function') {
          console.log("AR script already loaded, initializing AR");
          window.initAR();
        } else {
          console.log("Loading AR script");
          const arScript = document.createElement('script');
          arScript.src = '/ar.js';
          arScript.async = true;
          arScript.onload = () => {
            console.log("AR script loaded");
            if (typeof window.initAR === 'function') {
              window.initAR();
            }
          };
          document.body.appendChild(arScript);
        }
      }
    }
  };

  return (
    <div className="app-container">
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'map-view' ? 'active' : ''}`} 
          data-tab="map-view"
          onClick={() => handleTabClick('map-view')}
        >
          Map View
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ar-view' ? 'active' : ''}`} 
          data-tab="ar-view"
          onClick={() => handleTabClick('ar-view')}
        >
          AR View
        </button>
      </div>
      
      <div id="map-view" className={`tab-content ${activeTab === 'map-view' ? 'active' : ''}`}>
        <div id="map" ref={mapRef} style={{width: '100%', height: 'calc(100vh - 120px)'}}></div>
        <div id="placed-items-list">
          <h3>Placed Items</h3>
          <ul id="items-list"></ul>
        </div>
      </div>
      
      <div id="ar-view" className={`tab-content ${activeTab === 'ar-view' ? 'active' : ''}`}>
        <div className="ar-controls">
          <button 
            id="back-to-map" 
            onClick={() => handleTabClick('map-view')}
          >
            Back to Map
          </button>
        </div>
        <div id="ar-scene" ref={arSceneRef}>
          <div className="ar-message">
            <h2>AR View</h2>
            <p>
              Click "Start AR" below to view your placed objects in augmented reality.
              You'll be able to place them in your real-world environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 