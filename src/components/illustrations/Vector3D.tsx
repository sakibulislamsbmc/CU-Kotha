import React from 'react';

// 3D Vector Illustration: Floating Dimensional Heart for Compassion & Anti-Loneliness
export const EmpathyHeart3D: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 120,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-2xl ${className}`}
  >
    <defs>
      <linearGradient id="heartGradientFront" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f43f5e" />
        <stop offset="0.5" stopColor="#fb7185" />
        <stop offset="1" stopColor="#e11d48" />
      </linearGradient>
      <linearGradient id="heartGradientSide" x1="40" y1="30" x2="130" y2="150" gradientUnits="userSpaceOnUse">
        <stop stopColor="#9f1239" />
        <stop offset="1" stopColor="#4c0519" />
      </linearGradient>
      <linearGradient id="heartHighlight" x1="40" y1="30" x2="90" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="0.6" stopColor="#fda4af" stopOpacity="0.2" />
        <stop offset="1" stopColor="#f43f5e" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="glowRays" x1="80" y1="10" x2="80" y2="150" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10b981" stopOpacity="0.6" />
        <stop offset="1" stopColor="#065f46" stopOpacity="0" />
      </linearGradient>
      <filter id="softGlow" x="-20" y="-20" width="200" height="200" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="10" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Ambient Glow */}
    <circle cx="80" cy="80" r="54" fill="url(#glowRays)" filter="url(#softGlow)" />

    {/* 3D Depth Extrusion (Shadow Base) */}
    <path
      d="M80 138 C40 102 18 78 18 50 C18 28 36 12 58 12 C70 12 80 20 80 20 C80 20 90 12 102 12 C124 12 142 28 142 50 C142 78 120 102 80 138 Z"
      fill="url(#heartGradientSide)"
      transform="translate(4, 10)"
      opacity="0.85"
    />

    {/* Main 3D Heart Body */}
    <path
      d="M80 132 C42 98 22 74 22 48 C22 28 38 14 58 14 C69 14 78 20 80 22 C82 20 91 14 102 14 C122 14 138 28 138 48 C138 74 118 98 80 132 Z"
      fill="url(#heartGradientFront)"
    />

    {/* Glossy Curved Highlight */}
    <path
      d="M34 46 C34 32 44 22 58 22 C67 22 74 28 78 34 C76 48 60 62 46 64 C38 60 34 52 34 46 Z"
      fill="url(#heartHighlight)"
    />

    {/* Floating 3D Sparkle Dots */}
    <circle cx="28" cy="38" r="3.5" fill="#ffffff" opacity="0.9" />
    <circle cx="128" cy="32" r="2.5" fill="#fecdd3" opacity="0.8" />
    <circle cx="134" cy="94" r="3" fill="#34d399" opacity="0.8" />
    <circle cx="24" cy="98" r="2" fill="#6ee7b7" opacity="0.7" />
  </svg>
);

// 3D Vector Illustration: Safe Haven & Mental Peace Shield
export const SafeShield3D: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 110,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-2xl ${className}`}
  >
    <defs>
      <linearGradient id="shieldGradFront" x1="30" y1="20" x2="130" y2="140" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10b981" />
        <stop offset="0.5" stopColor="#14b8a6" />
        <stop offset="1" stopColor="#0f766e" />
      </linearGradient>
      <linearGradient id="shieldGradDark" x1="40" y1="30" x2="120" y2="150" gradientUnits="userSpaceOnUse">
        <stop stopColor="#064e3b" />
        <stop offset="1" stopColor="#022c22" />
      </linearGradient>
      <linearGradient id="innerGlow" x1="80" y1="30" x2="80" y2="130" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a7f3d0" stopOpacity="0.7" />
        <stop offset="1" stopColor="#10b981" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Extrusion Base */}
    <path
      d="M80 148 C42 128 32 94 32 46 L80 26 L128 46 C128 94 118 128 80 148 Z"
      fill="url(#shieldGradDark)"
      transform="translate(4, 8)"
      opacity="0.9"
    />

    {/* Front Shield */}
    <path
      d="M80 140 C44 122 36 90 36 46 L80 28 L124 46 C124 90 116 122 80 140 Z"
      fill="url(#shieldGradFront)"
    />

    {/* Center 3D Keyhole / Lock Core */}
    <path
      d="M80 130 C52 114 46 88 46 54 L80 40 L114 54 C114 88 108 114 80 130 Z"
      fill="url(#innerGlow)"
      opacity="0.35"
    />

    {/* Floating 3D Checkmark of Trust */}
    <path
      d="M66 82 L76 92 L96 68"
      stroke="#ffffff"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 3D Vector Illustration: Connection Bridge Across Loneliness (Two entities finding solace)
export const LonelinessRelief3D: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 130,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 180 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-2xl ${className}`}
  >
    <defs>
      <linearGradient id="orbLeft" x1="20" y1="40" x2="70" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="1" stopColor="#0369a1" />
      </linearGradient>
      <linearGradient id="orbRight" x1="110" y1="40" x2="160" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fb7185" />
        <stop offset="1" stopColor="#be123c" />
      </linearGradient>
      <linearGradient id="bridgeGrad" x1="45" y1="75" x2="135" y2="75" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="0.5" stopColor="#a855f7" />
        <stop offset="1" stopColor="#fb7185" />
      </linearGradient>
    </defs>

    {/* Connecting 3D Light Bridge */}
    <path
      d="M45 75 Q90 40 135 75"
      stroke="url(#bridgeGrad)"
      strokeWidth="6"
      strokeLinecap="round"
      strokeDasharray="6 4"
      opacity="0.85"
    />

    {/* Soul A (Blue Avatar) */}
    <ellipse cx="45" cy="115" rx="22" ry="8" fill="#000000" opacity="0.4" />
    <circle cx="45" cy="75" r="24" fill="url(#orbLeft)" />
    <ellipse cx="40" cy="65" rx="7" ry="4" fill="#ffffff" opacity="0.6" />

    {/* Soul B (Rose Avatar) */}
    <ellipse cx="135" cy="115" rx="22" ry="8" fill="#000000" opacity="0.4" />
    <circle cx="135" cy="75" r="24" fill="url(#orbRight)" />
    <ellipse cx="130" cy="65" rx="7" ry="4" fill="#ffffff" opacity="0.6" />

    {/* Central 3D Spark of Empathy */}
    <circle cx="90" cy="52" r="7" fill="#ffffff" />
    <circle cx="90" cy="52" r="14" fill="#ec4899" opacity="0.3" />
  </svg>
);

// 3D Vector Illustration: Mindful Dialogue & Empathetic Chat Bubble
export const CompassionChat3D: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 110,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-2xl ${className}`}
  >
    <defs>
      <linearGradient id="bubbleGrad1" x1="20" y1="20" x2="110" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34d399" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="bubbleGrad2" x1="60" y1="50" x2="140" y2="130" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a855f7" />
        <stop offset="1" stopColor="#6b21a8" />
      </linearGradient>
    </defs>

    {/* Shadow of first bubble */}
    <ellipse cx="65" cy="130" rx="30" ry="8" fill="#000000" opacity="0.4" />

    {/* Second Speech Bubble (3D Isometric back) */}
    <path
      d="M75 58 C75 44 88 34 105 34 C122 34 135 44 135 58 C135 68 126 77 114 80 L118 92 L104 82 C104 82 100 82 95 82 C84 82 75 72 75 58 Z"
      fill="url(#bubbleGrad2)"
      opacity="0.85"
    />

    {/* First Speech Bubble (3D Isometric front) */}
    <path
      d="M25 50 C25 32 44 18 68 18 C92 18 111 32 111 50 C111 64 98 76 82 80 L86 98 L68 82 C44 82 25 68 25 50 Z"
      fill="url(#bubbleGrad1)"
    />

    {/* Empathetic Dots inside Bubble */}
    <circle cx="52" cy="50" r="4" fill="#ffffff" />
    <circle cx="68" cy="50" r="4" fill="#ffffff" />
    <circle cx="84" cy="50" r="4" fill="#ffffff" />
  </svg>
);
