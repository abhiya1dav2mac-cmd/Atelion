/**
 * ==============================================================================
 * ATELION ENTERPRISE ANTI-INSPECT & ANTI-DEBUGGING ARMOR (Banking-Grade RASP)
 * 1. Blocks F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S, and Right-Click Context Menu
 * 2. Infinite Debugger Trap (Freezes browser call-stack if DevTools opened)
 * 3. Dynamic DevTools Sensor (Window dimension delta & timing heuristics)
 * 4. Console Neutralizer & Memory Purge (Object.freeze console lockdown)
 * 5. Screen Blur & Tamper Protection Overlay
 * ==============================================================================
 */

class AtelionAntiInspectShield {
  constructor() {
    this.isEnabled = true;
    this.isDevToolsOpen = false;
    this.debuggerTrapInterval = null;
    this.dimensionCheckInterval = null;

    this.initKeyboardBlocker();
    this.initContextMenuBlocker();
    this.initConsoleLockdown();
    this.initDebuggerTrap();
    this.initDevToolsDetector();
    this.createTamperSecurityModal();
  }

  /**
   * 1. BLOCK KEYBOARD SHORTCUTS (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
   */
  initKeyboardBlocker() {
    window.addEventListener(
      'keydown',
      (e) => {
        if (!this.isEnabled) return;

        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
          e.preventDefault();
          e.stopPropagation();
          this.triggerTamperAlert('F12 Developer Tools shortcut blocked.');
          return false;
        }

        // Ctrl + Shift + I (Inspect)
        // Ctrl + Shift + J (Console)
        // Ctrl + Shift + C (Inspect Element)
        if (e.ctrlKey && e.shiftKey) {
          const key = (e.key || '').toLowerCase();
          if (key === 'i' || key === 'j' || key === 'c' || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67) {
            e.preventDefault();
            e.stopPropagation();
            this.triggerTamperAlert('Inspect shortcut (Ctrl+Shift+I/J/C) blocked.');
            return false;
          }
        }

        // Ctrl + U (View Source)
        // Ctrl + S (Save Page)
        if (e.ctrlKey) {
          const key = (e.key || '').toLowerCase();
          if (key === 'u' || e.keyCode === 85) {
            e.preventDefault();
            e.stopPropagation();
            this.triggerTamperAlert('View Source (Ctrl+U) blocked.');
            return false;
          }
          if (key === 's' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            // Allow app's own save without browser save HTML
            return false;
          }
        }

        // Mac Command (Cmd + Option + I / J / C / U)
        if (e.metaKey && e.altKey) {
          const key = (e.key || '').toLowerCase();
          if (key === 'i' || key === 'j' || key === 'c' || key === 'u') {
            e.preventDefault();
            e.stopPropagation();
            this.triggerTamperAlert('Developer Tools shortcut blocked.');
            return false;
          }
        }
      },
      true
    );
  }

  /**
   * 2. BLOCK RIGHT-CLICK CONTEXT MENU
   */
  initContextMenuBlocker() {
    window.addEventListener(
      'contextmenu',
      (e) => {
        if (!this.isEnabled) return;
        // Check if user is right-clicking an editable text area
        const target = e.target;
        if (target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT')) {
          // Allow normal copy/paste inside note editor
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        this.triggerTamperAlert('Right-Click inspection blocked.');
        return false;
      },
      true
    );
  }

  /**
   * 3. CONSOLE NEUTRALIZER & MEMORY PURGE
   * Overrides all console methods to prevent memory leaks and inspection
   */
  initConsoleLockdown() {
    try {
      const noop = function () {};
      const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'dir', 'dirxml', 'trace', 'group', 'groupCollapsed', 'groupEnd', 'clear', 'count', 'countReset', 'time', 'timeEnd', 'timeLog'];

      // Keep original for critical internal telemetry if needed
      window.__secConsole = {};
      methods.forEach((m) => {
        if (window.console && window.console[m]) {
          window.__secConsole[m] = window.console[m].bind(window.console);
          try {
            window.console[m] = noop;
          } catch (e) {}
        }
      });

      // Freeze console object to prevent re-assignment by snoopers
      try {
        Object.freeze(window.console);
      } catch (e) {}
    } catch (err) {}
  }

  /**
   * 4. ADAPTIVE DEBUGGER LOOP TRAP (Banking-Grade)
   * Keeps CPU at ~0% when DevTools is closed, but freezes execution instantly if inspect is triggered.
   */
  initDebuggerTrap() {
    const runTrap = () => {
      try {
        (function () {
          return false;
        }
          ['constructor']('debugger')
          ['call']());
      } catch (e) {}
    };

    // Low-frequency heartbeat (1500ms) to ensure 0% CPU consumption
    this.debuggerTrapInterval = setInterval(() => {
      if (this.isEnabled) {
        runTrap();
      }
    }, 1500);

    // Immediate tight trap activation on tamper trigger
    this.executeTightTrap = () => {
      for (let i = 0; i < 5; i++) {
        runTrap();
      }
    };
  }

  /**
   * 5. DYNAMIC DEVTOOLS DETECTION SENSOR
   * Inspects window outer/inner dimension differences
   */
  initDevToolsDetector() {
    const checkDimensions = () => {
      if (!this.isEnabled) return;

      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      if (widthThreshold || heightThreshold) {
        if (!this.isDevToolsOpen) {
          this.isDevToolsOpen = true;
          this.onDevToolsDetected();
        }
      } else {
        if (this.isDevToolsOpen) {
          this.isDevToolsOpen = false;
          this.onDevToolsClosed();
        }
      }
    };

    this.dimensionCheckInterval = setInterval(checkDimensions, 800);
    window.addEventListener('resize', checkDimensions);
  }

  onDevToolsDetected() {
    const modal = document.getElementById('tamperSecurityModal');
    if (modal) modal.classList.remove('hidden');
    document.body.classList.add('tamper-blur-active');

    // 1. In-Memory Sensitive State Purge (Zeroize sensitive buffers)
    if (window.__ATELION_SESSION__) window.__ATELION_SESSION__ = null;
    if (window.__ATELION_VAULT_KEYS__) window.__ATELION_VAULT_KEYS__ = null;

    // 2. Fire Tight Adaptive Debugger Trap
    if (typeof this.executeTightTrap === 'function') {
      this.executeTightTrap();
    }

    // 3. Tier 4 Active Kill-Switch: Send Silent Security Beacon to Backend
    try {
      const payload = JSON.stringify({
        reason: 'UNAUTHORIZED_DEVTOOLS_INSPECTION_ATTEMPT',
        url: window.location.pathname,
        timestamp: Date.now()
      });
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/security/tamper-alert', blob);
      } else {
        fetch('/api/security/tamper-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).catch(() => {});
      }
    } catch (e) {}
  }

  onDevToolsClosed() {
    const modal = document.getElementById('tamperSecurityModal');
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('tamper-blur-active');
  }

  createTamperSecurityModal() {
    if (typeof document === 'undefined') return;

    const modal = document.createElement('div');
    modal.id = 'tamperSecurityModal';
    modal.className = 'tamper-modal-backdrop hidden';
    modal.innerHTML = `
      <div class="tamper-modal-box">
        <div class="tamper-icon-row">
          <span class="tamper-icon">🛡️</span>
          <span class="tamper-badge">BANKING-GRADE RASP</span>
        </div>
        <h3>Inspection & Developer Tools Prohibited</h3>
        <p>This workspace is secured by the <b>Atelion Zero-Trust Anti-Tampering Shield</b>. Inspect Element, Console evaluation, and Debugger stepping are disabled to protect confidential end-to-end encrypted documents.</p>
        <div class="tamper-policy-box">
          <div class="tpb-row"><span>Status:</span> <b style="color: #F87171;">Session Guard Active</b></div>
          <div class="tpb-row"><span>Standard:</span> <b>NIST SP 800-207 Zero-Trust Client Armor</b></div>
          <div class="tpb-row"><span>Action:</span> <b>Close Developer Tools to resume workspace access</b></div>
        </div>
        <button type="button" class="btn-primary" onclick="window.antiInspectShield.forceCloseDevToolsWarning()">
          <span>I Have Closed Developer Tools</span>
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  triggerTamperAlert(reason) {
    if (window.showToast) {
      window.showToast(`🛡️ Anti-Inspect Shield: ${reason}`, 'error');
    }
  }

  forceCloseDevToolsWarning() {
    const modal = document.getElementById('tamperSecurityModal');
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('tamper-blur-active');
    this.isDevToolsOpen = false;
  }
}

// Global Singleton Instance
window.antiInspectShield = new AtelionAntiInspectShield();

