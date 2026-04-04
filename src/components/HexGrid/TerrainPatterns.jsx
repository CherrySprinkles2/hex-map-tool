import React from 'react';

// SVG pattern definitions for each terrain type.
// Each pattern is purely the texture marks — transparent background so the
// terrain base colour on the polygon shows through underneath.
const TerrainPatterns = () => {
  return (
    <defs>
      {/* Grass: small paired diagonal blade strokes */}
      <pattern id="pattern-grass" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
        <line
          x1="2"
          y1="11"
          x2="4"
          y2="6"
          stroke="rgba(0,80,0,0.28)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="11"
          x2="6"
          y2="7"
          stroke="rgba(0,80,0,0.18)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="9"
          y1="11"
          x2="11"
          y2="6"
          stroke="rgba(0,80,0,0.28)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="11"
          y1="11"
          x2="13"
          y2="7"
          stroke="rgba(0,80,0,0.18)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="5"
          y1="5"
          x2="7"
          y2="1"
          stroke="rgba(0,80,0,0.15)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </pattern>

      {/* Farm: evenly spaced horizontal furrow lines */}
      <pattern id="pattern-farm" x="0" y="0" width="20" height="7" patternUnits="userSpaceOnUse">
        <line x1="0" y1="3.5" x2="20" y2="3.5" stroke="rgba(90,50,0,0.22)" strokeWidth="1.2" />
      </pattern>

      {/* Forest: staggered dark canopy circles */}
      <pattern id="pattern-forest" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="2.8" fill="rgba(0,30,0,0.32)" />
        <circle cx="11.5" cy="4" r="2" fill="rgba(0,30,0,0.22)" />
        <circle cx="7.5" cy="10.5" r="2.8" fill="rgba(0,30,0,0.32)" />
        <circle cx="1" cy="11" r="1.6" fill="rgba(0,30,0,0.18)" />
        <circle cx="14" cy="11" r="1.6" fill="rgba(0,30,0,0.18)" />
      </pattern>

      {/* Mountain: stacked chevron ridgelines */}
      <pattern
        id="pattern-mountain"
        x="0"
        y="0"
        width="22"
        height="13"
        patternUnits="userSpaceOnUse"
      >
        <polyline
          points="0,11 5.5,5 11,11 16.5,5 22,11"
          stroke="rgba(0,0,0,0.22)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="0,7 5.5,1 11,7 16.5,1 22,7"
          stroke="rgba(0,0,0,0.12)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </pattern>

      {/* Lake: soft sinusoidal wavy lines */}
      <pattern id="pattern-lake" x="0" y="0" width="30" height="10" patternUnits="userSpaceOnUse">
        <path
          d="M0,3 C4,1.5 8,4.5 12,3 C16,1.5 20,4.5 24,3 C26,2.3 28,1.8 30,3"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M0,7.5 C4,6 8,9 12,7.5 C16,6 20,9 24,7.5 C26,6.8 28,6.3 30,7.5"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
      </pattern>
      {/* Ocean: deeper, wider/slower waves than lake */}
      <pattern id="pattern-ocean" x="0" y="0" width="50" height="18" patternUnits="userSpaceOnUse">
        <path
          d="M0,5 C7,2 14,8 21,5 C28,2 35,8 42,5 C45,3.5 47.5,2.5 50,5"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M0,12 C7,9 14,15 21,12 C28,9 35,15 42,12 C45,10.5 47.5,9.5 50,12"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      </pattern>
    </defs>
  );
};

export default TerrainPatterns;
