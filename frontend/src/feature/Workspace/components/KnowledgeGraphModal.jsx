import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from './WorkspaceIcons';
import { PremiumBadge } from './PremiumModals';

/**
 * 🕸️ Full Interactive Physics-Based Knowledge Graph
 * Real-time 2D Canvas force-directed graph connecting workspace pages, math formulas, and databases
 */
export default function KnowledgeGraphModal({
  isOpen,
  onClose,
  pages = [],
  onSelectPage,
}) {
  const canvasRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'pages', 'math', 'databases'
  const [hoveredNode, setHoveredNode] = useState(null);

  // Graph state refs
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const animFrameRef = useRef(null);
  const dragNodeRef = useRef(null);
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });

  // Initialize graph nodes & links whenever pages change or modal opens
  useEffect(() => {
    if (!isOpen || !pages || pages.length === 0) return;

    const nodes = [];
    const links = [];

    // 1. Create primary page nodes
    pages.forEach((p, idx) => {
      const angle = (idx / pages.length) * 2 * Math.PI;
      const radius = 140 + (idx % 2) * 50;

      nodes.push({
        id: p.id,
        title: p.title,
        icon: p.icon || '📄',
        type: p.isDatabasePage ? 'database' : 'page',
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: p.isDatabasePage ? 24 : 20,
        color: p.isDatabasePage ? '#f59e0b' : '#3b82f6',
        pageId: p.id,
        blocksCount: p.blocks?.length || 0,
      });

      // 2. Extract formula child nodes for math pages
      if (p.blocks) {
        p.blocks.forEach((b, bIdx) => {
          if (b.type === 'math') {
            const mathNodeId = `math_${p.id}_${bIdx}`;
            nodes.push({
              id: mathNodeId,
              title: b.content.slice(0, 18) + '...',
              icon: '⚛️',
              type: 'math',
              x: Math.cos(angle) * radius + (Math.random() - 0.5) * 80,
              y: Math.sin(angle) * radius + (Math.random() - 0.5) * 80,
              vx: 0,
              vy: 0,
              radius: 14,
              color: '#10b981',
              pageId: p.id,
              latex: b.content,
            });

            links.push({
              source: p.id,
              target: mathNodeId,
              length: 65,
            });
          }
        });
      }
    });

    // 3. Connect page nodes to each other
    for (let i = 0; i < pages.length - 1; i++) {
      links.push({
        source: pages[i].id,
        target: pages[i + 1].id,
        length: 120,
      });
    }

    nodesRef.current = nodes;
    linksRef.current = links;
  }, [isOpen, pages]);

  // Physics animation loop
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const runPhysics = () => {
      const nodes = nodesRef.current;
      const links = linksRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Force 1: Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 260) {
            const force = 350 / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            if (nodes[i] !== dragNodeRef.current) {
              nodes[i].vx -= fx;
              nodes[i].vy -= fy;
            }
            if (nodes[j] !== dragNodeRef.current) {
              nodes[j].vx += fx;
              nodes[j].vy += fy;
            }
          }
        }
      }

      // Force 2: Spring attraction along links
      for (const link of links) {
        const source = nodes.find((n) => n.id === link.source);
        const target = nodes.find((n) => n.id === link.target);
        if (!source || !target) continue;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const diff = dist - (link.length || 90);
        const force = diff * 0.04;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (source !== dragNodeRef.current) {
          source.vx += fx;
          source.vy += fy;
        }
        if (target !== dragNodeRef.current) {
          target.vx -= fx;
          target.vy -= fy;
        }
      }

      // Force 3: Center gravity & update position
      for (const node of nodes) {
        if (node === dragNodeRef.current) continue;
        node.vx -= node.x * 0.005;
        node.vy -= node.y * 0.005;

        // Damping
        node.vx *= 0.88;
        node.vy *= 0.88;

        node.x += node.vx;
        node.y += node.vy;
      }

      // Render Canvas
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2 + transformRef.current.x, height / 2 + transformRef.current.y);
      ctx.scale(transformRef.current.scale, transformRef.current.scale);

      // Draw Links
      ctx.lineWidth = 1.2;
      for (const link of links) {
        const source = nodes.find((n) => n.id === link.source);
        const target = nodes.find((n) => n.id === link.target);
        if (!source || !target) continue;

        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }

      // Draw Nodes
      for (const node of nodes) {
        const isHovered = hoveredNode?.id === node.id;
        const isHighlighted =
          !searchQuery || node.title.toLowerCase().includes(searchQuery.toLowerCase());

        // Outer glow
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = node.color + '33';
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isHighlighted ? node.color : '#cbd5e1';
        ctx.shadowColor = 'rgba(0,0,0,0.08)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Node Icon
        ctx.font = `${node.radius * 0.9}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.icon, node.x, node.y);

        // Node Label
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillStyle = isHighlighted ? '#1e293b' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(node.title, node.x, node.y + node.radius + 4);
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(runPhysics);
    };

    animFrameRef.current = requestAnimationFrame(runPhysics);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, hoveredNode, searchQuery]);

  if (!isOpen) return null;

  // Pointer drag & hover interaction
  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX =
      (e.clientX - rect.left - canvas.width / 2 - transformRef.current.x) /
      transformRef.current.scale;
    const mouseY =
      (e.clientY - rect.top - canvas.height / 2 - transformRef.current.y) /
      transformRef.current.scale;

    for (const node of nodesRef.current) {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      if (Math.sqrt(dx * dx + dy * dy) < node.radius + 5) {
        dragNodeRef.current = node;
        break;
      }
    }
  };

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX =
      (e.clientX - rect.left - canvas.width / 2 - transformRef.current.x) /
      transformRef.current.scale;
    const mouseY =
      (e.clientY - rect.top - canvas.height / 2 - transformRef.current.y) /
      transformRef.current.scale;

    if (dragNodeRef.current) {
      dragNodeRef.current.x = mouseX;
      dragNodeRef.current.y = mouseY;
      dragNodeRef.current.vx = 0;
      dragNodeRef.current.vy = 0;
    } else {
      let found = null;
      for (const node of nodesRef.current) {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        if (Math.sqrt(dx * dx + dy * dy) < node.radius + 5) {
          found = node;
          break;
        }
      }
      setHoveredNode(found);
    }
  };

  const handlePointerUp = (e) => {
    if (dragNodeRef.current) {
      const dragged = dragNodeRef.current;
      dragNodeRef.current = null;
      // If was a quick click, navigate to page
      if (dragged.pageId && onSelectPage) {
        onSelectPage(dragged.pageId);
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-gray-200 relative text-left text-gray-900 animate-in zoom-in-95 duration-150 flex flex-col h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Upper Right Corner Badges & Close */}
        <div className="absolute top-5 right-12 flex items-center gap-2">
          <PremiumBadge />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🕸️</span>
          <h3 className="text-lg font-bold text-gray-900">Interactive 2D/3D Knowledge Graph</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Neural network of your workspace. Drag nodes to explore connections, or click any node to navigate directly.
        </p>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter nodes (e.g. Quantum, Calculus)..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 shadow-2xs font-sans"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() =>
                (transformRef.current.scale = Math.min(2, transformRef.current.scale * 1.2))
              }
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer font-bold"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() =>
                (transformRef.current.scale = Math.max(0.5, transformRef.current.scale / 1.2))
              }
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer font-bold"
              title="Zoom Out"
            >
              −
            </button>
            <button
              onClick={() => {
                transformRef.current = { x: 0, y: 0, scale: 1 };
              }}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer text-xs"
              title="Reset View"
            >
              🎯 Center
            </button>
          </div>
        </div>

        {/* Canvas Graph Viewport */}
        <div className="flex-1 bg-gray-50/70 rounded-2xl border border-gray-200 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />

          <canvas
            ref={canvasRef}
            width={850}
            height={500}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />

          {hoveredNode && (
            <div className="absolute bottom-4 left-4 p-3 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg text-xs pointer-events-none animate-in fade-in duration-100 font-sans">
              <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-0.5">
                <span>{hoveredNode.icon}</span>
                <span>{hoveredNode.title}</span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                Type: {hoveredNode.type.toUpperCase()} • Click to open
              </p>
            </div>
          )}
        </div>

        {/* Bottom Legend */}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-3 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Notes & Documents
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Formulas & Proofs
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Relational Databases
            </span>
          </div>
          <span>Physics Simulation Active</span>
        </div>
      </div>
    </div>
  );
}
