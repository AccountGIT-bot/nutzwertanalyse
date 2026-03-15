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

// Investment: Animated stock chart
export function InvestmentBackground({ color, opacity = 0.2 }: { color: string; opacity?: number }) {
  const [points, setPoints] = useState<string>("");
  const [candlesticks, setCandlesticks] = useState<Array<{x: number; open: number; close: number; high: number; low: number}>>([]);
  
  useEffect(() => {
    // Generate realistic stock chart path
    const generatePath = () => {
      let path = "M 0 200";
      let y = 200;
      for (let x = 0; x <= 800; x += 10) {
        const trend = Math.sin(x / 100) * 30;
        const noise = (Math.random() - 0.5) * 40;
        y = Math.max(50, Math.min(350, y + trend / 10 + noise / 5));
        path += ` L ${x} ${y}`;
      }
      return path;
    };
    
    // Generate candlesticks
    const generateCandlesticks = () => {
      const sticks = [];
      let basePrice = 200;
      for (let i = 0; i < 20; i++) {
        const change = (Math.random() - 0.5) * 30;
        const open = basePrice;
        const close = basePrice + change;
        const high = Math.max(open, close) + Math.random() * 15;
        const low = Math.min(open, close) - Math.random() * 15;
        sticks.push({ x: 50 + i * 38, open, close, high, low });
        basePrice = close;
      }
      return sticks;
    };
    
    setPoints(generatePath());
    setCandlesticks(generateCandlesticks());
    
    const interval = setInterval(() => {
      setPoints(generatePath());
      setCandlesticks(generateCandlesticks());
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
        {/* Grid lines */}
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={`rgb(${color})`} stopOpacity="0.3" />
            <stop offset="100%" stopColor={`rgb(${color})`} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Horizontal grid lines */}
        {[...Array(8)].map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 50}
            x2="800"
            y2={i * 50}
            stroke={`rgb(${color})`}
            strokeOpacity="0.1"
            strokeWidth="1"
          />
        ))}
        
        {/* Main chart line */}
        <path
          d={points}
          fill="none"
          stroke={`rgb(${color})`}
          strokeWidth="3"
          className="stock-line"
          strokeLinecap="round"
        />
        
        {/* Area fill under chart */}
        <path
          d={`${points} L 800 400 L 0 400 Z`}
          fill="url(#chartGradient)"
          className="stock-pulse"
        />
        
        {/* Candlesticks */}
        {candlesticks.map((candle, i) => {
          const isGreen = candle.close > candle.open;
          return (
            <g key={i} className="stock-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
              {/* Wick */}
              <line
                x1={candle.x}
                y1={candle.high}
                x2={candle.x}
                y2={candle.low}
                stroke={`rgb(${color})`}
                strokeWidth="1"
                opacity="0.5"
              />
              {/* Body */}
              <rect
                x={candle.x - 6}
                y={Math.min(candle.open, candle.close)}
                width="12"
                height={Math.abs(candle.close - candle.open)}
                fill={isGreen ? `rgb(${color})` : 'transparent'}
                stroke={`rgb(${color})`}
                strokeWidth="1"
                opacity="0.6"
              />
            </g>
          );
        })}
        
        {/* Price indicators */}
        {[100, 200, 300].map((price, i) => (
          <text
            key={i}
            x="780"
            y={price}
            fill={`rgb(${color})`}
            fontSize="10"
            opacity="0.4"
            textAnchor="end"
          >
            ${(400 - price) * 10}
          </text>
        ))}
      </svg>
      
      {/* Floating price tags */}
      <div className="absolute top-[20%] right-[10%] px-3 py-1.5 rounded-lg border animate-pulse" 
        style={{ 
          background: `rgb(${color} / 0.1)`,
          borderColor: `rgb(${color} / 0.3)`,
          color: `rgb(${color})`,
        }}>
        <span className="text-xs font-mono">+12.5%</span>
      </div>
    </div>
  );
}

// Vehicle: Racing lines and motion blur
export function VehicleBackground({ color, opacity = 0.15 }: { color: string; opacity?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      {/* Speed lines */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-[1px] road-move"
            style={{
              width: `${100 + Math.random() * 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${20 + i * 4}%`,
              background: `linear-gradient(90deg, transparent, rgb(${color}), transparent)`,
              opacity: 0.3 + Math.random() * 0.3,
              animationDelay: `${Math.random() * -3}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Tachometer arc */}
      <svg className="absolute bottom-[10%] left-[10%] w-32 h-32 sm:w-48 sm:h-48 opacity-30" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={`rgb(${color})`}
          strokeWidth="2"
          strokeDasharray="200 100"
          opacity="0.5"
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="15"
          stroke={`rgb(${color})`}
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            transformOrigin: '50px 50px',
            animation: 'gearRotate 3s ease-in-out infinite alternate',
          }}
        />
        {/* RPM markers */}
        {[...Array(8)].map((_, i) => {
          const angle = -135 + i * 33.75;
          const rad = (angle * Math.PI) / 180;
          return (
            <text
              key={i}
              x={50 + Math.cos(rad) * 35}
              y={50 + Math.sin(rad) * 35}
              fill={`rgb(${color})`}
              fontSize="6"
              textAnchor="middle"
              opacity="0.6"
            >
              {i}
            </text>
          );
        })}
      </svg>
      
      {/* Motion blur streaks */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-transparent via-transparent to-transparent">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-8 rounded-full blur-sm"
            style={{
              width: '60%',
              right: `${-20 + i * 5}%`,
              top: `${30 + i * 10}%`,
              background: `linear-gradient(90deg, rgb(${color} / 0.3), transparent)`,
              animation: `roadMove ${0.5 + i * 0.2}s linear infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Real Estate: Building silhouettes
export function RealEstateBackground({ color, opacity = 0.15 }: { color: string; opacity?: number }) {
  const buildings = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      x: 5 + i * 8,
      width: 4 + Math.random() * 4,
      height: 20 + Math.random() * 50,
      delay: i * 0.3,
      windows: Math.floor(3 + Math.random() * 5),
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      {/* City skyline */}
      <div className="absolute bottom-0 left-0 right-0 h-[60%]">
        {buildings.map((building, i) => (
          <div
            key={i}
            className="absolute bottom-0 building-rise"
            style={{
              left: `${building.x}%`,
              width: `${building.width}%`,
              height: `${building.height}%`,
              background: `linear-gradient(to top, rgb(${color} / 0.4), rgb(${color} / 0.1))`,
              animationDelay: `${building.delay}s`,
              borderRadius: '4px 4px 0 0',
            }}
          >
            {/* Windows */}
            <div className="absolute inset-2 grid grid-cols-2 gap-1">
              {[...Array(building.windows * 2)].map((_, w) => (
                <div
                  key={w}
                  className="bg-white/20 rounded-sm animate-pulse"
                  style={{ 
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Crane */}
      <svg className="absolute top-[20%] right-[15%] w-24 h-32 sm:w-32 sm:h-40 opacity-30" viewBox="0 0 100 150">
        <line x1="50" y1="150" x2="50" y2="30" stroke={`rgb(${color})`} strokeWidth="3" />
        <line x1="50" y1="30" x2="90" y2="30" stroke={`rgb(${color})`} strokeWidth="2" />
        <line x1="80" y1="30" x2="80" y2="60" stroke={`rgb(${color})`} strokeWidth="1" className="animate-pulse" />
        <rect x="75" y="55" width="10" height="10" fill={`rgb(${color})`} opacity="0.5" className="animate-pulse" />
      </svg>
      
      {/* Floor plan grid */}
      <div 
        className="absolute top-[10%] left-[5%] w-32 h-24 sm:w-48 sm:h-32 opacity-20 border rounded"
        style={{ borderColor: `rgb(${color} / 0.5)` }}
      >
        <div className="w-full h-full grid grid-cols-3 grid-rows-2 gap-[1px]" style={{ background: `rgb(${color} / 0.1)` }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-black/50" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Supplier/Employee: Network graph
export function NetworkBackground({ color, opacity = 0.2 }: { color: string; opacity?: number }) {
  const nodes = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      x: 10 + (i % 4) * 25 + Math.random() * 10,
      y: 15 + Math.floor(i / 4) * 30 + Math.random() * 10,
      size: 3 + Math.random() * 3,
      delay: i * 0.2,
    }));
  }, []);

  const connections = useMemo(() => {
    const conns: Array<{from: number; to: number}> = [];
    nodes.forEach((_, i) => {
      const numConnections = 1 + Math.floor(Math.random() * 2);
      for (let c = 0; c < numConnections; c++) {
        const target = Math.floor(Math.random() * nodes.length);
        if (target !== i) {
          conns.push({ from: i, to: target });
        }
      }
    });
    return conns;
  }, [nodes]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {/* Connection lines */}
        {connections.map((conn, i) => (
          <line
            key={i}
            x1={nodes[conn.from].x}
            y1={nodes[conn.from].y}
            x2={nodes[conn.to].x}
            y2={nodes[conn.to].y}
            stroke={`rgb(${color})`}
            strokeWidth="0.5"
            className="network-line"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
        
        {/* Nodes */}
        {nodes.map((node, i) => (
          <g key={i}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill={`rgb(${color})`}
              className="network-node"
              style={{ animationDelay: `${node.delay}s` }}
            />
            {/* Pulse ring */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size + 2}
              fill="none"
              stroke={`rgb(${color})`}
              strokeWidth="0.5"
              opacity="0.3"
              className="network-node"
              style={{ animationDelay: `${node.delay + 0.5}s` }}
            />
          </g>
        ))}
      </svg>
      
      {/* Floating profile icons */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border-2 animate-pulse"
          style={{
            width: '24px',
            height: '24px',
            left: `${15 + i * 25}%`,
            top: `${60 + (i % 2) * 15}%`,
            borderColor: `rgb(${color} / 0.5)`,
            background: `rgb(${color} / 0.2)`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

// Product: Floating showcase
export function ProductBackground({ color, opacity = 0.15 }: { color: string; opacity?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      {/* Floating product boxes */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute product-float"
          style={{
            left: `${10 + i * 20}%`,
            top: `${20 + (i % 3) * 20}%`,
            width: `${40 + i * 10}px`,
            height: `${50 + i * 10}px`,
            background: `linear-gradient(135deg, rgb(${color} / 0.3), rgb(${color} / 0.1))`,
            border: `1px solid rgb(${color} / 0.3)`,
            borderRadius: '8px',
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
      
      {/* Comparison arrows */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100">
        <path
          d="M 30 50 L 45 50 M 40 45 L 45 50 L 40 55"
          stroke={`rgb(${color})`}
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
        />
        <path
          d="M 55 50 L 70 50 M 65 45 L 70 50 L 65 55"
          stroke={`rgb(${color})`}
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />
      </svg>
      
      {/* Star ratings */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute flex gap-0.5 animate-pulse"
          style={{
            left: `${20 + i * 30}%`,
            bottom: `${15 + i * 5}%`,
            animationDelay: `${i * 0.3}s`,
          }}
        >
          {[...Array(5)].map((_, s) => (
            <svg key={s} className="w-3 h-3" viewBox="0 0 24 24" fill={s < 3 + i ? `rgb(${color})` : 'none'} stroke={`rgb(${color})`}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      ))}
    </div>
  );
}

// Machines: Gears and technical elements
export function MachinesBackground({ color, opacity = 0.15 }: { color: string; opacity?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      {/* Large gear */}
      <svg className="absolute top-[10%] left-[5%] w-32 h-32 sm:w-48 sm:h-48 gear-rotate opacity-40" viewBox="0 0 100 100">
        <path
          d="M50 10 L55 10 L55 5 L60 5 L60 10 L65 15 L70 15 L70 20 L75 20 L80 25 L80 30 L85 30 L85 35 L90 40 L90 45 L95 50 L90 55 L90 60 L85 65 L85 70 L80 75 L80 80 L75 80 L70 85 L70 90 L65 90 L60 95 L55 95 L55 90 L50 90 L45 95 L40 95 L40 90 L35 90 L30 85 L30 80 L25 80 L20 75 L20 70 L15 65 L15 60 L10 55 L10 50 L5 50 L10 45 L10 40 L15 35 L15 30 L20 25 L20 20 L25 20 L30 15 L35 15 L40 10 L40 5 L45 5 L45 10 Z"
          fill="none"
          stroke={`rgb(${color})`}
          strokeWidth="2"
        />
        <circle cx="50" cy="50" r="15" fill="none" stroke={`rgb(${color})`} strokeWidth="2" />
      </svg>
      
      {/* Small gear */}
      <svg className="absolute bottom-[20%] right-[10%] w-20 h-20 sm:w-28 sm:h-28 gear-rotate-reverse opacity-30" viewBox="0 0 100 100">
        <path
          d="M50 15 L55 15 L55 10 L60 10 L65 15 L70 15 L75 20 L75 25 L80 25 L85 30 L85 35 L90 40 L90 45 L85 50 L90 55 L90 60 L85 65 L85 70 L80 75 L75 75 L75 80 L70 85 L65 85 L60 90 L55 90 L55 85 L50 85 L45 90 L40 90 L35 85 L30 85 L25 80 L25 75 L20 75 L15 70 L15 65 L10 60 L10 55 L15 50 L10 45 L10 40 L15 35 L15 30 L20 25 L25 25 L25 20 L30 15 L35 15 L40 10 L45 10 L45 15 Z"
          fill="none"
          stroke={`rgb(${color})`}
          strokeWidth="2"
        />
        <circle cx="50" cy="50" r="10" fill="none" stroke={`rgb(${color})`} strokeWidth="2" />
      </svg>
      
      {/* Technical grid */}
      <div 
        className="absolute top-[40%] left-[30%] w-40 h-28 sm:w-56 sm:h-36 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgb(${color} / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgb(${color} / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />
      
      {/* Measurement lines */}
      <svg className="absolute bottom-[10%] left-[20%] w-48 h-16 opacity-30" viewBox="0 0 200 50">
        <line x1="10" y1="25" x2="190" y2="25" stroke={`rgb(${color})`} strokeWidth="1" />
        <line x1="10" y1="20" x2="10" y2="30" stroke={`rgb(${color})`} strokeWidth="1" />
        <line x1="190" y1="20" x2="190" y2="30" stroke={`rgb(${color})`} strokeWidth="1" />
        {[...Array(9)].map((_, i) => (
          <line key={i} x1={30 + i * 20} y1="22" x2={30 + i * 20} y2="28" stroke={`rgb(${color})`} strokeWidth="0.5" />
        ))}
        <text x="100" y="45" fill={`rgb(${color})`} fontSize="10" textAnchor="middle">180 cm</text>
      </svg>
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
  
  const opacity = 0.2;
  
  switch (categoryId) {
    case 'software':
      return <SoftwareBackground color={color} opacity={opacity} />;
    case 'investment':
      return <InvestmentBackground color={color} opacity={0.25} />;
    case 'vehicle':
      return <VehicleBackground color={color} opacity={opacity} />;
    case 'realEstate':
      return <RealEstateBackground color={color} opacity={opacity} />;
    case 'supplier':
    case 'employee':
      return <NetworkBackground color={color} opacity={opacity} />;
    case 'product':
      return <ProductBackground color={color} opacity={opacity} />;
    case 'machines':
      return <MachinesBackground color={color} opacity={opacity} />;
    default:
      return null;
  }
}
