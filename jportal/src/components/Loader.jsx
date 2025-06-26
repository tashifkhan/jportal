import React from "react";

const Loader = ({ message = "Loading..." }) => {
  const size = 48;
  const radius = 18;
  const strokeWidth = 6;
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-8">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="mb-4 animate-spin-slow"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="loader-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent-color)" />
            <stop offset="100%" stopColor="var(--text-color)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2226"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#loader-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={2 * Math.PI * radius}
          strokeDashoffset={2 * Math.PI * radius * 0.75}
          strokeLinecap="round"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transition: "stroke 0.3s",
          }}
        >
          <animate
            attributeName="stroke-dashoffset"
            values={`${2 * Math.PI * radius * 0.75};${
              2 * Math.PI * radius * 0.25
            };${2 * Math.PI * radius * 0.75}`}
            keyTimes="0;0.5;1"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      <span
        className="text-xl font-semibold"
        style={{ color: "var(--text-color)" }}
      >
        {message}
      </span>
      <style>{`
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 1.2s linear infinite; }
      `}</style>
    </div>
  );
};

export default Loader;
