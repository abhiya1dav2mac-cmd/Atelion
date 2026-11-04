/**
 * ==============================================================================
 * ATELION WORKSPACE ENGINE
 * - Dual-Persona Tools (Student Study Suite vs. Professional Sprint Suite)
 * - Agentic Slash-Commands (/) & Instant Widgets
 * - Browser-Local AI Heuristics (Summarizer, Flashcard Generator, Action-Items)
 * - Spaced Repetition Flashcard Engine (SuperMemo SM-2 Algorithm)
 * - Pomodoro Focus Timer with Web Audio API synthesizer
 * ==============================================================================
 */

class AtelionWorkspaceEngine {
  constructor() {
    this.currentMode = 'student'; // 'student' or 'professional'
    this.flashcards = this.loadStoredFlashcards();
    this.currentCardIndex = 0;
    this.pomodoroTimeLeft = 25 * 60;
    this.pomodoroRunning = false;
    this.pomodoroInterval = null;
    this.audioCtx = null;
  }

  // ============================================================================
  // 1. DUAL-PERSONA WORKSPACE CONTROLLER
  // ============================================================================
  setPersonaMode(mode) {
    this.currentMode = mode;
    const studentBtn = document.getElementById('btnModeStudent');
    const profBtn = document.getElementById('btnModeProf');
    const studentView = document.getElementById('personaStudentView');
    const profView = document.getElementById('personaProfView');
    const personaBadge = document.getElementById('workspacePersonaBadge');

    if (mode === 'student') {
      if (studentBtn) studentBtn.classList.add('active');
      if (profBtn) profBtn.classList.remove('active');
      if (studentView) studentView.classList.remove('hidden');
      if (profView) profView.classList.add('hidden');
      if (personaBadge) personaBadge.textContent = '🎓 Student Academic Suite Active';
      showToast('Switched to Student Academic Mode (Cornell Notes, LaTeX, Flashcards)', 'info');
    } else {
      if (profBtn) profBtn.classList.add('active');
      if (studentBtn) studentBtn.classList.remove('active');
      if (profView) profView.classList.remove('hidden');
      if (studentView) studentView.classList.add('hidden');
      if (personaBadge) personaBadge.textContent = '💼 Professional Enterprise Suite Active';
      showToast('Switched to Professional Enterprise Mode (PRDs, Mermaid Diagrams, Sprint Tasks)', 'info');
    }
  }

  // ============================================================================
  // 2. BROWSER-LOCAL CLIENT-SIDE AI ENGINE (Zero Server Cost)
  // ============================================================================
  static summarizeText(text) {
    if (!text || text.trim().length < 50) {
      return 'Text is too short to generate a summary. Please provide more content.';
    }

    const sentences = text
      .replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
      .split('|')
      .map((s) => s.trim())
      .filter((s) => s.length > 15);

    if (sentences.length <= 2) return text;

    // Word frequency scoring
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const freq = {};
    words.forEach((w) => (freq[w] = (freq[w] || 0) + 1));

    const scored = sentences.map((sentence) => {
      let score = 0;
      const sWords = sentence.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
      sWords.forEach((w) => (score += freq[w] || 0));
      return { sentence, score: score / (sWords.length || 1) };
    });

    scored.sort((a, b) => b.score - a.score);
    const topSentences = scored.slice(0, Math.min(3, Math.ceil(sentences.length * 0.4))).map((s) => s.sentence);

    return '📌 Key Summary:\n• ' + topSentences.join('\n• ');
  }

  static extractActionItems(text) {
    const lines = text.split('\n');
    const actionKeywords = /need to|must|should|todo|action|assign|review|fix|build|deploy|write|study|submit|deadline/i;
    const actions = [];

    lines.forEach((line) => {
      const clean = line.replace(/^[-*•\d.]+\s*/, '').trim();
      if (clean.length > 5 && (actionKeywords.test(clean) || clean.toLowerCase().startsWith('to '))) {
        actions.push(clean);
      }
    });

    if (actions.length === 0) {
      return ['Review document and assign ownership', 'Schedule next check-in milestone'];
    }
    return actions;
  }

  static generateFlashcardsFromText(text) {
    const sentences = text.split(/[.?!]\s+/).filter((s) => s.length > 25);
    const cards = [];

    sentences.forEach((sentence) => {
      // Look for definitions or key concepts: "X is Y" or "X refers to Y"
      const match = sentence.match(/(.+?)\s+(is|are|refers to|means|defined as)\s+(.+)/i);
      if (match && match[1].length < 50) {
        cards.push({
          question: `What is ${match[1].trim()}?`,
          answer: `${match[2]} ${match[3].trim()}`,
          interval: 1,
          repetition: 0,
          efactor: 2.5,
          nextReview: Date.now(),
        });
      }
    });

    if (cards.length === 0) {
      cards.push({
        question: 'Core Concept from note',
        answer: text.slice(0, 120) + '...',
        interval: 1,
        repetition: 0,
        efactor: 2.5,
        nextReview: Date.now(),
      });
    }

    return cards;
  }

  // ============================================================================
  // 3. SPACED REPETITION ENGINE (SuperMemo SM-2 Algorithm)
  // ============================================================================
  loadStoredFlashcards() {
    const stored = localStorage.getItem('atelion_flashcards');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    // Default starter cards for students
    return [
      {
        id: 'fc-1',
        question: 'What is Time Complexity of Binary Search?',
        answer: 'O(log n) because the search space is halved at each step.',
        interval: 1,
        repetition: 1,
        efactor: 2.5,
        nextReview: Date.now(),
      },
      {
        id: 'fc-2',
        question: 'What is CAP Theorem in Distributed Databases?',
        answer: 'Consistency, Availability, and Partition Tolerance — you can only guarantee two simultaneously.',
        interval: 1,
        repetition: 1,
        efactor: 2.5,
        nextReview: Date.now(),
      },
      {
        id: 'fc-3',
        question: 'How does WebCrypto AES-GCM ensure authentication?',
        answer: 'It produces a 128-bit authentication tag along with the ciphertext to prevent tampering.',
        interval: 2,
        repetition: 2,
        efactor: 2.6,
        nextReview: Date.now(),
      },
    ];
  }

  saveFlashcards() {
    localStorage.setItem('atelion_flashcards', JSON.stringify(this.flashcards));
  }

  gradeFlashcard(quality) {
    // quality: 0 to 5 (SM-2)
    const card = this.flashcards[this.currentCardIndex];
    if (!card) return;

    if (quality >= 3) {
      if (card.repetition === 0) {
        card.interval = 1;
      } else if (card.repetition === 1) {
        card.interval = 6;
      } else {
        card.interval = Math.round(card.interval * card.efactor);
      }
      card.repetition++;
    } else {
      card.repetition = 0;
      card.interval = 1;
    }

    // New ease factor
    card.efactor = Math.max(1.3, card.efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    card.nextReview = Date.now() + card.interval * 24 * 60 * 60 * 1000;

    this.saveFlashcards();
    this.nextFlashcard();
  }

  nextFlashcard() {
    if (this.flashcards.length === 0) return;
    this.currentCardIndex = (this.currentCardIndex + 1) % this.flashcards.length;
    this.renderCurrentFlashcard();
  }

  renderCurrentFlashcard() {
    const card = this.flashcards[this.currentCardIndex];
    const qEl = document.getElementById('fcQuestion');
    const aEl = document.getElementById('fcAnswer');
    const cardBox = document.getElementById('flashcardInner');
    const countEl = document.getElementById('fcIndexIndicator');

    if (!card) return;

    if (cardBox) cardBox.classList.remove('flipped');
    if (qEl) qEl.textContent = card.question;
    if (aEl) aEl.textContent = card.answer;
    if (countEl) countEl.textContent = `${this.currentCardIndex + 1} / ${this.flashcards.length}`;
  }

  addFlashcard(question, answer) {
    this.flashcards.push({
      id: 'fc-' + Date.now(),
      question,
      answer,
      interval: 1,
      repetition: 0,
      efactor: 2.5,
      nextReview: Date.now(),
    });
    this.saveFlashcards();
    this.renderCurrentFlashcard();
    showToast('New Spaced Repetition flashcard created!', 'success');
  }

  // ============================================================================
  // 4. POMODORO FOCUS TIMER (With Web Audio Synthesizer)
  // ============================================================================
  togglePomodoro() {
    if (this.pomodoroRunning) {
      this.pausePomodoro();
    } else {
      this.startPomodoro();
    }
  }

  startPomodoro() {
    this.pomodoroRunning = true;
    const btn = document.getElementById('btnPomodoroToggle');
    if (btn) btn.textContent = '⏸ Pause';

    this.pomodoroInterval = setInterval(() => {
      this.pomodoroTimeLeft--;
      this.updatePomodoroDisplay();

      if (this.pomodoroTimeLeft <= 0) {
        clearInterval(this.pomodoroInterval);
        this.pomodoroRunning = false;
        this.playChime();
        showToast('⏰ Pomodoro session completed! Take a 5-minute break.', 'success');
        this.pomodoroTimeLeft = 25 * 60;
        this.updatePomodoroDisplay();
        if (btn) btn.textContent = '▶ Start Focus';
      }
    }, 1000);
  }

  pausePomodoro() {
    this.pomodoroRunning = false;
    clearInterval(this.pomodoroInterval);
    const btn = document.getElementById('btnPomodoroToggle');
    if (btn) btn.textContent = '▶ Resume';
  }

  resetPomodoro() {
    this.pausePomodoro();
    this.pomodoroTimeLeft = 25 * 60;
    this.updatePomodoroDisplay();
    const btn = document.getElementById('btnPomodoroToggle');
    if (btn) btn.textContent = '▶ Start Focus';
  }

  updatePomodoroDisplay() {
    const mins = String(Math.floor(this.pomodoroTimeLeft / 60)).padStart(2, '0');
    const secs = String(this.pomodoroTimeLeft % 60).padStart(2, '0');
    const el = document.getElementById('pomodoroDisplay');
    if (el) el.textContent = `${mins}:${secs}`;
  }

  playChime() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio chime failed:', e);
    }
  }

  // ============================================================================
  // 5. AGENTIC SLASH-COMMAND EXECUTOR
  // ============================================================================
  executeSlashCommand(cmd, editorEl) {
    if (!editorEl) return;
    const cleanCmd = cmd.toLowerCase().trim();

    if (cleanCmd === '/diagram' || cleanCmd === '/flowchart') {
      const diagramCode = `\`\`\`mermaid\ngraph TD\n  Client[Browser Client] -->|E2EE WebCrypto| API[Express Edge]\n  API --> MongoDB[(Primary DB)]\n  API --> Turso[(Support SQLite)]\n\`\`\`\n`;
      this.insertAtCursor(editorEl, diagramCode);
      showToast('Inserted Mermaid Architecture Diagram', 'success');
    } else if (cleanCmd === '/quiz') {
      const quizBlock = `### 📝 Interactive Quick Quiz\n1. What algorithm does Atelion use for Zero-Knowledge encryption?\n   - [ ] RSA-2048\n   - [x] AES-GCM-256\n   - [ ] MD5\n\n`;
      this.insertAtCursor(editorEl, quizBlock);
      showToast('Inserted Quiz Widget', 'success');
    } else if (cleanCmd === '/latex' || cleanCmd === '/formula') {
      const mathBlock = `$$E = mc^2 \\quad \\text{and} \\quad \\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$\n`;
      this.insertAtCursor(editorEl, mathBlock);
      showToast('Inserted LaTeX Formula block', 'success');
    } else if (cleanCmd === '/prd' || cleanCmd === '/spec') {
      const prdTemplate = `## 📋 Product Requirement Document (PRD)\n**Objective:** \n**Target Users:** \n**Key Metrics:** \n**Technical Architecture:** \n- \n**Release Timeline:** \n`;
      this.insertAtCursor(editorEl, prdTemplate);
      showToast('Inserted Professional PRD Template', 'success');
    } else if (cleanCmd === '/cornell') {
      const cornellTemplate = `## 🎓 Cornell Notes\n**Topic:** \n**Date:** ${new Date().toLocaleDateString()}\n\n### Cues / Key Questions:\n- \n\n### Detailed Notes:\n- \n\n### Summary:\n- \n`;
      this.insertAtCursor(editorEl, cornellTemplate);
      showToast('Inserted Cornell Notes Structure', 'success');
    } else if (cleanCmd === '/summarize') {
      const text = editorEl.value;
      const summary = AtelionWorkspaceEngine.summarizeText(text);
      this.insertAtCursor(editorEl, '\n\n' + summary + '\n\n');
      showToast('Generated AI Summary on client device', 'success');
    } else if (cleanCmd === '/actions' || cleanCmd === '/todo') {
      const text = editorEl.value;
      const items = AtelionWorkspaceEngine.extractActionItems(text);
      const actionBlock = '\n### 📌 Action Items:\n' + items.map((i) => `- [ ] ${i}`).join('\n') + '\n';
      this.insertAtCursor(editorEl, actionBlock);
      showToast('Extracted Action Items checklist', 'success');
    }
  }

  insertAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    textarea.value = value.substring(0, start) + text + value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
  }
}

// Global Singleton Instance
window.workspaceEngine = new AtelionWorkspaceEngine();

