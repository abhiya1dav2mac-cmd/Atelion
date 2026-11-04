export type AspectRatio = '16:9' | '9:16' | '1:1';
export type TrackType = 'captions' | 'video' | 'voiceover' | 'music';
export type AppRoute =
  | 'home'
  | 'recipes'
  | 'mac'
  | 'plugins'
  | 'pricing'
  | 'changelog'
  | 'dashboard'
  | 'editor';

export interface TimelineClip {
  id: string;
  trackId: string;
  trackType: TrackType;
  title: string;
  shotNumber?: number;
  startTime: number;
  duration: number;
  color: string;
  text?: string;
  mediaUrl?: string;
  sceneStyle?: 'forge' | 'welder' | 'cnc' | 'plane' | 'city' | 'moon' | 'custom';
  scale: number;
  positionX: number;
  positionY: number;
  rotation: number;
  opacity: number;
  blur: number;
  speed: number;
  filter: 'none' | 'archival' | 'chrome' | 'warm' | 'noir';
  behindSubject?: boolean;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  duration: number;
  sceneStyle: 'forge' | 'welder' | 'cnc' | 'plane' | 'city' | 'moon' | 'custom';
  url?: string;
}

export interface AgentToolCall {
  id: string;
  label: string;
  status: 'running' | 'done';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachment?: string;
  workedDuration?: string;
  toolCalls?: AgentToolCall[];
  timestamp: string;
}

export interface VideoComment {
  id: string;
  author: string;
  avatarColor: string;
  timecode: number;
  text: string;
  resolved: boolean;
  createdAt: string;
}

export interface ProjectData {
  id: string;
  title: string;
  updatedAt: string;
  aspectRatio: AspectRatio;
  duration: number;
  clips: TimelineClip[];
  assets: MediaAsset[];
  messages: ChatMessage[];
  comments: VideoComment[];
  deleted?: boolean;
}
