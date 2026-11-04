import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory mock database
let projects = [
  {
    id: 'proj-makers',
    title: 'Makers documentary',
    updatedAt: '1 day ago',
    aspectRatio: '16:9',
    duration: 24,
    clips: [
      {
        id: 'cap-1',
        trackId: 'track-captions',
        trackType: 'captions',
        title: 'Makers and shapers and put-it-togetherers.',
        text: 'Makers and shapers and put-it-togetherers.',
        startTime: 0,
        duration: 4,
        color: '#A855F7',
      },
      {
        id: 'vid-1',
        trackId: 'track-video',
        trackType: 'video',
        shotNumber: 14,
        title: '14 | original',
        startTime: 0,
        duration: 3,
        color: '#3B82F6',
        sceneStyle: 'forge',
        filter: 'archival',
      },
    ],
    assets: [
      { id: 'asset-1', name: 'furnace-wide.mp4', type: 'video', duration: 4, sceneStyle: 'forge' },
    ],
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        attachment: 'makers-reference.mp4',
        content: 'Make a short documentary on American makers, from forges and furnaces to the moon landing.',
        timestamp: '9:28 AM',
      },
    ],
    comments: [
      {
        id: 'c-1',
        author: 'Maya',
        avatarColor: '#10B981',
        timecode: 3.5,
        text: 'Love the archival grain on the molten steel pour here!',
        resolved: false,
        createdAt: '14m ago',
      },
    ],
  },
  {
    id: 'proj-runner',
    title: 'Piece Runner launch',
    updatedAt: '2 hours ago',
    aspectRatio: '16:9',
    duration: 16,
    clips: [],
    assets: [],
    messages: [],
    comments: [],
  },
];

let exportJobs = {};

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Cardboard AI Backend API',
    engine: 'GPT-6 Astra Directing Core',
    timestamp: new Date().toISOString(),
  });
});

// Projects API
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

app.post('/api/projects', (req, res) => {
  const { title, prompt, aspectRatio = '16:9' } = req.body;
  const newProject = {
    id: `proj-${Date.now()}`,
    title: title || 'Untitled Cardboard Cut',
    updatedAt: 'Just now',
    aspectRatio,
    duration: 24,
    clips: [],
    assets: [],
    messages: prompt
      ? [
          {
            id: `m-${Date.now()}`,
            role: 'user',
            content: prompt,
            timestamp: 'Just now',
          },
        ]
      : [],
    comments: [],
  };
  projects.unshift(newProject);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', (req, res) => {
  const index = projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  projects[index] = { ...projects[index], ...req.body, updatedAt: 'Just now' };
  res.json(projects[index]);
});

app.delete('/api/projects/:id', (req, res) => {
  projects = projects.filter((p) => p.id !== req.params.id);
  res.json({ message: 'Project deleted successfully' });
});

// AI Director Chat & Instruction Execution Engine
app.post('/api/director/chat', (req, res) => {
  const { projectId, prompt } = req.body;
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const lower = (prompt || '').toLowerCase();
  const toolCalls = [];
  let actionTaken = 'Custom timeline instruction applied.';

  if (lower.includes('shorter') || lower.includes('faster') || lower.includes('dead air')) {
    toolCalls.push(
      { id: `tc-${Date.now()}-1`, label: 'Analyzed transcript for dead air & pauses (−6s found)', status: 'done' },
      { id: `tc-${Date.now()}-2`, label: 'Trimmed sequence by 25% with ripple edit', status: 'done' }
    );
    actionTaken = 'Trimmed dead air and tightened the sequence.';
  } else if (lower.includes('vertical') || lower.includes('9:16') || lower.includes('reels')) {
    project.aspectRatio = '9:16';
    toolCalls.push(
      { id: `tc-${Date.now()}-1`, label: 'Reframed canvas to 9:16 Vertical Safe Zone', status: 'done' },
      { id: `tc-${Date.now()}-2`, label: 'Centered subject tracking & adjusted subtitle placement', status: 'done' }
    );
    actionTaken = 'Project canvas reframed to 9:16 vertical for Reels.';
  } else if (lower.includes('caption') || lower.includes('subtitle')) {
    toolCalls.push(
      { id: `tc-${Date.now()}-1`, label: 'Generated word-level captions from voice track', status: 'done' },
      { id: `tc-${Date.now()}-2`, label: 'Applied dynamic styling with active speech highlighting', status: 'done' }
    );
    actionTaken = 'Captions generated and synchronized to the voiceover.';
  } else if (lower.includes('b-roll') || lower.includes('footage')) {
    toolCalls.push(
      { id: `tc-${Date.now()}-1`, label: 'Watched 132 web clips for matching scene', status: 'done' },
      { id: `tc-${Date.now()}-2`, label: 'Selected and inserted “Welder at work in a steel shop”', status: 'done' }
    );
    actionTaken = 'Sourced matching archival B-roll and inserted on video track.';
  } else {
    toolCalls.push(
      { id: `tc-${Date.now()}-1`, label: `Parsed prompt: "${prompt}"`, status: 'done' },
      { id: `tc-${Date.now()}-2`, label: 'Rendered timeline adjustment preview', status: 'done' }
    );
    actionTaken = `Applied edit: "${prompt}"`;
  }

  const responseMessage = {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    workedDuration: 'Worked for 3s',
    content: actionTaken,
    toolCalls,
    timestamp: 'Just now',
  };

  project.messages.push({
    id: `u-${Date.now()}`,
    role: 'user',
    content: prompt,
    timestamp: 'Just now',
  });
  project.messages.push(responseMessage);

  res.json({
    message: responseMessage,
    project,
  });
});

// Video Export API
app.post('/api/export', (req, res) => {
  const { projectId, format = 'mp4', resolution = '4k', fps = 60 } = req.body;
  const jobId = `job-${Date.now()}`;

  exportJobs[jobId] = {
    jobId,
    projectId,
    format,
    resolution,
    fps,
    status: 'rendering',
    progress: 10,
    createdAt: new Date().toISOString(),
  };

  // Simulate background render progress
  setTimeout(() => {
    if (exportJobs[jobId]) exportJobs[jobId].progress = 55;
  }, 1000);

  setTimeout(() => {
    if (exportJobs[jobId]) {
      exportJobs[jobId].progress = 100;
      exportJobs[jobId].status = 'completed';
      exportJobs[jobId].downloadUrl = `/api/export/${jobId}/download`;
    }
  }, 2500);

  res.status(202).json(exportJobs[jobId]);
});

app.get('/api/export/:jobId', (req, res) => {
  const job = exportJobs[req.params.jobId];
  if (!job) return res.status(404).json({ error: 'Render job not found' });
  res.json(job);
});

// Comments API
app.post('/api/comments', (req, res) => {
  const { projectId, author, text, timecode } = req.body;
  const project = projects.find((p) => p.id === projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const comment = {
    id: `com-${Date.now()}`,
    author: author || 'Ishan',
    avatarColor: '#F59E0B',
    timecode: timecode || 0,
    text,
    resolved: false,
    createdAt: 'Just now',
  };

  project.comments.push(comment);
  res.status(201).json(comment);
});

// File upload handler
const upload = multer({ dest: 'uploads/' });
app.post('/api/upload', upload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({
    id: `asset-${Date.now()}`,
    name: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    type: req.file.mimetype,
    url: `/uploads/${req.file.filename}`,
  });
});

app.listen(PORT, () => {
  console.log(`Cardboard AI Backend listening on port ${PORT}`);
});
