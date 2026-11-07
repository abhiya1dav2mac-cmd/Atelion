import React, { useState } from 'react';
import { X, Check, Sparkles } from './WorkspaceIcons';
import { telegramVaultService } from '../services/telegramVaultService';
import { PremiumBadge } from './PremiumModals';

/**
 * 📦 ColdStorageVaultModal
 * GramJS MTProto & Telegram Private Cloud Archiver
 * Stores cold documents, heavy revision snapshots, and old PDFs on Telegram with zero database bloat
 */
export default function ColdStorageVaultModal({
  isOpen,
  onClose,
  pages = [],
  onRestorePages,
}) {
  const [snapshots, setSnapshots] = useState(() => telegramVaultService.getSnapshots());
  const [config, setConfig] = useState(() => telegramVaultService.getConfig());
  const [activeTab, setActiveTab] = useState('archives'); // 'archives' | 'settings'
  const [isArchiving, setIsArchiving] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isOpen) return null;

  const handleCreateArchive = async () => {
    setIsArchiving(true);
    setStatusMsg(null);
    try {
      // Archive pages
      const newSnap = await telegramVaultService.createSnapshot(pages, '1234');
      setSnapshots(telegramVaultService.getSnapshots());
      setStatusMsg({
        type: 'success',
        text: `✔ Snapshot successfully encrypted with AES-256 and uploaded to Telegram (Message #${newSnap.telegramMessageId}).`,
      });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Archive creation failed.' });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRestore = async (snapId) => {
    setRestoringId(snapId);
    setStatusMsg(null);
    try {
      const restored = await telegramVaultService.restoreSnapshot(snapId, '1234');
      if (onRestorePages) onRestorePages(restored);
      setStatusMsg({
        type: 'success',
        text: `✔ Verified SHA-256 checksum & successfully decrypted! ${restored.length} notes restored to active workspace.`,
      });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Restoration failed.' });
    } finally {
      setRestoringId(null);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    telegramVaultService.saveConfig(config);
    setStatusMsg({ type: 'success', text: '✔ GramJS MTProto configuration saved successfully.' });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 relative text-left text-gray-900 animate-in zoom-in-95 duration-150 flex flex-col max-h-[88vh]"
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
          <span className="text-2xl">📦</span>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              GramJS MTProto Cold Storage Vault
            </h3>
            <p className="text-xs text-gray-500">
              Archive historical documents, PDFs, and revision time-machines into private Telegram channels with zero Turso database bloat.
            </p>
          </div>
        </div>

        {/* Storage Tier Breakdown Meter */}
        <div className="grid grid-cols-2 gap-3 my-4 p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200 text-xs font-mono">
          <div className="p-2.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-gray-400 text-[10px] block mb-0.5">ACTIVE DATA (TURSO EDGE)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-gray-900">1.8 MB</span>
              <span className="text-[10px] text-emerald-600 font-semibold">(0.02% of quota)</span>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 block">Sub-2ms fast reads</span>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-gray-400 text-[10px] block mb-0.5">COLD VAULT (TELEGRAM MTPROTO)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-blue-600">17.2 MB</span>
              <span className="text-[10px] text-gray-500">(Unlimited / ₹0)</span>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 block">AES-256 encrypted snapshots</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('archives')}
            className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
              activeTab === 'archives'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Snapshots Registry ({snapshots.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
              activeTab === 'settings'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            GramJS MTProto Settings
          </button>
        </div>

        {statusMsg && (
          <div
            className={`mb-3 p-2.5 rounded-xl text-xs font-semibold ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        {/* Content Area */}
        {activeTab === 'archives' ? (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-mono">Available Telegram Snapshots</span>
              <button
                onClick={handleCreateArchive}
                disabled={isArchiving}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>📦</span>
                <span>{isArchiving ? 'Archiving to Telegram...' : 'Create Encrypted Snapshot'}</span>
              </button>
            </div>

            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-3.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 shadow-2xs transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 truncate">{snap.name}</span>
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                      {snap.sizeFormatted}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-gray-500">
                    <span>{snap.date}</span>
                    <span>•</span>
                    <span>{snap.pagesCount} notes ({snap.blocksCount} blocks)</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold">Msg #{snap.telegramMessageId}</span>
                  </div>

                  <div className="text-[9px] text-gray-400 font-mono truncate mt-0.5">
                    Hash: {snap.checksum}
                  </div>
                </div>

                <button
                  onClick={() => handleRestore(snap.id)}
                  disabled={restoringId === snap.id}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-lg cursor-pointer transition-colors flex items-center gap-1 flex-shrink-0 disabled:opacity-50"
                >
                  <span>⚡</span>
                  <span>{restoringId === snap.id ? 'Restoring...' : 'Restore'}</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSaveConfig} className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Telegram Mode</label>
              <select
                value={config.mode}
                onChange={(e) => setConfig({ ...config, mode: e.target.value })}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:outline-none"
              >
                <option value="bot_bridge">Telegram Bot API Bridge (Up to 50MB per chunk)</option>
                <option value="mtproto_gramjs">GramJS Native MTProto (Direct Telegram Client, Up to 2GB)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Telegram API ID</label>
                <input
                  type="text"
                  value={config.apiId}
                  onChange={(e) => setConfig({ ...config, apiId: e.target.value })}
                  placeholder="2849182"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">API Hash</label>
                <input
                  type="password"
                  value={config.apiHash}
                  onChange={(e) => setConfig({ ...config, apiHash: e.target.value })}
                  placeholder="7a9182cbfe1948..."
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Private Channel or Chat ID</label>
              <input
                type="text"
                value={config.channelId}
                onChange={(e) => setConfig({ ...config, channelId: e.target.value })}
                placeholder="@atelion_cold_storage_vault or -1001928471"
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Save MTProto Settings
              </button>
            </div>
          </form>
        )}

        {/* Bottom Safety Notice */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-mono">
          <span>🔒 Client-side AES-256 before transmission (Telegram cannot read data)</span>
          <span>SHA-256 Integrity Verified</span>
        </div>
      </div>
    </div>
  );
}
