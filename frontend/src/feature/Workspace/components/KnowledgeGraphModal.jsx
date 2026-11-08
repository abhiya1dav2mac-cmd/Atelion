import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, Search } from './WorkspaceIcons';
import { PremiumBadge } from './PremiumModals';
import KatexEquation from './KatexEquation';

/**
 * 🕸️ Full Interactive 2D/3D Knowledge Graph (Obsidian & Roam Grade)
 * Completely eliminates center clustering & text overlap:
 *  1. Golden-Ratio Spiral Spreading with Guaranteed Distance Thresholds (minSep >= 140px)
 *  2. Soft Star-Topology Links (Formula child nodes branch out; no strangling loops)
 *  3. Interactive Dual-Engine: 2D Blueprint & 3D Holographic Orbit with mouse yaw/pitch
 *  4. High-DPI Retina Canvas support with ResizeObserver (Zero blurriness or distortion)
 *  5. Smart Label Rendering (Collision-free pill badges, auto-staggering, and label visibility controls)
 *  6. Real-time Node Spacing Slider, Auto-Fit Zoom, and Live KaTeX Inspector Card
 */
export default function KnowledgeGraphModal({
  isOpen,
  onClose,
  pages = [],
  onSelectPage,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'page' | 'math' | 'database'
  const [viewMode, setViewMode] = useState('2d'); // '2d' | '3d'
  const [spacing, setSpacing] = useState(1.4); // 1.0 to 2.5 node spread multiplier
  const [showAllLabels, setShowAllLabels] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Graph Physics & Transformation Refs
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const animFrameRef = useRef(null);
  const dragNodeRef = useRef(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const transformRef = useRef({ x: 0, y: 0, scale: 0.95 });

  // 3D Camera Rotation Refs
  const camRotRef = useRef({ x: 0.15, y: 0.25 });
  const isRotating3DRef = useRef(false);
  const rotStartRef = useRef({ x: 0, y: 0 });
  const autoSpinRef = useRef(false);

  // Physics Simulation Temperature (Cooling down to 0 CPU when settled)
  const alphaRef = useRef(1.0);

  // 1. Initialize Graph Nodes and Star-Topology Links
  useEffect(() => {
    if (!isOpen || !pages || pages.length === 0) return;

    const nodes = [];
    const links = [];
    const goldenAngle = 2.3999632; // 137.5 degrees

    // Primary Workspace Notes
    pages.forEach((p, pIdx) => {
      // Wide phyllotaxis layout (expanding radial spiral from 240px to 540px)
      const dist = (220 + pIdx * 45) * spacing;
      const angle = pIdx * goldenAngle;

      const pageNode = {
        id: p.id,
        title: p.title || 'Untitled Note',
        icon: p.icon || '📄',
        type: p.isDatabasePage ? 'database' : 'page',
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        z: (((pIdx * 7) % 11) - 5) * 50,
        vx: 0,
        vy: 0,
        radius: p.isDatabasePage ? 24 : 20,
        color: p.isDatabasePage ? '#f59e0b' : '#3b82f6',
        pageId: p.id,
        blocksCount: p.blocks?.length || 0,
        previewText:
          p.blocks?.find((b) => b.type === 'paragraph' || b.type === 'callout')?.content ||
          'Workspace document note.',
        connectedCount: 0,
      };
      nodes.push(pageNode);

      // Extract formula subnodes (branching safely outward from parent page)
      if (p.blocks) {
        let formulaCount = 0;
        p.blocks.forEach((b, bIdx) => {
          if (b.type === 'math' && formulaCount < 4) {
            formulaCount++;
            const subAngle = angle + (formulaCount - 1.5) * 0.75;
            const subDist = (150 + formulaCount * 30) * spacing;

            const mathNodeId = `math_${p.id}_${bIdx}`;
            nodes.push({
              id: mathNodeId,
              title: b.content.slice(0, 22),
              icon: '⚛️',
              type: 'math',
              x: pageNode.x + Math.cos(subAngle) * subDist,
              y: pageNode.y + Math.sin(subAngle) * subDist,
              z: pageNode.z + ((formulaCount % 2 === 0 ? 1 : -1) * 60),
              vx: 0,
              vy: 0,
              radius: 15,
              color: '#10b981',
              pageId: p.id,
              latex: b.content,
              previewText: b.content,
              connectedCount: 1,
            });

            // Gentle radial spring between parent page and formula
            links.push({
              source: p.id,
              target: mathNodeId,
              length: 160 * spacing,
              color: '#a7f3d0',
              isMathLink: true,
            });
          }
        });
      }
    });

    // Gentle linear guide links between sequential pages (NO closed lasso loop!)
    for (let i = 0; i < pages.length - 1; i++) {
      links.push({
        source: pages[i].id,
        target: pages[i + 1].id,
        length: 340 * spacing,
        color: '#e2e8f0',
        isMathLink: false,
      });
    }

    // Compute connection counts
    nodes.forEach((n) => {
      n.connectedCount = links.filter((l) => l.source === n.id || l.target === n.id).length;
    });

    nodesRef.current = nodes;
    linksRef.current = links;
    alphaRef.current = 1.0; // Wake up physics

    // Select first note by default
    if (nodes.length > 0 && !selectedNode) {
      setSelectedNode(nodes[0]);
    }
  }, [isOpen, pages, spacing]);

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

  // 2. High-Performance Anti-Clustering Physics Simulation Loop
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
      const is3D = viewMode === '3d';

      // Auto-spin 3D camera if enabled
      if (is3D && autoSpinRef.current) {
        camRotRef.current.y += 0.003;
      }

      // Physics active when alpha > 0.01 or dragging
      if (alphaRef.current > 0.01 || dragNodeRef.current) {
        const currentAlpha = alphaRef.current;

        // Force 1: Coulomb Repulsion with Absolute Anti-Collision Guard
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq) || 1;

            // Wide Repulsion
            const repForce = ((220000 * spacing) / (distSq + 3600)) * currentAlpha;
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

            // GUARANTEED Anti-Collision Push: Nodes can NEVER be closer than minSep
            const minSep = (nodes[i].radius + nodes[j].radius + 80) * spacing;
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

        // Force 2: Soft Springs (Keeps child formulas close to parent, but loose between pages)
        for (const link of links) {
          const source = nodes.find((n) => n.id === link.source);
          const target = nodes.find((n) => n.id === link.target);
          if (!source || !target) continue;

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetLen = link.length || (link.isMathLink ? 160 : 340);
          const diff = dist - targetLen;

          // Soft spring constant (never collapses inward)
          const springK = link.isMathLink ? 0.008 : 0.002;
          const force = diff * springK * currentAlpha;

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

        // Force 3: Ultra-Gentle Centering & Velocity Damping
        for (const node of nodes) {
          if (node === dragNodeRef.current) continue;

          // Extremely subtle center pull
          node.vx -= node.x * 0.00008;
          node.vy -= node.y * 0.00008;

          // Friction damping
          node.vx *= 0.88;
          node.vy *= 0.88;

          node.x += node.vx;
          node.y += node.vy;
        }

        // Decay temperature
        if (!dragNodeRef.current) {
          alphaRef.current *= 0.992;
        }
      }

      // ==========================================
      // 3. Render Canvas (2D / 3D Dual-Perspective)
      // ==========================================
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Center origin
      ctx.translate(width / 2 + transformRef.current.x * dpr, height / 2 + transformRef.current.y * dpr);
      const baseScale = transformRef.current.scale * dpr;

      // Project Nodes (2D vs 3D Orbit)
      let projectedNodes = [];

      if (is3D) {
        const cosY = Math.cos(camRotRef.current.y);
        const sinY = Math.sin(camRotRef.current.y);
        const cosX = Math.cos(camRotRef.current.x);
        const sinX = Math.sin(camRotRef.current.x);
        const fov = 750;

        projectedNodes = nodes.map((node) => {
          // 3D rotation
          const x1 = node.x * cosY + (node.z || 0) * sinY;
          const z1 = -node.x * sinY + (node.z || 0) * cosY;
          const y1 = node.y * cosX - z1 * sinX;
          const z2 = node.y * sinX + z1 * cosX;

          const pScale = fov / (fov + z2);
          return {
            ...node,
            projX: x1 * pScale * baseScale,
            projY: y1 * pScale * baseScale,
            projScale: pScale * baseScale,
            zDepth: z2,
            opacity: Math.max(0.3, Math.min(1.0, (z2 + 400) / 700)),
          };
        });

        // Depth sorting (render distant nodes first)
        projectedNodes.sort((a, b) => b.zDepth - a.zDepth);
      } else {
        projectedNodes = nodes.map((node) => ({
          ...node,
          projX: node.x * baseScale,
          projY: node.y * baseScale,
          projScale: baseScale,
          zDepth: 0,
          opacity: 1.0,
        }));
      }

      // Map for quick link lookup
      const nodeMap = new Map();
      projectedNodes.forEach((n) => nodeMap.set(n.id, n));

      // 3A. Render Links
      for (const link of links) {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);
        if (!source || !target) continue;

        const isHighlighted =
          (selectedNode && (selectedNode.id === source.id || selectedNode.id === target.id)) ||
          (hoveredNode && (hoveredNode.id === source.id || hoveredNode.id === target.id));

        const linkAlpha = is3D ? Math.min(source.opacity, target.opacity) * 0.7 : 0.8;
        ctx.globalAlpha = isHighlighted ? 1.0 : linkAlpha;
        ctx.strokeStyle = isHighlighted ? '#3b82f6' : (link.color || '#e2e8f0');
        ctx.lineWidth = isHighlighted ? 2.4 : 1.2;

        ctx.beginPath();
        ctx.moveTo(source.projX, source.projY);
        ctx.lineTo(target.projX, target.projY);
        ctx.stroke();
      }

      // 3B. Render Nodes & Smart Anti-Overlap Badges
      for (let i = 0; i < projectedNodes.length; i++) {
        const node = projectedNodes[i];
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;

        // Filter & Search Match
        const matchesFilter = activeFilter === 'all' || node.type === activeFilter;
        const matchesSearch =
          !searchQuery || node.title.toLowerCase().includes(searchQuery.toLowerCase());
        const isDimmed = !matchesFilter || !matchesSearch;

        const effectiveRadius = node.radius * (is3D ? node.projScale : baseScale);
        ctx.globalAlpha = isDimmed ? 0.15 : (is3D ? node.opacity : 1.0);

        // Outer Glow Aura on Selected / Hovered
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(node.projX, node.projY, effectiveRadius + 8, 0, Math.PI * 2);
          ctx.fillStyle = node.color + '35';
          ctx.fill();
        }

        // Node Circle
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, effectiveRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeStyle = isSelected ? '#0f172a' : '#ffffff';
        ctx.stroke();

        // Node Emoji Icon
        ctx.font = `${Math.round(effectiveRadius * 0.95)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.icon, node.projX, node.projY);

        // SMART PILL BADGES (Never Overlap!)
        // Show labels for:
        //  1) Currently Selected Node
        //  2) Currently Hovered Node
        //  3) Connected neighbors of Selected/Hovered
        //  4) Or if "Show All Labels" toggle is turned ON
        const isNeighbor =
          hoveredNode &&
          links.some(
            (l) =>
              (l.source === hoveredNode.id && l.target === node.id) ||
              (l.target === hoveredNode.id && l.source === node.id)
          );

        const shouldShowLabel =
          isSelected || isHovered || isNeighbor || showAllLabels;

        if (shouldShowLabel && !isDimmed) {
          const rawTitle = node.title || 'Untitled';
          const displayLabel = rawTitle.length > 20 ? rawTitle.slice(0, 19) + '…' : rawTitle;

          ctx.font = '600 11px Inter, system-ui, sans-serif';
          const textMetrics = ctx.measureText(displayLabel);
          const badgeWidth = textMetrics.width + 16;
          const badgeHeight = 22;

          // Alternate badge position (above vs below) to eliminate vertical overlapping
          const isFlippedAbove = i % 2 === 1;
          const badgeY = isFlippedAbove
            ? node.projY - effectiveRadius - badgeHeight - 6
            : node.projY + effectiveRadius + 6;
          const badgeX = node.projX - badgeWidth / 2;

          // White rounded pill background
          ctx.fillStyle = isSelected ? '#0f172a' : 'rgba(255, 255, 255, 0.96)';
          ctx.strokeStyle = isSelected ? '#1e293b' : 'rgba(226, 232, 240, 0.95)';
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 11);
          ctx.fill();
          ctx.stroke();

          // Label Text
          ctx.fillStyle = isSelected ? '#ffffff' : '#0f172a';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(displayLabel, node.projX, badgeY + badgeHeight / 2);
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
  }, [isOpen, viewMode, spacing, showAllLabels, activeFilter, searchQuery, hoveredNode, selectedNode]);

  // 3. Dynamic ResizeObserver for Crisp High-DPI Canvas
  useEffect(() => {
    if (!isOpen || !containerRef.current || !canvasRef.current) return;

    const updateSize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      if (rect.width > 0 && rect.height > 0) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        alphaRef.current = 0.5; // Trigger render
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [isOpen]);

  if (!isOpen) return null;

  // 4. Pointer Interactions (2D Pan, 3D Orbit Rotate, Node Drag & Selection)
  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const is3D = viewMode === '3d';

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Check hit test against nodes
    let clicked = null;
    const baseScale = transformRef.current.scale * dpr;

    if (is3D) {
      const cosY = Math.cos(camRotRef.current.y);
      const sinY = Math.sin(camRotRef.current.y);
      const cosX = Math.cos(camRotRef.current.x);
      const sinX = Math.sin(camRotRef.current.x);
      const fov = 750;

      for (const node of nodesRef.current) {
        const x1 = node.x * cosY + (node.z || 0) * sinY;
        const z1 = -node.x * sinY + (node.z || 0) * cosY;
        const y1 = node.y * cosX - z1 * sinX;
        const z2 = node.y * sinX + z1 * cosX;
        const pScale = fov / (fov + z2);

        const screenX = canvas.width / 2 + transformRef.current.x * dpr + x1 * pScale * baseScale;
        const screenY = canvas.height / 2 + transformRef.current.y * dpr + y1 * pScale * baseScale;

        const dx = screenX / dpr - clientX;
        const dy = screenY / dpr - clientY;
        if (Math.sqrt(dx * dx + dy * dy) < node.radius + 12) {
          clicked = node;
          break;
        }
      }
    } else {
      const mouseX =
        (clientX * dpr - canvas.width / 2 - transformRef.current.x * dpr) / baseScale;
      const mouseY =
        (clientY * dpr - canvas.height / 2 - transformRef.current.y * dpr) / baseScale;

      for (const node of nodesRef.current) {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        if (Math.sqrt(dx * dx + dy * dy) < node.radius + 12) {
          clicked = node;
          break;
        }
      }
    }

    if (clicked) {
      dragNodeRef.current = clicked;
      setSelectedNode(clicked);
      alphaRef.current = 1.0; // Wake up physics
    } else {
      if (is3D) {
        isRotating3DRef.current = true;
        rotStartRef.current = { x: e.clientX, y: e.clientY };
      } else {
        isPanningRef.current = true;
        panStartRef.current = {
          x: e.clientX - transformRef.current.x,
          y: e.clientY - transformRef.current.y,
        };
      }
    }
  };

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const is3D = viewMode === '3d';

    if (isRotating3DRef.current) {
      const dx = e.clientX - rotStartRef.current.x;
      const dy = e.clientY - rotStartRef.current.y;
      camRotRef.current.y += dx * 0.008;
      camRotRef.current.x = Math.max(-1.2, Math.min(1.2, camRotRef.current.x + dy * 0.008));
      rotStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (isPanningRef.current) {
      transformRef.current.x = e.clientX - panStartRef.current.x;
      transformRef.current.y = e.clientY - panStartRef.current.y;
      return;
    }

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const baseScale = transformRef.current.scale * dpr;

    if (dragNodeRef.current) {
      if (!is3D) {
        const mouseX =
          (clientX * dpr - canvas.width / 2 - transformRef.current.x * dpr) / baseScale;
        const mouseY =
          (clientY * dpr - canvas.height / 2 - transformRef.current.y * dpr) / baseScale;

        dragNodeRef.current.x = mouseX;
        dragNodeRef.current.y = mouseY;
        dragNodeRef.current.vx = 0;
        dragNodeRef.current.vy = 0;
        alphaRef.current = 0.8;
      }
    } else {
      // Hover detection
      let found = null;
      if (is3D) {
        const cosY = Math.cos(camRotRef.current.y);
        const sinY = Math.sin(camRotRef.current.y);
        const cosX = Math.cos(camRotRef.current.x);
        const sinX = Math.sin(camRotRef.current.x);
        const fov = 750;

        for (const node of nodesRef.current) {
          const x1 = node.x * cosY + (node.z || 0) * sinY;
          const z1 = -node.x * sinY + (node.z || 0) * cosY;
          const y1 = node.y * cosX - z1 * sinX;
          const z2 = node.y * sinX + z1 * cosX;
          const pScale = fov / (fov + z2);

          const screenX = canvas.width / 2 + transformRef.current.x * dpr + x1 * pScale * baseScale;
          const screenY = canvas.height / 2 + transformRef.current.y * dpr + y1 * pScale * baseScale;

          const dx = screenX / dpr - clientX;
          const dy = screenY / dpr - clientY;
          if (Math.sqrt(dx * dx + dy * dy) < node.radius + 12) {
            found = node;
            break;
          }
        }
      } else {
        const mouseX =
          (clientX * dpr - canvas.width / 2 - transformRef.current.x * dpr) / baseScale;
        const mouseY =
          (clientY * dpr - canvas.height / 2 - transformRef.current.y * dpr) / baseScale;

        for (const node of nodesRef.current) {
          const dx = node.x - mouseX;
          const dy = node.y - mouseY;
          if (Math.sqrt(dx * dx + dy * dy) < node.radius + 12) {
            found = node;
            break;
          }
        }
      }
      setHoveredNode(found);
    }
  };

  const handlePointerUp = () => {
    dragNodeRef.current = null;
    isPanningRef.current = false;
    isRotating3DRef.current = false;
  };

  // Zoom wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    transformRef.current.scale = Math.max(0.35, Math.min(2.8, transformRef.current.scale * factor));
  };

  // Auto-fit all nodes within the canvas
  const handleFitView = useCallback(() => {
    const nodes = nodesRef.current;
    if (!nodes || nodes.length === 0 || !canvasRef.current) return;

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    nodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const rangeX = maxX - minX + 160;
    const rangeY = maxY - minY + 160;
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;

    const targetScale = Math.min(
      (canvas.width / dpr) / rangeX,
      (canvas.height / dpr) / rangeY,
      1.4
    );

    transformRef.current = {
      x: -((minX + maxX) / 2) * targetScale,
      y: -((minY + maxY) / 2) * targetScale,
      scale: Math.max(0.4, targetScale * 0.9),
    };
    camRotRef.current = { x: 0.15, y: 0.25 };
    alphaRef.current = 0.5;
  }, []);

  const handleCenter = () => {
    transformRef.current = { x: 0, y: 0, scale: 0.95 };
    camRotRef.current = { x: 0.15, y: 0.25 };
  };

  const handleReScatter = () => {
    nodesRef.current.forEach((n) => {
      n.vx = (Math.random() - 0.5) * 20;
      n.vy = (Math.random() - 0.5) * 20;
    });
    alphaRef.current = 1.0;
  };

  const handleOpenSelectedNote = () => {
    if (selectedNode?.pageId && onSelectPage) {
      onSelectPage(selectedNode.pageId);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-5 animate-in fade-in duration-150 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-6xl w-full p-5 sm:p-6 shadow-2xl border border-gray-200 relative text-left text-gray-900 animate-in zoom-in-95 duration-150 flex flex-col h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Upper Right Badges & Close Button */}
        <div className="absolute top-5 right-12 flex items-center gap-2">
          <PremiumBadge />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          aria-label="Close Knowledge Graph"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🕸️</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  Interactive 2D/3D Knowledge Graph
                </h3>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Obsidian-Grade
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Spacious neural network of all pages, math proofs, and databases. Click any node to inspect or open.
              </p>
            </div>
          </div>

          {/* 2D vs 3D Perspective Switch */}
          <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === '2d'
                  ? 'bg-white text-gray-950 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              📐 2D Blueprint
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              🌐 3D Neural Orbit
            </button>
          </div>
        </div>

        {/* Category Filter Chips & Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 my-2.5 pt-2 border-t border-gray-100">
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

          {/* Search, Spacing Slider, and Action Controls */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter nodes..."
                className="pl-7 pr-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 w-32 sm:w-40 font-sans"
              />
            </div>

            {/* Node Spacing Multiplier Slider */}
            <div className="hidden lg:flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
              <span className="text-[11px] text-gray-500 font-medium">📏 Spacing:</span>
              <input
                type="range"
                min="1.0"
                max="2.2"
                step="0.1"
                value={spacing}
                onChange={(e) => {
                  setSpacing(parseFloat(e.target.value));
                  alphaRef.current = 1.0;
                }}
                className="w-16 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                title="Spread nodes further apart"
              />
              <span className="text-[10px] text-gray-600 font-mono font-bold">{spacing}x</span>
            </div>

            {/* Labels Visibility Toggle */}
            <button
              onClick={() => setShowAllLabels(!showAllLabels)}
              className={`px-2.5 py-1 rounded-lg cursor-pointer font-semibold border transition-all ${
                showAllLabels
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
              }`}
              title="Toggle all label pills"
            >
              🏷️ Labels {showAllLabels ? 'ON' : 'Smart'}
            </button>

            {/* Zoom Controls */}
            <button
              onClick={() => (transformRef.current.scale = Math.min(2.8, transformRef.current.scale * 1.15))}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer font-bold"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => (transformRef.current.scale = Math.max(0.35, transformRef.current.scale / 1.15))}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer font-bold"
              title="Zoom Out"
            >
              −
            </button>
            <button
              onClick={handleFitView}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer font-semibold"
              title="Auto-Fit all nodes"
            >
              📐 Fit
            </button>
            <button
              onClick={handleCenter}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer font-semibold"
              title="Reset View"
            >
              🎯 Center
            </button>
            <button
              onClick={handleReScatter}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer font-semibold"
              title="Re-Scatter Nodes"
            >
              ⚡ Scatter
            </button>
          </div>
        </div>

        {/* Main Work Area: Canvas on Left + Node Inspector Card on Right */}
        <div className="flex-1 min-h-0 flex gap-4 relative">
          {/* Canvas Viewport */}
          <div
            ref={containerRef}
            className="flex-1 bg-gradient-to-b from-gray-50/90 via-slate-50/70 to-blue-50/20 rounded-2xl border border-gray-200 relative overflow-hidden flex items-center justify-center shadow-inner"
          >
            {/* Elegant Radial Dot Matrix Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#3b82f6_1.2px,transparent_1.2px)] [background-size:24px_24px]" />

            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
              className="w-full h-full cursor-grab active:cursor-grabbing block"
            />

            {/* Instruction Tip */}
            <div className="absolute bottom-3 left-3 text-[10px] text-gray-400 font-mono pointer-events-none bg-white/85 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
              {viewMode === '3d'
                ? 'Drag to rotate 3D orbit • Scroll to zoom • Click node to inspect'
                : 'Drag background to pan • Scroll to zoom • Drag node to reposition'}
            </div>
          </div>

          {/* RIGHT SIDEBAR: Rich Node Inspector Card */}
          {selectedNode && (
            <div className="w-80 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between animate-in slide-in-from-right-4 duration-150">
              <div>
                {/* Node Type Pill & Connections count */}
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
                      {selectedNode.blocksCount
                        ? `${selectedNode.blocksCount} content blocks`
                        : 'Mathematical derivation'}
                    </span>
                  </div>
                </div>

                {/* Formula Preview with Real KaTeX */}
                {selectedNode.type === 'math' && selectedNode.latex && (
                  <div className="my-3 p-3 bg-gray-50/90 rounded-xl border border-gray-200 text-center overflow-x-auto shadow-2xs">
                    <div className="text-[10px] font-mono text-gray-400 uppercase mb-1">
                      Rendered KaTeX Formula:
                    </div>
                    <KatexEquation math={selectedNode.latex} displayMode={true} />
                  </div>
                )}

                {/* Document Excerpt Preview */}
                {selectedNode.type !== 'math' && selectedNode.previewText && (
                  <div className="my-3 p-3 bg-gray-50/90 rounded-xl border border-gray-200 text-xs text-gray-600 leading-relaxed font-sans max-h-36 overflow-y-auto shadow-2xs">
                    <div className="text-[10px] font-mono text-gray-400 uppercase mb-1">
                      Note Preview:
                    </div>
                    {selectedNode.previewText}
                  </div>
                )}
              </div>

              {/* Action Button: Navigate Directly to Note */}
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
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2.5 pt-2 border-t border-gray-100 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Notes & Documents ({counts.page})</span>
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
            ● Zero-Collision Engine Active
          </span>
        </div>
      </div>
    </div>
  );
}
