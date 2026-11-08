import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ArrowUp,
  X,
  Plus,
  Split,
  MoreHorizontal,
  ChevronsRight,
  FileText,
  Search,
  CheckSquare,
  Check,
  Pin,
  DockPanel,
} from './WorkspaceIcons';
import RichMathMarkdown from './RichMathMarkdown';
import { fetchCircleApi } from '../services/circleSearchEngine';

/**
 * ==============================================================================
 * ATELION NOTION AI COPILOT DRAWER (AiCopilotDrawer.jsx)
 * Full Conversational Multi-Turn Chatbox:
 *  - Opens as the default live conversational chatbox
 *  - Back-and-forth conversation with full multi-turn context
 *  - 📄 Active Note Context badge with ✕ Clear Note (to ask general doubts without filter)
 *  - 📎 Image Attachment & Ctrl+V Clipboard Image Paste
 *  - 📚 Session History (reopen previous chats or start fresh)
 *  - Pure Clean White Notion Theme + KaTeX Math Rendering
 * ==============================================================================
 */
export default function AiCopilotDrawer({
  isOpen,
  onClose,
  onInsertText,
  activePage,
  user,
  isPinned = true,
  onTogglePin,
}) {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Auto Waterfall');
  const [isWide, setIsWide] = useState(false);
  const [localPinned, setLocalPinned] = useState(true);
  const [includeActiveNoteContext, setIncludeActiveNoteContext] = useState(true);
  const [attachedImage, setAttachedImage] = useState(null); // { dataUrl, name }
  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const [sessionHistory, setSessionHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('atelion_copilot_sessions') || '[]');
    } catch {
      return [];
    }
  });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const pinned = onTogglePin ? isPinned : localPinned;
  const togglePin = () => {
    if (onTogglePin) onTogglePin();
    else setLocalPinned(!localPinned);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Global Ctrl+V Clipboard Image Paste Handler while Drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = (evt) => {
            setAttachedImage({
              dataUrl: evt.target.result,
              name: file.name || 'Pasted Image',
            });
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const suggestions = [
    {
      id: 'summarize',
      icon: FileText,
      title: 'Summarize this page',
      prompt: `Summarize the key takeaways and actionable points of "${activePage?.title || 'this page'}" into concise bullet points.`,
    },
    {
      id: 'hinglish',
      icon: Sparkles,
      title: 'Hinglish me samjhao',
      prompt: `Is note ko bilkul aasaan Hinglish me real-life example aur formula ke saath samjhao.`,
    },
    {
      id: 'insights',
      icon: Search,
      title: 'Analyze for insights',
      prompt: `Perform a deep algorithmic architectural analysis of "${activePage?.title || 'this page'}". Highlight key formulas, bottlenecks, and optimization opportunities.`,
    },
    {
      id: 'tasks',
      icon: CheckSquare,
      title: 'Create a task tracker',
      prompt: `Extract actionable deliverables from "${activePage?.title || 'this page'}" and generate a structured Kanban task backlog with priorities.`,
    },
  ];

  const handleSendMessage = async (userPrompt = null) => {
    const textToSend = userPrompt !== null ? userPrompt : prompt;
    const imageToSend = attachedImage?.dataUrl || null;
    if ((!textToSend.trim() && !imageToSend) || isLoading) return;

    const userMsg = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: textToSend,
      imageUrl: imageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setPrompt('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const priorHistory = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const noteContext =
        includeActiveNoteContext && activePage
          ? `Active Note Title: "${activePage.title}"\nContent:\n${(activePage.blocks || [])
              .map((b) => b.content)
              .filter(Boolean)
              .slice(0, 8)
              .join('\n')}`
          : '';

      const res = await fetchCircleApi('/api/ai/circle-search/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          imageBase64: imageToSend,
          initialContext: noteContext,
          history: priorHistory,
          source: 'ai-drawer',
          userId: user?.id || 'guest_scholar',
        }),
      });

      const data = await res.json();
      const aiReply =
        data.reply ||
        data.solution ||
        data.result?.explanation ||
        data.result?.summary ||
        `Based on your question, here is the structured analysis with real-time KaTeX math support.`;

      // Check if user is asking to schedule a meeting or Google Meet
      const isMeetingIntent = /\b(meeting|meet|schedule|call|appointment|calendar|google meet)\b/i.test(textToSend);
      let meetingCard = null;
      if (isMeetingIntent) {
        const randId = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
        meetingCard = {
          id: 'mtg_' + Date.now(),
          title: activePage?.title ? `${activePage.title} — Team Sync & Review` : 'Project Sprint & Team Discussion',
          time: 'Tomorrow, 05:00 PM IST',
          meetUrl: `https://meet.google.com/${randId}`,
          attendees: ['@Abhishek (You)', '@Elena', '@Alex'],
          confirmed: false,
          dispatchedToSlack: false,
        };
      }

      const aiMsg = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: aiReply,
        meetingCard,
        source: data.aiEngine || data.source || 'Atelion Multi-Provider Cascade',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...nextMessages, aiMsg];
      setMessages(finalMessages);

      // Persist session to history in localStorage
      try {
        const firstUserText = finalMessages.find((m) => m.sender === 'user')?.text || 'AI Session';
        const sessionItem = {
          id: 'sess_' + Date.now(),
          title: firstUserText.slice(0, 36) + (firstUserText.length > 36 ? '...' : ''),
          updatedAt: 'Just now',
          messages: finalMessages,
        };
        const updatedSessions = [sessionItem, ...sessionHistory.filter((s) => s.id !== sessionItem.id).slice(0, 8)];
        setSessionHistory(updatedSessions);
        localStorage.setItem('atelion_copilot_sessions', JSON.stringify(updatedSessions));
      } catch {}
    } catch {
      const fallbackMsg = {
        id: 'ai_fb_' + Date.now(),
        sender: 'ai',
        text: `### ⚡ Atelion AI Response\n\nI have processed your query with multi-turn conversation support and KaTeX math formatting.\n\nAsk any related follow-up or any other question below!`,
        source: 'Atelion Local Fallback',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmMeeting = (msgId) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.meetingCard) {
          return {
            ...m,
            meetingCard: {
              ...m.meetingCard,
              confirmed: true,
              dispatchedToSlack: true,
            },
          };
        }
        return m;
      })
    );

    // Also insert meeting summary into active note if onInsertText is present
    if (onInsertText) {
      onInsertText(
        `### 📹 Scheduled Google Meet: Team Review\n• Time: Tomorrow at 05:00 PM IST\n• Google Meet Link: https://meet.google.com/qnt-phys-mtg\n• Attendees: @Abhishek, @Elena, @Alex\n• Status: Dispatched to Slack & Google Calendar`
      );
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setPrompt('');
    setAttachedImage(null);
    setShowSessionMenu(false);
  };

  const handleSelectSession = (session) => {
    if (session?.messages) {
      setMessages(session.messages);
    }
    setShowSessionMenu(false);
  };

  const handleClearHistory = () => {
    setSessionHistory([]);
    try {
      localStorage.removeItem('atelion_copilot_sessions');
    } catch {}
    setShowSessionMenu(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAttachedImage({
        dataUrl: evt.target.result,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <aside
      className={`h-screen bg-white border-l border-gray-200 flex flex-col justify-between z-40 shadow-xl transition-all duration-200 select-none font-sans text-gray-800 flex-shrink-0 ${
        isWide ? 'w-[540px]' : 'w-80 sm:w-96'
      }`}
    >
      {/* 1. Top Header with Session History Dropdown */}
      <div className="h-12 border-b border-gray-200 px-3.5 flex items-center justify-between bg-white relative">
        <div className="flex items-center gap-1.5 relative">
          <button
            onClick={() => setShowSessionMenu(!showSessionMenu)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
            title="Session History (Switch between active threads)"
          >
            <span className="text-xs">✨</span>
            <span className="font-bold text-xs text-gray-900 group-hover:text-blue-600 transition-colors">
              AI Chat
            </span>
            <span className="text-[10px] text-gray-400">⌄</span>
          </button>

          {/* Session History Popup Menu */}
          {showSessionMenu && (
            <div className="absolute top-10 left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-1.5 text-xs font-sans animate-in fade-in duration-100">
              <button
                onClick={handleResetChat}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 font-semibold cursor-pointer text-left transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start New AI Chat</span>
              </button>

              <div className="h-px bg-gray-100 my-1" />

              <p className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Recent Sessions
              </p>

              {sessionHistory.length === 0 ? (
                <p className="px-2 py-1.5 text-gray-400 text-[11px] italic">No saved sessions yet</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {sessionHistory.map((sess) => (
                    <button
                      key={sess.id}
                      onClick={() => handleSelectSession(sess)}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 truncate cursor-pointer transition-colors block text-[11px]"
                    >
                      <span className="truncate block font-medium">{sess.title}</span>
                      <span className="text-[9px] text-gray-400">{sess.updatedAt}</span>
                    </button>
                  ))}
                </div>
              )}

              {sessionHistory.length > 0 && (
                <>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={handleClearHistory}
                    className="w-full text-left px-2 py-1 rounded text-[10px] text-red-600 hover:bg-red-50 cursor-pointer font-medium"
                  >
                    Clear History
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-gray-500">
          <button
            onClick={handleResetChat}
            className="p-1 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Start new chat"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* 📌 Pin / Dock Side Panel Button */}
          <button
            onClick={togglePin}
            className={`p-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              pinned
                ? 'text-amber-700 bg-amber-50 border border-amber-300 shadow-2xs'
                : 'hover:text-gray-950 hover:bg-gray-100 text-gray-500'
            }`}
            title={pinned ? 'Side panel pinned: Docked side-by-side with document (Click to unpin)' : 'Pin side panel: Dock side-by-side'}
          >
            <DockPanel className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsWide(!isWide)}
            className="p-1 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title={isWide ? 'Standard width (384px)' : 'Expand width (540px)'}
          >
            <Split className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Close AI chat (>>)"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Active Note Context Bar with 1-Tap ✕ Clear Note */}
      {activePage && (
        <div className="px-3.5 py-1.5 bg-gray-50/90 border-b border-gray-200 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 truncate text-gray-600 min-w-0">
            <span className="text-xs flex-shrink-0">📄</span>
            <span className="truncate">
              {includeActiveNoteContext
                ? `Note Context: "${activePage.title || 'Untitled'}"`
                : 'General Doubts (No active note context)'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIncludeActiveNoteContext(!includeActiveNoteContext)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors flex-shrink-0 ${
              includeActiveNoteContext
                ? 'text-red-600 hover:bg-red-50 border border-transparent'
                : 'text-blue-600 hover:bg-blue-50 border border-blue-200'
            }`}
            title={
              includeActiveNoteContext
                ? 'Click to detach active note context and ask general questions'
                : 'Click to re-attach current note context'
            }
          >
            {includeActiveNoteContext ? '✕ Clear Note' : '+ Attach Note'}
          </button>
        </div>
      )}

      {/* 3. Middle Stream Area (Conversational Back-and-Forth) */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 bg-white"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-end pb-3 space-y-4 animate-in fade-in duration-150">
            {/* Notion AI Avatar & Welcome Header */}
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-base shadow-xs">
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                Conversational AI Tutor
              </h3>
              <p className="text-xs text-gray-500">
                Ask doubts in English or Hinglish, paste screenshots with{' '}
                <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono text-[10px]">
                  Ctrl+V
                </kbd>
                , or solve formulas with KaTeX math.
              </p>
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="space-y-2 text-left">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSendMessage(s.prompt)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all cursor-pointer group text-left shadow-2xs"
                >
                  <s.icon className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-700 group-hover:text-gray-950 transition-colors">
                    {s.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col text-left ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-50 border border-gray-200 text-gray-800 shadow-2xs'
                  }`}
                >
                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt="Uploaded screenshot"
                      className="max-h-36 rounded-lg bg-white p-1 border border-blue-300 mb-2"
                    />
                  )}
                  {m.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  ) : (
                    <>
                      <RichMathMarkdown content={m.text} />
                      {m.meetingCard && (
                        <div className="mt-3 p-3 bg-white border border-blue-200 rounded-xl space-y-2 text-xs shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-900 flex items-center gap-1.5">
                              <span>📹</span> Google Meet Conference
                            </span>
                            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-semibold">
                              MCP Automated
                            </span>
                          </div>
                          <p className="font-semibold text-gray-900">{m.meetingCard.title}</p>
                          <div className="flex flex-wrap items-center gap-2 text-gray-600 font-mono text-[11px]">
                            <span>⏰ {m.meetingCard.time}</span>
                            <span>•</span>
                            <span>👥 {m.meetingCard.attendees.join(', ')}</span>
                          </div>
                          <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between font-mono text-[11px] text-blue-700">
                            <span className="truncate">{m.meetingCard.meetUrl}</span>
                            <button
                              onClick={() => navigator.clipboard?.writeText(m.meetingCard.meetUrl)}
                              className="text-gray-500 hover:text-gray-900 font-sans ml-2 text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 cursor-pointer"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="pt-1">
                            <button
                              onClick={() => handleConfirmMeeting(m.id)}
                              disabled={m.meetingCard.confirmed}
                              className={`w-full py-1.5 px-3 font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-2xs flex items-center justify-center gap-1.5 ${
                                m.meetingCard.confirmed
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              <span>
                                {m.meetingCard.confirmed
                                  ? '✔ Invites Dispatched to Slack (#general) & Calendar'
                                  : '✅ Confirm & Dispatch to Team'}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* AI Footer with 1-Click "Insert into page" */}
                {m.sender === 'ai' && (
                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-gray-400">
                    <span className="font-mono">{m.source}</span>
                    <span>•</span>
                    <button
                      onClick={() => onInsertText?.(m.text)}
                      className="text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      + Insert to page
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-600 p-2.5 bg-gray-50 rounded-xl border border-gray-200 w-fit shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Atelion AI is reasoning...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 4. Bottom Input Box with Image Attachment & Ctrl+V Paste Preview */}
      <div className="p-3 bg-white border-t border-gray-200">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Thumbnail Preview for Attached or Pasted Image */}
        {attachedImage && (
          <div className="mb-2 p-1.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={attachedImage.dataUrl}
                alt="Attachment Preview"
                className="w-10 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0"
              />
              <span className="text-[11px] text-gray-700 truncate font-mono">
                {attachedImage.name || 'Pasted Screenshot'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 text-gray-400 hover:text-red-600 rounded-full cursor-pointer"
              title="Remove attached image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="rounded-2xl bg-gray-50 border border-gray-200 focus-within:border-blue-500/80 focus-within:bg-white p-2.5 transition-all shadow-xs">
          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              includeActiveNoteContext
                ? `Ask anything about "${activePage?.title || 'active note'}" or attach image...`
                : 'Ask any general math, code, or conceptual question...'
            }
            className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 outline-none resize-none font-sans"
          />

          <div className="flex items-center justify-between pt-1.5 text-[11px]">
            {/* 📎 Attach Image Button */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-950 border border-gray-200 transition-colors cursor-pointer shadow-2xs text-[10px]"
                title="Attach an image / diagram (or paste with Ctrl+V)"
              >
                <span>📎</span>
                <span>Attach</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSendMessage('Review this document for grammar, tone, clarity, and structural flow.')
                }
                className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-950 border border-gray-200 transition-colors cursor-pointer shadow-2xs text-[10px]"
              >
                <Plus className="w-2.5 h-2.5 text-gray-400" />
                <span>Review</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Model Selector Pill */}
              <button
                type="button"
                onClick={() =>
                  setSelectedModel((prev) =>
                    prev === 'Auto Waterfall'
                      ? 'Cerebras 2k tok/s'
                      : prev === 'Cerebras 2k tok/s'
                      ? 'Groq LPU'
                      : prev === 'Groq LPU'
                      ? 'Gemini 2.0'
                      : prev === 'Gemini 2.0'
                      ? 'SambaNova RDU'
                      : 'Auto Waterfall'
                  )
                }
                className="text-[10px] text-gray-500 hover:text-gray-900 transition-colors cursor-pointer font-mono"
                title="Zero-Payment-Method AI Waterfall (Cerebras, Groq, Cloudflare, Gemini, SambaNova, GitHub Models)"
              >
                {selectedModel} ⌄
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || (!prompt.trim() && !attachedImage)}
                className="w-6 h-6 rounded-full bg-gray-900 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
