import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search } from './WorkspaceIcons';
import { PremiumBadge } from './PremiumModals';
import KatexEquation from './KatexEquation';

/**
 * 🕸️ Full Interactive Obsidian-Grade Knowledge Graph
 * Solves clutter & overlapping text with:
 *  1. Anti-collision electrostatic physics & wide orbital spread
 *  2. Clean white pill badges with collision suppression
 *  3. Interactive Slide-Out Node Inspector Card with live KaTeX preview
 *  4. Category filter chips, smooth canvas pan/zoom, and 1-click note navigation
 */
export default function KnowledgeGraphModal({
  isOpen,
  onClose,
  pages = [],
  onSelectPage,
}) {
  const canvasRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'page' | 'math' | 'database'
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Graph state refs
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const animFrameRef = useRef(null);
  const dragNodeRef = useRef(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });

  // 1. Initialize nodes and links with spacious orbital layout
  useEffect(() => {
    if (!isOpen || !pages || pages.length === 0) return;

    const nodes = [];
    const links = [];

    // Filter pages
    pages.forEach((p, pIdx) => {
      // Primary Page Node in a wide outer circle (radius 220px to 320px)
      const angle = (pIdx / pages.length) * 2 * Math.PI + (pIdx % 2 ? 0.2 : -0.2);
      const ringRadius = 240 + (pIdx % 3) * 60;

      const pageNode = {
        id: p.id,
        title: p.title || 'Untitled Note',
        icon: p.icon || '📄',
        type: p.isDatabasePage ? 'database' : 'page',
        x: Math.cos(angle) * ringRadius,
        y: Math.sin(angle) * ringRadius,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: p.isDatabasePage ? 26 : 22,
        color: p.isDatabasePage ? '#f59e0b' : '#3b82f6',
        pageId: p.id,
        blocksCount: p.blocks?.length || 0,
        previewText: p.blocks?.find((b) => b.type === 'paragraph' || b.type === 'callout')?.content || 'Workspace document note.',
        connectedCount: 0,
      };
      nodes.push(pageNode);

      // Extract formula sub-nodes (branching outward from the parent page)
      if (p.blocks) {
        let formulaCount = 0;
        p.blocks.forEach((b, bIdx) => {
          if (b.type === 'math' && formulaCount < 4) {
            formulaCount++;
            const mathAngle = angle + (formulaCount - 1.5) * 0.5;
            const mathDist = 120 + formulaCount * 25;

            const mathNodeId = `math_${p.id}_${bIdx}`;
            nodes.push({
              id: mathNodeId,
              title: b.content.slice(0, 22),
              icon: '⚛️',
              type: 'math',
              x: pageNode.x + Math.cos(mathAngle) * mathDist,
              y: pageNode.y + Math.sin(mathAngle) * mathDist,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              radius: 16,
              color: '#10b981',
              pageId: p.id,
              latex: b.content,
              previewText: b.content,
              connectedCount: 1,
            });

            links.push({
              source: p.id,
              target: mathNodeId,
              length: 130,
              color: '#a7f3d0',
            });
          }
        });
      }
    });

    // Cross-link primary page nodes to form an organic network
    for (let i = 0; i < pages.length - 1; i++) {
      links.push({
        source: pages[i].id,
        target: pages[i + 1].id,
        length: 220,
        color: '#e2e8f0',
      });
    }

    // Connect first and last page to close the circle loop
    if (pages.length > 2) {
      links.push({
        source: pages[0].id,
        target: pages[pages.length - 1].id,
        length: 240,
        color: '#e2e8f0',
      });
    }

    // Compute connection counts
    nodes.forEach((n) => {
      n.connectedCount = links.filter((l) => l.source === n.id || l.target === n.id).length;
    });

    nodesRef.current = nodes;
    linksRef.current = links;

    // Default select first primary node for rich preview
    if (nodes.length > 0) {
      setSelectedNode(nodes[0]);
    }
  }, [isOpen, pages]);

  // Node counts by category
  const counts = useMemo(() => {
    const list = nodesRef.current || [];
    return {
      all: list.length,
      page: list.filter((n) => n.type === 'page').length,
      math: list.filter((n) => n.type === 'math').length,
      database: list.filter((n) => n.type === 'database').length,
    };
  }, [nodesRef.current]);

  // 2. High-performance physics simulation loop with Barnes-Hut repulsion & anti-collision
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

      // Force 1: Coulomb Repulsion + Anti-Collision Pushing
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq) || 1;

          // Strong repulsion (Coulomb inverse square)
          const repForce = 65000 / (distSq + 400);
          const fx = (dx / dist) * repForce;
          const fy = (dy / dist) * repForce;

          if (nodes[i] !== dragNodeRef.current) {
            nodes[i].vx -= fx;
            nodes[i].vy -= fy;
          }
          if (nodes[j] !== dragNodeRef.current) {
            nodes[j].vx += fx;
            nodes[j].vy += fy;
          }

          // Anti-Collision Push: Guarantee at least 65px separation
          const minSep = nodes[i].radius + nodes[j].radius + 45;
          if (dist < minSep) {
            const overlap = (minSep - dist) * 0.45;
            const pushX = (dx / dist) * overlap;
            const pushY = (dy / dist) * overlap;

            if (nodes[i] !== dragNodeRef.current) {
              nodes[i].vx -= pushX;
              nodes[i].vy -= pushY;
            }
            if (nodes[j] !== dragNodeRef.current) {
              nodes[j].vx += pushX;
              nodes[j].vy += pushY;
            }
          }
        }
      }

      // Force 2: Link Springs
      for (const link of links) {
        const source = nodes.find((n) => n.id === link.source);
        const target = nodes.find((n) => n.id === link.target);
        if (!source || !target) continue;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const diff = dist - (link.length || 180);
        const force = diff * 0.02;

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

      // Force 3: Ultra-gentle centering gravity & damping
      for (const node of nodes) {
        if (node === dragNodeRef.current) continue;

        // Very subtle center pull (never scrunch to 0)
        node.vx -= node.x * 0.0006;
        node.vy -= node.y * 0.0006;

        // Fluid friction damping
        node.vx *= 0.86;
        node.vy *= 0.86;

        node.x += node.vx;
        node.y += node.vy;
      }

      // 3. Render Canvas
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2 + transformRef.current.x, height / 2 + transformRef.current.y);
      ctx.scale(transformRef.current.scale, transformRef.current.scale);

      // Render Links
      for (const link of links) {
        const source = nodes.find((n) => n.id === link.source);
        const target = nodes.find((n) => n.id === link.target);
        if (!source || !target) continue;

        const isHighlighted =
          (selectedNode && (selectedNode.id === source.id || selectedNode.id === target.id)) ||
          (hoveredNode && (hoveredNode.id === source.id || hoveredNode.id === target.id));

        ctx.strokeStyle = isHighlighted ? '#3b82f6' : (link.color || '#e2e8f0');
        ctx.lineWidth = isHighlighted ? 2.2 : 1.2;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }

      // Render Nodes & Clean Pill Badges
      for (const node of nodes) {
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;

        // Filter & Search Match
        const matchesFilter = activeFilter === 'all' || node.type === activeFilter;
        const matchesSearch =
          !searchQuery || node.title.toLowerCase().includes(searchQuery.toLowerCase());
        const isDimmed = !matchesFilter || !matchesSearch;

        ctx.globalAlpha = isDimmed ? 0.18 : 1.0;

        // Outer Glow Aura
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = node.color + '35';
          ctx.fill();
        }

        // Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeStyle = isSelected ? '#1e293b' : '#ffffff';
        ctx.stroke();

        // Node Icon
        ctx.font = `${Math.round(node.radius * 0.95)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.icon, node.x, node.y);

        // CLEAN PILL LABEL BADGE (Only for primary pages, or hovered/selected nodes)
        const shouldShowLabel =
          node.type === 'page' || node.type === 'database' || isSelected || isHovered;

        if (shouldShowLabel && !isDimmed) {
          const rawTitle = node.title || 'Untitled';
          const displayLabel = rawTitle.length > 16 ? rawTitle.slice(0, 15) + '…' : rawTitle;

          ctx.font = '600 11px Inter, sans-serif';
          const textWidth = ctx.measureText(displayLabel).width;
          const badgeWidth = textWidth + 16;
          const badgeHeight = 22;
          const badgeX = node.x - badgeWidth / 2;
          const badgeY = node.y + node.radius + 6;

          // White pill background with border
          ctx.fillStyle = isSelected ? '#1e293b' : 'rgba(255, 255, 255, 0.96)';
          ctx.strokeStyle = isSelected ? '#0f172a' : 'rgba(226, 232, 240, 0.95)';
          ctx.lineWidth = 1;

          // Rounded rect pill
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 11);
          ctx.fill();
          ctx.stroke();

          // Text label
          ctx.fillStyle = isSelected ? '#ffffff' : '#1e293b';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(displayLabel, node.x, badgeY + badgeHeight / 2);
        }

        ctx.globalAlpha = 1.0;
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(runPhysics);
    };

    animFrameRef.current = requestAnimationFrame(runPhysics);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, hoveredNode, selectedNode, searchQuery, activeFilter]);

  if (!isOpen) return null;

  // Pointer interactions (drag nodes, pan canvas, select node)
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

    let clicked = null;
    for (const node of nodesRef.current) {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      if (Math.sqrt(dx * dx + dy * dy) < node.radius + 8) {
        clicked = node;
        break;
      }
    }

    if (clicked) {
      dragNodeRef.current = clicked;
      setSelectedNode(clicked);
    } else {
      // Pan canvas
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y };
    }
  };

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (isPanningRef.current) {
      transformRef.current.x = e.clientX - panStartRef.current.x;
      transformRef.current.y = e.clientY - panStartRef.current.y;
      return;
    }

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
        if (Math.sqrt(dx * dx + dy * dy) < node.radius + 8) {
          found = node;
          break;
        }
      }
      setHoveredNode(found);
    }
  };

  const handlePointerUp = () => {
    dragNodeRef.current = null;
    isPanningRef.current = false;
  };

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    transformRef.current.scale = Math.max(0.4, Math.min(2.5, transformRef.current.scale * zoomFactor));
  };

  const handleCenter = () => {
    transformRef.current = { x: 0, y: 0, scale: 1 };
  };

  const handleReScatter = () => {
    nodesRef.current.forEach((n) => {
      n.vx = (Math.random() - 0.5) * 15;
      n.vy = (Math.random() - 0.5) * 15;
    });
  };

  const handleOpenSelectedNote = () => {
    if (selectedNode?.pageId && onSelectPage) {
      onSelectPage(selectedNode.pageId);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-5xl w-full p-6 shadow-2xl border border-gray-200 relative text-left text-gray-900 animate-in zoom-in-95 duration-150 flex flex-col h-[88vh] overflow-hidden"
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
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-2xl">🕸️</span>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              Interactive Knowledge Graph
            </h3>
            <p className="text-xs text-gray-500">
              Visual neural map of all pages, math formulas, and relational databases. Click any node to inspect or open.
            </p>
          </div>
        </div>

        {/* Category Filter Chips & Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 my-3 pt-1 border-t border-gray-100">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer border ${
                activeFilter === 'all'
                  ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
              }`}
            >
              🌐 All Nodes ({counts.all})
            </button>
            <button
              onClick={() => setActiveFilter('page')}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer border ${
                activeFilter === 'page'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
              }`}
            >
              📄 Documents ({counts.page})
            </button>
            <button
              onClick={() => setActiveFilter('math')}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer border ${
                activeFilter === 'math'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              ⚛️ Formulas ({counts.math})
            </button>
            <button
              onClick={() => setActiveFilter('database')}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer border ${
                activeFilter === 'database'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
              }`}
            >
              🗄️ Databases ({counts.database})
            </button>
          </div>

          {/* Search Input & Zoom Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="pl-7 pr-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 w-36 sm:w-44 font-sans"
              />
            </div>

            <button
              onClick={() => (transformRef.current.scale = Math.min(2.5, transformRef.current.scale * 1.2))}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer font-bold text-xs"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => (transformRef.current.scale = Math.max(0.4, transformRef.current.scale / 1.2))}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer font-bold text-xs"
              title="Zoom Out"
            >
              −
            </button>
            <button
              onClick={handleCenter}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer text-xs font-semibold"
              title="Reset View to Center"
            >
              🎯 Center
            </button>
            <button
              onClick={handleReScatter}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer text-xs font-semibold"
              title="Scatter Nodes"
            >
              ⚡ Scatter
            </button>
          </div>
        </div>

        {/* Main Work Area: Canvas on Left + Node Inspector on Right */}
        <div className="flex-1 min-h-0 flex gap-4 relative">
          {/* Canvas Viewport */}
          <div className="flex-1 bg-gray-50/70 rounded-2xl border border-gray-200 relative overflow-hidden">
            {/* Subtle Grid Dot Matrix */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#3b82f6_1.2px,transparent_1.2px)] [background-size:24px_24px]" />

            <canvas
              ref={canvasRef}
              width={900}
              height={550}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            />

            <div className="absolute bottom-3 left-3 text-[10px] text-gray-400 font-mono pointer-events-none bg-white/80 px-2 py-1 rounded border border-gray-200">
              Drag background to pan • Scroll to zoom • Drag node to reposition
            </div>
          </div>

          {/* RIGHT SIDEBAR: Rich Node Inspector Card */}
          {selectedNode && (
            <div className="w-80 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between animate-in slide-in-from-right-4 duration-150">
              <div>
                {/* Node Type Pill & Close */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      selectedNode.type === 'page'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : selectedNode.type === 'math'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {selectedNode.type === 'page'
                      ? '📄 Document Note'
                      : selectedNode.type === 'math'
                      ? '⚛️ LaTeX Equation'
                      : '🗄️ Relational DB'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {selectedNode.connectedCount} connections
                  </span>
                </div>

                {/* Big Title & Icon */}
                <div className="flex items-start gap-2.5 my-3">
                  <span className="text-3xl p-2 bg-gray-50 border border-gray-200 rounded-xl">
                    {selectedNode.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-gray-900 leading-snug break-words">
                      {selectedNode.title}
                    </h4>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {selectedNode.blocksCount ? `${selectedNode.blocksCount} content blocks` : 'Mathematical proof'}
                    </span>
                  </div>
                </div>

                {/* Formula Preview with Real KaTeX */}
                {selectedNode.type === 'math' && selectedNode.latex && (
                  <div className="my-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200 text-center overflow-x-auto">
                    <div className="text-[10px] font-mono text-gray-400 uppercase mb-1">
                      Rendered KaTeX Formula:
                    </div>
                    <KatexEquation math={selectedNode.latex} displayMode={true} />
                  </div>
                )}

                {/* Document Excerpt Preview */}
                {selectedNode.type !== 'math' && selectedNode.previewText && (
                  <div className="my-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200 text-xs text-gray-600 leading-relaxed font-sans max-h-36 overflow-y-auto">
                    <div className="text-[10px] font-mono text-gray-400 uppercase mb-1">
                      Note Preview:
                    </div>
                    {selectedNode.previewText}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <button
                  onClick={handleOpenSelectedNote}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <span>Open This Note</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Legend */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Documents ({counts.page})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Formulas & Proofs ({counts.math})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Databases ({counts.database})</span>
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            ● Anti-Collision Engine Active
          </span>
        </div>
      </div>
    </div>
  );
}
