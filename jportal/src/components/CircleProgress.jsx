import React from "react";


function CircleProgress({ percentage, className = "" }) {
  const strokeWidth = 3;
  const defaultRadius = 15;
  const smallRadius = 14;
  const radius = defaultRadius;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg
      className={`w-[80px] h-[80px] ${className}`}
      viewBox="0 0 50 50"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="rotate(-90 25 25)">
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="transparent"
          stroke="#a3c9fe"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          className="transition-all duration-500 ease-in-out"
        />
      </g>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-[13px] max-[375px]:text-[12px] fill-white font-medium"
      >
        {percentage}
      </text>
    </svg>
  );
}

export default CircleProgress;
