/**
 * ==============================================================================
 * ATELION NEURAL KNOWLEDGE GRAPH
 * 60fps HTML5 Canvas Force-Directed Interactive Graph
 * Visualizes dynamic links between documents, ideas, encrypted items & tickets
 * ==============================================================================
 */

class AtelionKnowledgeGraph {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.links = [];
    this.isDragging = false;
    this.draggedNode = null;
    this.hoveredNode = null;
    this.animationFrameId = null;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.setupInteractions();
    this.initDefaultNodes();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width || 700;
    this.canvas.height = 420;
  }

  initDefaultNodes() {
    const categories = {
      core: { color: '#38BDF8', glow: 'rgba(56, 189, 248, 0.4)' },
      student: { color: '#818CF8', glow: 'rgba(129, 140, 248, 0.4)' },
      prof: { color: '#34D399', glow: 'rgba(52, 211, 153, 0.4)' },
      security: { color: '#F472B6', glow: 'rgba(244, 114, 182, 0.4)' },
      turso: { color: '#FBBF24', glow: 'rgba(251, 191, 36, 0.4)' },
    };

    this.nodes = [
      { id: '1', label: '⚡ Atelion Workspace', type: 'core', radius: 24, x: 350, y: 210, vx: 0, vy: 0 },
      { id: '2', label: '🎓 Cornell Notes', type: 'student', radius: 18, x: 230, y: 130, vx: 0, vy: 0 },
      { id: '3', label: '🧠 Spaced Repetition', type: 'student', radius: 16, x: 160, y: 240, vx: 0, vy: 0 },
      { id: '4', label: '💼 Product PRD Spec', type: 'prof', radius: 18, x: 480, y: 120, vx: 0, vy: 0 },
      { id: '5', label: '📊 Mermaid Architecture', type: 'prof', radius: 16, x: 530, y: 220, vx: 0, vy: 0 },
      { id: '6', label: '🔒 E2EE WebCrypto Vault', type: 'security', radius: 19, x: 260, y: 310, vx: 0, vy: 0 },
      { id: '7', label: '🛡️ FIDO2 Passkeys', type: 'security', radius: 16, x: 380, y: 340, vx: 0, vy: 0 },
      { id: '8', label: '🎫 Turso Isolated Helpdesk', type: 'turso', radius: 17, x: 490, y: 310, vx: 0, vy: 0 },
    ];

    this.links = [
      { source: '1', target: '2' },
      { source: '1', target: '4' },
      { source: '1', target: '6' },
      { source: '1', target: '8' },
      { source: '2', target: '3' },
      { source: '4', target: '5' },
      { source: '6', target: '7' },
      { source: '7', target: '1' },
      { source: '8', target: '4' },
    ];

    this.startSimulation();
  }

  addNode(label, type = 'core') {
    const id = 'node-' + Date.now();
    const colors = {
      core: '#38BDF8',
      student: '#818CF8',
      prof: '#34D399',
      security: '#F472B6',
      turso: '#FBBF24',
    };
    const newNode = {
      id,
      label,
      type,
      radius: 16,
      x: this.canvas.width / 2 + (Math.random() - 0.5) * 100,
      y: this.canvas.height / 2 + (Math.random() - 0.5) * 100,
      vx: 0,
      vy: 0,
    };
    this.nodes.push(newNode);
    this.links.push({ source: '1', target: id });
  }

  setupInteractions() {
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (const node of this.nodes) {
        const dx = node.x - x;
        const dy = node.y - y;
        if (Math.sqrt(dx * dx + dy * dy) <= node.radius) {
          this.isDragging = true;
          this.draggedNode = node;
          break;
        }
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.isDragging && this.draggedNode) {
        this.draggedNode.x = x;
        this.draggedNode.y = y;
        this.draggedNode.vx = 0;
        this.draggedNode.vy = 0;
      } else {
        // Detect hover
        let hovered = null;
        for (const node of this.nodes) {
          const dx = node.x - x;
          const dy = node.y - y;
          if (Math.sqrt(dx * dx + dy * dy) <= node.radius) {
            hovered = node;
            break;
          }
        }
        this.hoveredNode = hovered;
        this.canvas.style.cursor = hovered ? 'pointer' : 'default';
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.draggedNode = null;
    });
  }

  startSimulation() {
    const step = () => {
      this.updatePhysics();
      this.draw();
      this.animationFrameId = requestAnimationFrame(step);
    };
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    step();
  }

  updatePhysics() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerAttraction = 0.002;
    const repulsion = 1200;
    const linkLength = 110;
    const springStrength = 0.03;
    const damping = 0.88;

    // Center attraction
    for (const node of this.nodes) {
      if (node === this.draggedNode) continue;
      node.vx += (width / 2 - node.x) * centerAttraction;
      node.vy += (height / 2 - node.y) * centerAttraction;
    }

    // Node repulsion (Coulomb's Law)
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n1 = this.nodes[i];
        const n2 = this.nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 220) {
          const force = repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          if (n1 !== this.draggedNode) {
            n1.vx -= fx;
            n1.vy -= fy;
          }
          if (n2 !== this.draggedNode) {
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }
    }

    // Link spring tension (Hooke's Law)
    for (const link of this.links) {
      const source = this.nodes.find((n) => n.id === link.source);
      const target = this.nodes.find((n) => n.id === link.target);
      if (!source || !target) continue;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const displacement = dist - linkLength;
      const force = displacement * springStrength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (source !== this.draggedNode) {
        source.vx += fx;
        source.vy += fy;
      }
      if (target !== this.draggedNode) {
        target.vx -= fx;
        target.vy -= fy;
      }
    }

    // Position integration with boundaries
    for (const node of this.nodes) {
      if (node === this.draggedNode) continue;
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;

      // Walls
      node.x = Math.max(node.radius + 10, Math.min(width - node.radius - 10, node.x));
      node.y = Math.max(node.radius + 10, Math.min(height - node.radius - 10, node.y));
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const typeColors = {
      core: '#38BDF8',
      student: '#818CF8',
      prof: '#34D399',
      security: '#F472B6',
      turso: '#FBBF24',
    };

    // Draw connection lines
    this.ctx.lineWidth = 1.5;
    for (const link of this.links) {
      const source = this.nodes.find((n) => n.id === link.source);
      const target = this.nodes.find((n) => n.id === link.target);
      if (!source || !target) continue;

      const gradient = this.ctx.createLinearGradient(source.x, source.y, target.x, target.y);
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      gradient.addColorStop(1, 'rgba(129, 140, 248, 0.25)');

      this.ctx.strokeStyle = gradient;
      this.ctx.beginPath();
      this.ctx.moveTo(source.x, source.y);
      this.ctx.lineTo(target.x, target.y);
      this.ctx.stroke();
    }

    // Draw nodes
    for (const node of this.nodes) {
      const color = typeColors[node.type] || '#38BDF8';
      const isHovered = this.hoveredNode === node;

      // Glow halo
      this.ctx.shadowBlur = isHovered ? 20 : 10;
      this.ctx.shadowColor = color;

      this.ctx.fillStyle = isHovered ? '#ffffff' : color;
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, isHovered ? node.radius + 3 : node.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Inner border
      this.ctx.shadowBlur = 0;
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.stroke();

      // Label
      this.ctx.fillStyle = '#E2E8F0';
      this.ctx.font = isHovered ? 'bold 12px "Plus Jakarta Sans", sans-serif' : '11px "Plus Jakarta Sans", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(node.label, node.x, node.y + node.radius + 15);
    }
  }
}

window.AtelionKnowledgeGraph = AtelionKnowledgeGraph;

