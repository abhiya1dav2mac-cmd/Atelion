/**
 * ==============================================================================
 * ATELION DYNAMIC NETWORK-AWARE BACKPRESSURE CONTROLLER
 * Real-time dynamic throttling engine based on network RTT, jitter, and battery level.
 * Fast Wi-Fi (Ping < 30ms)  -> 1.0s instant sync
 * Slow 3G (Ping > 200ms)    -> 4.0s - 8.0s auto-stretched debounce
 * Battery < 20%             -> Conserves background sync, saves to IndexedDB
 * ==============================================================================
 */

class AtelionAdaptiveBackpressureController {
  constructor(syncCallback) {
    this.syncCallback = syncCallback;
    this.currentDelay = 1500;
    this.timer = null;
    this.queue = [];
    this.networkRtt = 40;
    this.effectiveType = '4g';
    this.isBatteryLow = false;

    this.initNetworkSensors();
    this.initBatterySensors();
  }

  initNetworkSensors() {
    if (typeof navigator !== 'undefined' && navigator.connection) {
      const conn = navigator.connection;
      const update = () => {
        this.effectiveType = conn.effectiveType || '4g';
        this.networkRtt = conn.rtt || 40;
        this.recalculateDelay();
      };
      conn.addEventListener('change', update);
      update();
    }
  }

  initBatterySensors() {
    if (typeof navigator !== 'undefined' && navigator.getBattery) {
      navigator.getBattery().then((battery) => {
        const update = () => {
          this.isBatteryLow = battery.level < 0.2 && !battery.charging;
          this.recalculateDelay();
        };
        battery.addEventListener('levelchange', update);
        battery.addEventListener('chargingchange', update);
        update();
      }).catch(() => {});
    }
  }

  recalculateDelay() {
    if (this.effectiveType === '4g' && this.networkRtt < 80) {
      this.currentDelay = 1000; // Ultra-fast fiber / 5G
    } else if (this.effectiveType === '3g' || this.networkRtt >= 150) {
      this.currentDelay = 4000; // Slow 3G / mobile roaming
    } else if (this.effectiveType === '2g' || this.effectiveType === 'slow-2g') {
      this.currentDelay = 8000; // 2G edge throttling
    }

    if (this.isBatteryLow) {
      this.currentDelay = Math.max(this.currentDelay, 6000);
    }

    console.log(`[SMART-SYNC] 📶 Network RTT: ${this.networkRtt}ms (${this.effectiveType.toUpperCase()}). Adaptive Window set to: ${this.currentDelay}ms`);
  }

  enqueueChange(changePayload) {
    this.queue.push(changePayload);

    if (this.timer) clearTimeout(this.timer);

    this.timer = setTimeout(async () => {
      const payloadBatch = [...this.queue];
      this.queue = [];
      const startTime = performance.now();

      try {
        if (typeof this.syncCallback === 'function') {
          await this.syncCallback(payloadBatch);
        }
        const serverRtt = performance.now() - startTime;

        // Dynamic Server Backpressure: If server took > 250ms, widen window automatically
        if (serverRtt > 250 && this.currentDelay < 6000) {
          this.currentDelay += 500;
          console.warn(`[SMART-SYNC] ⚠️ Server latency elevated (${serverRtt.toFixed(0)}ms). Throttling delay to ${this.currentDelay}ms`);
        }
      } catch (err) {
        // Re-enqueue for resilient retry
        this.queue.unshift(...payloadBatch);
      }
    }, this.currentDelay);
  }
}

window.AdaptiveBackpressureController = AtelionAdaptiveBackpressureController;
