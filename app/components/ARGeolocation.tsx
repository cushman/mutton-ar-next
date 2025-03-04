'use client';

import { useEffect, useRef } from 'react';
import styles from './ARGeolocation.module.css';
import Script from 'next/script';

// Import scripts in the client component
export default function ARGeolocation() {
  useEffect(() => {
    // No dynamic imports here - we'll use Next.js Script component
  }, []);

  return (
    <>
      {/* Load scripts using Next.js Script component */}
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