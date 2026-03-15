"use client";

import { useEffect, useState, useMemo } from "react";

// Code snippets for Software category
const CODE_SNIPPETS = [
  "function analyzeData(input) {",
  "  const results = [];",
  "  for (let i = 0; i < input.length; i++) {",
  "    results.push(process(input[i]));",
  "  }",
  "  return results;",
  "}",
  "",
  "class DecisionEngine {",
  "  constructor(criteria) {",
  "    this.criteria = criteria;",
  "    this.weights = new Map();",
  "  }",
  "  ",
  "  evaluate(options) {",
  "    return options.map(opt => ({",
  "      ...opt,",
  "      score: this.calculate(opt)",
  "    }));",
  "  }",
  "}",
  "",
  "const optimize = async (data) => {",
  "  const response = await fetch('/api');",
  "  return response.json();",
  "};",
  "",
  "export default function App() {",
  "  const [state, setState] = useState();",
  "  useEffect(() => {",
  "    loadData();",
  "  }, []);",
  "  return <Component />;",
  "}",
];

// Software: Animated code scrolling
export function SoftwareBackground({ color, opacity = 0.15 }: { color: string; opacity?: number }) {
  const codeLines = useMemo(() => [...CODE_SNIPPETS, ...CODE_SNIPPETS], []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      <div className="code-scroll absolute inset-0 font-mono text-[10px] sm:text-xs leading-relaxed whitespace-pre select-none">
        <div className="absolute left-[5%] top-0 w-[40%] opacity-40" style={{ color: `rgb(${color})` }}>
          {codeLines.map((line, i) => (
            <div key={i} className="opacity-60">{line}</div>
          ))}
        </div>
        <div className="absolute right-[5%] top-[20%] w-[35%] opacity-30 blur-[0.5px]" style={{ color: `rgb(${color})` }}>
          {codeLines.map((line, i) => (
            <div key={i} className="opacity-50">{line}</div>
          ))}
        </div>
      </div>
      {/* Binary rain effect */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-[8px] font-mono animate-pulse"
            style={{
              left: `${5 + i * 7}%`,
              top: `${Math.random() * 100}%`,
              color: `rgb(${color})`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </div>
        ))}
      </div>
    </div>
  );
}

// Investment: Subtle animated stock chart
export function InvestmentBackground({ color, opacity = 0.12 }: { color: string; opacity?: number }) {
  const [points, setPoints] = useState<string>("");
  
  useEffect(() => {
    const generatePath = () => {
      let path = "M 0 150";
      let y = 150;
      for (let x = 0; x <= 400; x += 8) {
        const trend = Math.sin(x / 50) * 20;
        const noise = (Math.random() - 0.5) * 15;
        y = Math.max(50, Math.min(250, y + trend / 10 + noise / 3));
        path += ` L ${x} ${y}`;
      }
      return path;
    };
    
    setPoints(generatePath());
    const interval = setInterval(() => setPoints(generatePath()), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      {/* Subtle chart in center-right */}
      <svg className="absolute right-[5%] top-[25%] w-[40%] h-[35%] opacity-50" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="chartGradientSubtle" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={`rgb(${color})`} stopOpacity="0.2" />
            <stop offset="100%" stopColor={`rgb(${color})`} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Faint grid */}
        {[...Array(4)].map((_, i) => (
          <line key={i} x1="0" y1={i * 75} x2="400" y2={i * 75} stroke={`rgb(${color})`} strokeOpacity="0.15" strokeWidth="0.5" />
        ))}
        
        {/* Chart line */}
        <path d={points} fill="none" stroke={`rgb(${color})`} strokeWidth="1.5" className="stock-line" strokeLinecap="round" opacity="0.6" />
        <path d={`${points} L 400 300 L 0 300 Z`} fill="url(#chartGradientSubtle)" />
      </svg>
      
      {/* Small percentage indicator */}
      <div 
        className="absolute top-[22%] right-[8%] text-[10px] sm:text-xs font-mono opacity-30 animate-pulse"
        style={{ color: `rgb(${color})`, animationDuration: '3s' }}
      >
        +12.5%
      </div>
      
      {/* Subtle candlesticks hint */}
      <div className="absolute left-[10%] bottom-[20%] flex gap-1 opacity-25">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-1 rounded-sm" style={{ 
            height: `${12 + (i % 3) * 6}px`,
            background: `rgb(${color})`,
          }} />
        ))}
      </div>
    </div>
  );
}

// Vehicle: Subtle speed lines
export function VehicleBackground({ color, opacity = 0.1 }: { color: string; opacity?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      {/* Subtle speed lines on left side */}
      <div className="absolute left-[5%] top-[30%] w-[30%] h-[40%]">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute h-[1px] road-move"
            style={{
              width: `${60 + i * 15}px`,
              left: 0,
              top: `${i * 12}%`,
              background: `linear-gradient(90deg, rgb(${color}), transparent)`,
              opacity: 0.4 - i * 0.04,
              animationDelay: `${i * -0.3}s`,
              animationDuration: `${1.5 + i * 0.2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Small speedometer in corner */}
      <svg className="absolute bottom-[15%] right-[10%] w-16 h-16 sm:w-20 sm:h-20 opacity-25" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={`rgb(${color})`}
          strokeWidth="1"
          strokeDasharray="180 80"
          opacity="0.5"
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="20"
          stroke={`rgb(${color})`}
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{
            transformOrigin: '50px 50px',
            animation: 'gearRotate 4s ease-in-out infinite alternate',
          }}
        />
      </svg>
      
      {/* Faint km/h text */}
      <div 
        className="absolute bottom-[12%] right-[8%] text-[8px] sm:text-[10px] font-mono opacity-20"
        style={{ color: `rgb(${color})` }}
      >
        km/h
      </div>
    </div>
  );
}

// Real Estate: Subtle building silhouettes
export function RealEstateBackground({ color, opacity = 0.1 }: { color: string; opacity?: number }) {
  const buildings = useMemo(() => {
    return [...Array(6)].map((_, i) => ({
      x: 60 + i * 6,
      width: 3 + Math.random() * 2,
      height: 15 + Math.random() * 30,
      delay: i * 0.4,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      {/* Subtle skyline in bottom right */}
      <div className="absolute bottom-0 right-0 w-[45%] h-[35%] opacity-50">
        {buildings.map((building, i) => (
          <div
            key={i}
            className="absolute bottom-0 building-rise"
            style={{
              left: `${(i * 16)}%`,
              width: `${building.width + 8}%`,
              height: `${building.height + 20}%`,
              background: `linear-gradient(to top, rgb(${color} / 0.3), transparent)`,
              animationDelay: `${building.delay}s`,
              borderRadius: '2px 2px 0 0',
            }}
          />
        ))}
      </div>
      
      {/* Simple floor plan outline top left */}
      <svg className="absolute top-[12%] left-[8%] w-20 h-14 sm:w-28 sm:h-20 opacity-25" viewBox="0 0 100 70">
        <rect x="5" y="5" width="90" height="60" fill="none" stroke={`rgb(${color})`} strokeWidth="1" />
        <line x1="5" y1="35" x2="50" y2="35" stroke={`rgb(${color})`} strokeWidth="0.5" />
        <line x1="50" y1="5" x2="50" y2="65" stroke={`rgb(${color})`} strokeWidth="0.5" />
        <rect x="70" y="45" width="15" height="20" fill="none" stroke={`rgb(${color})`} strokeWidth="0.5" opacity="0.5" />
      </svg>
      
      {/* Small key icon */}
      <div className="absolute top-[20%] right-[12%] opacity-20">
        <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke={`rgb(${color})`} strokeWidth="1.5">
          <circle cx="8" cy="8" r="5" />
          <line x1="12" y1="12" x2="20" y2="20" />
          <line x1="18" y1="16" x2="20" y2="18" />
        </svg>
      </div>
    </div>
  );
}

// Supplier/Employee: Subtle network connections
export function NetworkBackground({ color, opacity = 0.12 }: { color: string; opacity?: number }) {
  const nodes = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      x: 15 + (i % 4) * 22,
      y: 20 + Math.floor(i / 4) * 35,
      size: 1.5 + Math.random() * 1.5,
      delay: i * 0.3,
    }));
  }, []);

  const connections = useMemo(() => {
    const conns: Array<{from: number; to: number}> = [];
    nodes.forEach((_, i) => {
      const target = (i + 1) % nodes.length;
      if (target !== i) conns.push({ from: i, to: target });
    });
    return conns;
  }, [nodes]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      {/* Subtle SVG network in corner */}
      <svg className="absolute right-[5%] top-[15%] w-[35%] h-[40%] opacity-40" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {/* Very thin connection lines */}
        {connections.map((conn, i) => (
          <line
            key={i}
            x1={nodes[conn.from].x}
            y1={nodes[conn.from].y}
            x2={nodes[conn.to].x}
            y2={nodes[conn.to].y}
            stroke={`rgb(${color})`}
            strokeWidth="0.3"
            opacity="0.4"
            className="network-line"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
        
        {/* Small subtle nodes */}
        {nodes.map((node, i) => (
          <circle
            key={i}
            cx={node.x}
            cy={node.y}
            r={node.size}
            fill={`rgb(${color})`}
            opacity="0.5"
            className="network-node"
            style={{ animationDelay: `${node.delay}s` }}
          />
        ))}
      </svg>
      
      {/* Faint org chart lines on left */}
      <div className="absolute left-[8%] top-[25%] opacity-30">
        <div className="w-16 sm:w-24 h-[1px]" style={{ background: `rgb(${color})` }} />
        <div className="flex gap-4 sm:gap-8 mt-4">
          <div className="w-8 sm:w-12 h-[1px]" style={{ background: `rgb(${color})` }} />
          <div className="w-8 sm:w-12 h-[1px]" style={{ background: `rgb(${color})` }} />
        </div>
      </div>
      
      {/* Small floating dots */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-pulse"
          style={{
            width: `${3 + i % 2}px`,
            height: `${3 + i % 2}px`,
            left: `${10 + i * 15}%`,
            top: `${65 + (i % 3) * 10}%`,
            background: `rgb(${color})`,
            opacity: 0.3,
            animationDelay: `${i * 0.4}s`,
            animationDuration: '3s',
          }}
        />
      ))}
    </div>
  );
}

// Product: Subtle floating showcase
export function ProductBackground({ color, opacity = 0.1 }: { color: string; opacity?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      {/* Small floating boxes in corner */}
      <div className="absolute right-[8%] top-[20%] opacity-40">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute product-float"
            style={{
              left: `${i * 25}px`,
              top: `${i * 20}px`,
              width: `${24 + i * 6}px`,
              height: `${30 + i * 6}px`,
              background: `linear-gradient(135deg, rgb(${color} / 0.25), transparent)`,
              border: `1px solid rgb(${color} / 0.2)`,
              borderRadius: '4px',
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
      </div>
      
      {/* Simple comparison icon */}
      <svg className="absolute left-[10%] top-[30%] w-12 h-12 sm:w-16 sm:h-16 opacity-25" viewBox="0 0 100 100">
        <rect x="10" y="30" width="25" height="40" fill="none" stroke={`rgb(${color})`} strokeWidth="1" rx="2" />
        <rect x="65" y="30" width="25" height="40" fill="none" stroke={`rgb(${color})`} strokeWidth="1" rx="2" />
        <path d="M 42 50 L 58 50 M 53 45 L 58 50 L 53 55" stroke={`rgb(${color})`} strokeWidth="1" fill="none" />
      </svg>
      
      {/* Single subtle star rating */}
      <div className="absolute left-[12%] bottom-[18%] flex gap-0.5 opacity-25">
        {[...Array(5)].map((_, s) => (
          <svg key={s} className="w-2 h-2 sm:w-2.5 sm:h-2.5" viewBox="0 0 24 24" fill={s < 4 ? `rgb(${color})` : 'none'} stroke={`rgb(${color})`} strokeWidth="1">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    </div>
  );
}

// Machines: Subtle gears
export function MachinesBackground({ color, opacity = 0.1 }: { color: string; opacity?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      {/* Small gear top-left */}
      <svg className="absolute top-[15%] left-[8%] w-16 h-16 sm:w-20 sm:h-20 gear-rotate opacity-30" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="none" stroke={`rgb(${color})`} strokeWidth="1" />
        <circle cx="50" cy="50" r="10" fill="none" stroke={`rgb(${color})`} strokeWidth="1" />
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          return (
            <line 
              key={i} 
              x1={50 + Math.cos(angle) * 30} 
              y1={50 + Math.sin(angle) * 30} 
              x2={50 + Math.cos(angle) * 40} 
              y2={50 + Math.sin(angle) * 40}
              stroke={`rgb(${color})`} 
              strokeWidth="3"
            />
          );
        })}
      </svg>
      
      {/* Smaller gear bottom-right */}
      <svg className="absolute bottom-[20%] right-[12%] w-12 h-12 sm:w-14 sm:h-14 gear-rotate-reverse opacity-25" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="25" fill="none" stroke={`rgb(${color})`} strokeWidth="1" />
        <circle cx="50" cy="50" r="8" fill="none" stroke={`rgb(${color})`} strokeWidth="1" />
        {[...Array(6)].map((_, i) => {
          const angle = (i * 60 * Math.PI) / 180;
          return (
            <line 
              key={i} 
              x1={50 + Math.cos(angle) * 25} 
              y1={50 + Math.sin(angle) * 25} 
              x2={50 + Math.cos(angle) * 35} 
              y2={50 + Math.sin(angle) * 35}
              stroke={`rgb(${color})`} 
              strokeWidth="2"
            />
          );
        })}
      </svg>
      
      {/* Faint technical grid */}
      <div 
        className="absolute top-[35%] right-[25%] w-24 h-16 sm:w-32 sm:h-20 opacity-15"
        style={{
          backgroundImage: `linear-gradient(rgb(${color} / 0.4) 1px, transparent 1px), linear-gradient(90deg, rgb(${color} / 0.4) 1px, transparent 1px)`,
          backgroundSize: '12px 12px',
        }}
      />
    </div>
  );
}

// Main component that renders the appropriate background
export function CategoryBackground({ 
  categoryId, 
  color, 
  isActive 
}: { 
  categoryId: string; 
  color: string; 
  isActive: boolean;
}) {
  if (!isActive) return null;
  
  // All backgrounds use subtle opacity (0.1-0.15)
  switch (categoryId) {
    case 'software':
      return <SoftwareBackground color={color} opacity={0.12} />;
    case 'investment':
      return <InvestmentBackground color={color} opacity={0.12} />;
    case 'vehicle':
      return <VehicleBackground color={color} opacity={0.1} />;
    case 'realEstate':
      return <RealEstateBackground color={color} opacity={0.1} />;
    case 'supplier':
    case 'employee':
      return <NetworkBackground color={color} opacity={0.1} />;
    case 'product':
      return <ProductBackground color={color} opacity={0.1} />;
    case 'machines':
      return <MachinesBackground color={color} opacity={0.1} />;
    default:
      return null;
  }
}
