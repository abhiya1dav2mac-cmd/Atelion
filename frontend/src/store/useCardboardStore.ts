import { create } from 'zustand';
import {
  AppRoute,
  AspectRatio,
  ProjectData,
  TimelineClip,
  MediaAsset,
  ChatMessage,
} from '../types/editor';
import { INITIAL_PROJECTS } from '../data/initialData';

interface CardboardState {
  route: AppRoute;
  projects: ProjectData[];
  activeProjectId: string;
  selectedClipId: string | null;
  currentTime: number;
  isPlaying: boolean;
  timelineZoom: number;
  history: TimelineClip[][];
  historyIndex: number;
  isAgentWorking: boolean;
  shareModalOpen: boolean;
  exportModalOpen: boolean;
  billingCycle: 'monthly' | 'annual';

  setRoute: (route: AppRoute) => void;
  setBillingCycle: (cycle: 'monthly' | 'annual') => void;
  openProject: (id: string) => void;
  createNewProject: (promptText?: string, recipeTag?: string) => void;
  deleteProject: (id: string) => void;
  restoreProject: (id: string) => void;

  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSelectedClipId: (id: string | null) => void;
  setTimelineZoom: (zoom: number) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  updateClip: (clipId: string, partial: Partial<TimelineClip>) => void;
  splitSelectedClip: () => void;
  duplicateSelectedClip: () => void;
  deleteSelectedClip: () => void;
  addAssetToTimeline: (asset: MediaAsset) => void;
  uploadCustomAsset: (file: File) => void;
  undo: () => void;
  redo: () => void;

  sendAiDirectorPrompt: (prompt: string, attachment?: string) => void;

  setShareModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  addComment: (author: string, text: string, timecode: number) => void;
  toggleResolveComment: (commentId: string) => void;
}

export const useCardboardStore = create<CardboardState>((set, get) => ({
  route: 'home',
  projects: INITIAL_PROJECTS,
  activeProjectId: 'proj-makers',
  selectedClipId: 'vid-3',
  currentTime: 7.2,
  isPlaying: false,
  timelineZoom: 28,
  history: [INITIAL_PROJECTS[0].clips],
  historyIndex: 0,
  isAgentWorking: false,
  shareModalOpen: false,
  exportModalOpen: false,
  billingCycle: 'annual',

  setRoute: (route) => set({ route, isPlaying: false }),
  setBillingCycle: (billingCycle) => set({ billingCycle }),

  openProject: (id) => {
    const project = get().projects.find((p) => p.id === id);
    if (!project) return;
    set({
      activeProjectId: id,
      route: 'editor',
      currentTime: 0,
      isPlaying: false,
      selectedClipId: project.clips[0]?.id || null,
      history: [project.clips],
      historyIndex: 0,
    });
  },

  createNewProject: (promptText, recipeTag) => {
    const newId = `proj-${Date.now()}`;
    const title = recipeTag
      ? `${recipeTag} Project`
      : promptText
      ? promptText.slice(0, 32)
      : 'Untitled Cardboard Cut';

    const baseProject = INITIAL_PROJECTS[0];
    const newProject: ProjectData = {
      id: newId,
      title,
      updatedAt: 'Just now',
      aspectRatio: '16:9',
      duration: 24,
      clips: baseProject.clips.map((c) => ({ ...c, id: `${newId}-${c.id}` })),
      assets: [...baseProject.assets],
      messages: promptText
        ? [
            {
              id: `m-${Date.now()}`,
              role: 'user',
              content: promptText,
              timestamp: 'Just now',
            },
            {
              id: `m-${Date.now() + 1}`,
              role: 'assistant',
              workedDuration: 'Worked for 8s',
              content: `I've assembled your editable first cut for "${title}" with synchronized captions, B-roll shots, and background score. Ask me to refine any part!`,
              toolCalls: [
                { id: 'nt-1', label: `Generated storyboard for "${title}"`, status: 'done' },
                { id: 'nt-2', label: 'Sourced 6 B-roll clips & synced voiceover captions', status: 'done' },
              ],
              timestamp: 'Just now',
            },
          ]
        : [],
      comments: [],
    };

    set((state) => ({
      projects: [newProject, ...state.projects],
      activeProjectId: newId,
      route: 'editor',
      currentTime: 0,
      selectedClipId: newProject.clips[0]?.id || null,
      history: [newProject.clips],
      historyIndex: 0,
    }));
  },

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, deleted: true } : p)),
    })),

  restoreProject: (id) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, deleted: false } : p)),
    })),

  setCurrentTime: (currentTime) => set({ currentTime: Math.max(0, currentTime) }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSelectedClipId: (selectedClipId) => set({ selectedClipId }),
  setTimelineZoom: (timelineZoom) => set({ timelineZoom: Math.max(14, Math.min(80, timelineZoom)) }),

  setAspectRatio: (aspectRatio) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === state.activeProjectId ? { ...p, aspectRatio } : p
      ),
    })),

  updateClip: (clipId, partial) => {
    const state = get();
    const activeProject = state.projects.find((p) => p.id === state.activeProjectId);
    if (!activeProject) return;

    const updatedClips = activeProject.clips.map((c) =>
      c.id === clipId ? { ...c, ...partial } : c
    );
    const maxEnd = updatedClips.reduce(
      (max, c) => Math.max(max, c.startTime + c.duration),
      12
    );

    const nextHistory = state.history.slice(0, state.historyIndex + 1);
    nextHistory.push(updatedClips);

    set({
      projects: state.projects.map((p) =>
        p.id === state.activeProjectId
          ? { ...p, clips: updatedClips, duration: Math.ceil(maxEnd) }
          : p
      ),
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });
  },

  splitSelectedClip: () => {
    const state = get();
    const activeProject = state.projects.find((p) => p.id === state.activeProjectId);
    if (!activeProject || !state.selectedClipId) return;

    const clip = activeProject.clips.find((c) => c.id === state.selectedClipId);
    if (!clip) return;

    const splitOffset =
      state.currentTime > clip.startTime + 0.4 &&
      state.currentTime < clip.startTime + clip.duration - 0.4
        ? state.currentTime - clip.startTime
        : clip.duration / 2;

    const firstHalf: TimelineClip = {
      ...clip,
      duration: Number(splitOffset.toFixed(2)),
    };
    const secondHalf: TimelineClip = {
      ...clip,
      id: `${clip.id}-split-${Date.now()}`,
      startTime: Number((clip.startTime + splitOffset).toFixed(2)),
      duration: Number((clip.duration - splitOffset).toFixed(2)),
      title: `${clip.title} (B)`,
    };

    const updatedClips = activeProject.clips.flatMap((c) =>
      c.id === clip.id ? [firstHalf, secondHalf] : [c]
    );

    const nextHistory = state.history.slice(0, state.historyIndex + 1);
    nextHistory.push(updatedClips);

    set({
      projects: state.projects.map((p) =>
        p.id === state.activeProjectId ? { ...p, clips: updatedClips } : p
      ),
      selectedClipId: secondHalf.id,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });
  },

  duplicateSelectedClip: () => {
    const state = get();
    const activeProject = state.projects.find((p) => p.id === state.activeProjectId);
    if (!activeProject || !state.selectedClipId) return;

    const clip = activeProject.clips.find((c) => c.id === state.selectedClipId);
    if (!clip) return;

    const copy: TimelineClip = {
      ...clip,
      id: `dup-${Date.now()}`,
      startTime: clip.startTime + clip.duration,
      title: `${clip.title} (Copy)`,
    };

    const updatedClips = [...activeProject.clips, copy];
    const maxEnd = updatedClips.reduce((m, c) => Math.max(m, c.startTime + c.duration), 12);

    const nextHistory = state.history.slice(0, state.historyIndex + 1);
    nextHistory.push(updatedClips);

    set({
      projects: state.projects.map((p) =>
        p.id === state.activeProjectId
          ? { ...p, clips: updatedClips, duration: Math.ceil(maxEnd) }
          : p
      ),
      selectedClipId: copy.id,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });
  },

  deleteSelectedClip: () => {
    const state = get();
    const activeProject = state.projects.find((p) => p.id === state.activeProjectId);
    if (!activeProject || !state.selectedClipId) return;

    const updatedClips = activeProject.clips.filter((c) => c.id !== state.selectedClipId);
    const nextHistory = state.history.slice(0, state.historyIndex + 1);
    nextHistory.push(updatedClips);

    set({
      projects: state.projects.map((p) =>
        p.id === state.activeProjectId ? { ...p, clips: updatedClips } : p
      ),
      selectedClipId: updatedClips[0]?.id || null,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });
  },

  addAssetToTimeline: (asset) => {
    const state = get();
    const activeProject = state.projects.find((p) => p.id === state.activeProjectId);
    if (!activeProject) return;

    const isAudio = asset.type === 'audio';
    const trackId = isAudio ? 'track-voiceover' : 'track-video';
    const trackClips = activeProject.clips.filter((c) => c.trackId === trackId);
    const endOfTrack = trackClips.reduce((m, c) => Math.max(m, c.startTime + c.duration), 0);

    const newClip: TimelineClip = {
      id: `clip-${Date.now()}`,
      trackId,
      trackType: isAudio ? 'voiceover' : 'video',
      title: asset.name,
      startTime: endOfTrack,
      duration: asset.duration,
      color: isAudio ? '#10B981' : '#3B82F6',
      sceneStyle: asset.sceneStyle,
      mediaUrl: asset.url,
      scale: 1,
      positionX: 0,
      positionY: 0,
      rotation: 0,
      opacity: 1,
      blur: 0,
      speed: 1,
      filter: 'none',
    };

    const updatedClips = [...activeProject.clips, newClip];
    const maxEnd = updatedClips.reduce((m, c) => Math.max(m, c.startTime + c.duration), 12);

    set({
      projects: state.projects.map((p) =>
        p.id === state.activeProjectId
          ? { ...p, clips: updatedClips, duration: Math.ceil(maxEnd) }
          : p
      ),
      selectedClipId: newClip.id,
    });
  },

  uploadCustomAsset: (file) => {
    const url = URL.createObjectURL(file);
    const isAudio = file.type.startsWith('audio');
    const newAsset: MediaAsset = {
      id: `upload-${Date.now()}`,
      name: file.name,
      type: isAudio ? 'audio' : 'video',
      duration: 5,
      sceneStyle: 'custom',
      url,
    };

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === state.activeProjectId ? { ...p, assets: [newAsset, ...p.assets] } : p
      ),
    }));
  },

  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;
    const nextIndex = state.historyIndex - 1;
    const restoredClips = state.history[nextIndex];
    set({
      historyIndex: nextIndex,
      projects: state.projects.map((p) =>
        p.id === state.activeProjectId ? { ...p, clips: restoredClips } : p
      ),
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    const nextIndex = state.historyIndex + 1;
    const restoredClips = state.history[nextIndex];
    set({
      historyIndex: nextIndex,
      projects: state.projects.map((p) =>
        p.id === state.activeProjectId ? { ...p, clips: restoredClips } : p
      ),
    });
  },

  sendAiDirectorPrompt: (prompt, attachment) => {
    const state = get();
    const activeProject = state.projects.find((p) => p.id === state.activeProjectId);
    if (!activeProject || !prompt.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: prompt,
      attachment,
      timestamp: 'Just now',
    };

    set({
      isAgentWorking: true,
      projects: state.projects.map((p) =>
        p.id === state.activeProjectId
          ? { ...p, messages: [...p.messages, userMsg] }
          : p
      ),
    });

    setTimeout(() => {
      const currentState = get();
      const proj = currentState.projects.find((p) => p.id === currentState.activeProjectId);
      if (!proj) return;

      const lower = prompt.toLowerCase();
      let updatedClips = [...proj.clips];
      let updatedRatio: AspectRatio = proj.aspectRatio;
      const toolCalls: { id: string; label: string; status: 'done' }[] = [];
      let replyText = '';

      if (lower.includes('shorter') || lower.includes('dead air') || lower.includes('faster') || lower.includes('trim')) {
        updatedClips = updatedClips.map((c) => ({
          ...c,
          startTime: Number((c.startTime * 0.75).toFixed(2)),
          duration: Math.max(1.5, Number((c.duration * 0.75).toFixed(2))),
        }));
        toolCalls.push(
          { id: `tc-${Date.now()}-1`, label: 'Analyzed transcript for dead air & pauses (−6s found)', status: 'done' },
          { id: `tc-${Date.now()}-2`, label: 'Trimmed all timeline clips by 25% & rippled sequence', status: 'done' }
        );
        replyText = 'Done. I removed the dead air and tightened every shot across the timeline by 25%.';
      } else if (lower.includes('vertical') || lower.includes('9:16') || lower.includes('reels') || lower.includes('tiktok')) {
        updatedRatio = '9:16';
        toolCalls.push(
          { id: `tc-${Date.now()}-1`, label: 'Reframed canvas aspect ratio to 9:16 Vertical', status: 'done' },
          { id: `tc-${Date.now()}-2`, label: 'Centered active subject tracking & repositioned captions', status: 'done' }
        );
        replyText = 'Reframed the project to 9:16 for Reels and repositioned all captions inside the vertical safe zone.';
      } else if (lower.includes('square') || lower.includes('1:1')) {
        updatedRatio = '1:1';
        toolCalls.push({ id: `tc-${Date.now()}-1`, label: 'Reframed project canvas to 1:1 Square', status: 'done' });
        replyText = 'Switched canvas aspect ratio to 1:1 square.';
      } else if (lower.includes('caption') || lower.includes('subtitle') || lower.includes('behind')) {
        const useBehind = lower.includes('behind');
        const newCapId = `cap-ai-${Date.now()}`;
        updatedClips = updatedClips.map((c) =>
          c.trackType === 'captions' ? { ...c, behindSubject: useBehind ? true : c.behindSubject } : c
        );
        updatedClips.push({
          id: newCapId,
          trackId: 'track-captions',
          trackType: 'captions',
          title: 'Built with Cardboard AI Director — Instant Captions',
          text: 'Built with Cardboard AI Director — Instant Captions',
          startTime: Math.min(currentState.currentTime, 18),
          duration: 4,
          color: '#A855F7',
          scale: 1,
          positionX: 0,
          positionY: 0,
          rotation: 0,
          opacity: 1,
          blur: 0,
          speed: 1,
          filter: 'none',
          behindSubject: useBehind,
        });
        toolCalls.push(
          { id: `tc-${Date.now()}-1`, label: 'Synced word-level caption track to voiceover', status: 'done' },
          {
            id: `tc-${Date.now()}-2`,
            label: useBehind ? 'Enabled depth mask for Behind-Subject Captions' : 'Applied dynamic highlight caption style',
            status: 'done',
          }
        );
        replyText = useBehind
          ? 'Updated captions to render behind the foreground subject using depth matting.'
          : 'Added synchronized captions to the Captions track at the current playhead.';
      } else if (lower.includes('b-roll') || lower.includes('broll') || lower.includes('footage')) {
        const newBroll: TimelineClip = {
          id: `broll-${Date.now()}`,
          trackId: 'track-video',
          trackType: 'video',
          shotNumber: 74,
          title: '74 | archival welder B-roll',
          startTime: Math.floor(currentState.currentTime),
          duration: 4,
          color: '#3B82F6',
          sceneStyle: 'welder',
          scale: 1.08,
          positionX: 0,
          positionY: 0,
          rotation: 0,
          opacity: 1,
          blur: 0,
          speed: 1,
          filter: 'archival',
        };
        updatedClips.push(newBroll);
        toolCalls.push(
          { id: `tc-${Date.now()}-1`, label: 'Searched web & watched 132 clips for best visual match', status: 'done' },
          { id: `tc-${Date.now()}-2`, label: 'Inserted “Welder at work in a steel shop (0:04)” onto timeline', status: 'done' }
        );
        replyText = 'Found matching archival B-roll ("Welder at work in a steel shop") and placed it at your playhead.';
      } else if (lower.includes('music') || lower.includes('soundtrack') || lower.includes('audio')) {
        updatedClips.push({
          id: `music-${Date.now()}`,
          trackId: 'track-score',
          trackType: 'music',
          title: 'AI Generated Score — Analog Warmth Synth',
          startTime: 0,
          duration: 24,
          color: '#F59E0B',
          scale: 1,
          positionX: 0,
          positionY: 0,
          rotation: 0,
          opacity: 1,
          blur: 0,
          speed: 1,
          filter: 'none',
        });
        toolCalls.push(
          { id: `tc-${Date.now()}-1`, label: 'Generated 24s custom stem: “Analog Warmth Synth”', status: 'done' },
          { id: `tc-${Date.now()}-2`, label: 'Ducked score −9dB under voiceover dialogue', status: 'done' }
        );
        replyText = 'Generated a background music bed and automatically ducked its volume under the voiceover.';
      } else if (lower.includes('effect') || lower.includes('color') || lower.includes('chrome') || lower.includes('archival') || lower.includes('noir')) {
        const chosenFilter = lower.includes('chrome')
          ? 'chrome'
          : lower.includes('noir')
          ? 'noir'
          : lower.includes('warm')
          ? 'warm'
          : 'archival';
        updatedClips = updatedClips.map((c) =>
          c.trackType === 'video' ? { ...c, filter: chosenFilter } : c
        );
        toolCalls.push({
          id: `tc-${Date.now()}-1`,
          label: `Applied "${chosenFilter.toUpperCase()}" color grade across all ${
            updatedClips.filter((c) => c.trackType === 'video').length
          } video clips`,
          status: 'done',
        });
        replyText = `Applied the ${chosenFilter} look across all video clips on the timeline.`;
      } else {
        updatedClips = updatedClips.map((c) =>
          c.id === currentState.selectedClipId ? { ...c, scale: 1.12, filter: 'warm' } : c
        );
        toolCalls.push(
          { id: `tc-${Date.now()}-1`, label: `Executed timeline edit for: "${prompt.slice(0, 36)}"`, status: 'done' },
          { id: `tc-${Date.now()}-2`, label: 'Updated active sequence & rendered live preview', status: 'done' }
        );
        replyText = `Done! I've updated the timeline according to your instruction: "${prompt}".`;
      }

      const maxEnd = updatedClips.reduce((m, c) => Math.max(m, c.startTime + c.duration), 12);

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        workedDuration: 'Worked for 4s',
        content: replyText,
        toolCalls,
        timestamp: 'Just now',
      };

      const nextHistory = currentState.history.slice(0, currentState.historyIndex + 1);
      nextHistory.push(updatedClips);

      set({
        isAgentWorking: false,
        history: nextHistory,
        historyIndex: nextHistory.length - 1,
        projects: currentState.projects.map((p) =>
          p.id === currentState.activeProjectId
            ? {
                ...p,
                aspectRatio: updatedRatio,
                clips: updatedClips,
                duration: Math.ceil(maxEnd),
                messages: [...p.messages, assistantMsg],
              }
            : p
        ),
      });
    }, 900);
  },

  setShareModalOpen: (shareModalOpen) => set({ shareModalOpen }),
  setExportModalOpen: (exportModalOpen) => set({ exportModalOpen }),

  addComment: (author, text, timecode) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === state.activeProjectId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `com-${Date.now()}`,
                  author: author || 'Ishan',
                  avatarColor: '#F59E0B',
                  timecode,
                  text,
                  resolved: false,
                  createdAt: 'Just now',
                },
              ],
            }
          : p
      ),
    })),

  toggleResolveComment: (commentId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === state.activeProjectId
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c.id === commentId ? { ...c, resolved: !c.resolved } : c
              ),
            }
          : p
      ),
    })),
}));
