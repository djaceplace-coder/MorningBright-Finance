/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  withBackground?: boolean;
}

export function Logo({ className = "w-9 h-9", withBackground = true }: LogoProps) {
  return (
    <div className={`shrink-0 transition-transform hover:scale-105 select-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Silver/Platinum gradient for the rising sun emblem */}
          <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="65%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Deep premium digital banking blue/midnight gradient */}
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0d2551" />
            <stop offset="30%" stopColor="#0a1d40" />
            <stop offset="100%" stopColor="#03081a" />
          </linearGradient>
        </defs>

        {withBackground && (
          /* Rounded Squircle Background */
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="24"
            fill="url(#blueGradient)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        )}

        {/* Rising Sun Emblem */}
        <g>
          {/* Base Horizontal Horizon Line */}
          <line
            x1="22"
            y1="63"
            x2="78"
            y2="63"
            stroke="url(#silverGradient)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Center Sun Semi-Circle */}
          <path
            d="M 37 63 A 13 13 0 0 1 63 63 Z"
            fill="url(#silverGradient)"
          />

          {/* 5 Radiating Sun Rays (with custom coordinates matching the logo perfectly) */}
          {/* Vertical Center Ray */}
          <line
            x1="50"
            y1="45"
            x2="50"
            y2="30"
            stroke="url(#silverGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Upper Left Ray */}
          <line
            x1="42.5"
            y1="48"
            x2="33"
            y2="34"
            stroke="url(#silverGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Upper Right Ray */}
          <line
            x1="57.5"
            y1="48"
            x2="67"
            y2="34"
            stroke="url(#silverGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Far Left Ray */}
          <line
            x1="37.5"
            y1="54"
            x2="25"
            y2="47"
            stroke="url(#silverGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Far Right Ray */}
          <line
            x1="62.5"
            y1="54"
            x2="75"
            y2="47"
            stroke="url(#silverGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
