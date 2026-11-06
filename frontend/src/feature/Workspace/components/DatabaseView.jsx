import React, { useState } from 'react';
import { Plus, Sparkles, Layout, Database } from './WorkspaceIcons';

export default function DatabaseView({ items, onUpdateItems }) {
  const [currentView, setCurrentView] = useState('table'); // 'table' | 'board' | 'gallery'
  const [newTitle, setNewTitle] = useState('');

  // 1-Click Sprint Automation: Moves Pending tasks to In Progress / Done
  const runSprintAutomation = () => {
    const updated = items.map((item) => {
      if (item.status === 'To Do') {
        return { ...item, status: 'In Progress', progress: 50 };
      }
      if (item.status === 'In Progress' && item.progress >= 75) {
        return { ...item, status: 'Done', progress: 100 };
      }
      return item;
    });
    onUpdateItems(updated);
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newItem = {
      id: 't_' + Date.now(),
      title: newTitle.trim(),
      status: 'To Do',
      priority: 'P2 Normal',
      progress: 0,
      assignee: 'Me',
      due: 'Next sprint',
    };
    onUpdateItems([newItem, ...items]);
    setNewTitle('');
  };

  const renderFormulaProgressBar = (progress) => {
    const totalBlocks = 5;
    const filled = Math.min(totalBlocks, Math.max(0, Math.round((progress / 100) * totalBlocks)));
    const empty = totalBlocks - filled;
    const bar = '■'.repeat(filled) + '□'.repeat(empty);
    const color = progress === 100 ? 'text-emerald-600 font-bold' : progress > 50 ? 'text-blue-600' : 'text-amber-600';
    return (
      <span className={`font-mono text-xs tracking-widest ${color}`}>
        {bar} <span className="text-[11px] font-sans font-medium text-gray-500">({progress}%)</span>
      </span>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Done':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority.includes('Urgent')) return 'bg-rose-100 text-rose-700';
    if (priority.includes('High')) return 'bg-amber-100 text-amber-800';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden my-4 select-none">
      {/* View Switcher Top Bar */}
      <div className="p-3 bg-gray-50/80 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'table' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>

          <button
            onClick={() => setCurrentView('board')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'board' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => setCurrentView('gallery')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'gallery' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🎴 Gallery</span>
          </button>
        </div>

        {/* 1-Click Automation Button */}
        <button
          onClick={runSprintAutomation}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>⚡ Run Sprint Automation</span>
        </button>
      </div>

      {/* 1. TABLE VIEW */}
      {currentView === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4 w-2/5">Task Name</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Formulas 2.0 Progress</th>
                <th className="py-2.5 px-3">Assignee</th>
                <th className="py-2.5 px-3">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-gray-900 flex items-center gap-2">
                    <span className="text-gray-400">📄</span>
                    <span>{item.title}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${getPriorityBadge(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">{renderFormulaProgressBar(item.progress)}</td>
                  <td className="py-2.5 px-3 text-gray-600">{item.assignee}</td>
                  <td className="py-2.5 px-3 text-gray-400 font-mono text-[11px]">{item.due}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Quick Add Row */}
          <form onSubmit={addItem} className="p-2.5 border-t border-gray-100 bg-gray-50/30 flex items-center gap-2">
            <Plus className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a new task row... (Press Enter)"
              className="bg-transparent border-none text-xs text-gray-800 focus:outline-none w-full"
            />
          </form>
        </div>
      )}

      {/* 2. KANBAN BOARD VIEW */}
      {currentView === 'board' && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/40">
          {['To Do', 'In Progress', 'Done'].map((col) => {
            const colItems = items.filter((i) => i.status === col);
            return (
              <div key={col} className="bg-gray-100/70 p-3 rounded-xl border border-gray-200/80 flex flex-col gap-2.5">
                <div className="flex items-center justify-between font-bold text-xs text-gray-700 px-1">
                  <span>{col}</span>
                  <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
                    {colItems.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-all space-y-2"
                    >
                      <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getPriorityBadge(item.priority)}`}>
                          {item.priority}
                        </span>
                        <span className="text-gray-400">{item.assignee}</span>
                      </div>
                      <div className="pt-1">{renderFormulaProgressBar(item.progress)}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. GALLERY VIEW */}
      {currentView === 'gallery' && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50/40">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col"
            >
              <div className="h-20 bg-gradient-to-tr from-slate-900 to-indigo-900 p-3 flex items-end">
                <span className="text-xl">⚡</span>
              </div>
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{item.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-mono">Due: {item.due}</p>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                  <div>{renderFormulaProgressBar(item.progress)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
