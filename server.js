import express from 'express';
import cors from 'cors';
import Meting from './lib/meting.esm.js';

const app = express();
const PORT = process.env.PORT || 8888;

// Middleware
app.use(cors());
app.use(express.json());

// Main API endpoint wrapping Meting functionalities
app.get('/api', async (req, res) => {
  try {
    const { server, type, id, ...options } = req.query;

    if (!server || !type || !id) {
      return res.status(400).json({ error: 'Missing required parameters: server, type, id' });
    }

    const validServers = ['netease', 'tencent', 'kugou', 'baidu', 'kuwo'];
    if (!validServers.includes(server)) {
      return res.status(400).json({ error: 'Invalid server specified' });
    }

    const meting = new Meting(server);
    meting.format(true);

    let result;

    switch (type) {
      case 'search':
        result = await meting.search(id, options);
        break;
      case 'song':
        result = await meting.song(id);
        break;
      case 'album':
        result = await meting.album(id);
        break;
      case 'artist':
        result = await meting.artist(id, options.limit);
        break;
      case 'playlist':
        result = await meting.playlist(id);
        break;
      case 'url':
        result = await meting.url(id, options.br || 320);
        break;
      case 'lyric':
        result = await meting.lyric(id);
        break;
      case 'pic':
        result = await meting.pic(id, options.size || 300);
        break;
      default:
        return res.status(400).json({ error: 'Invalid type specified' });
    }

    try {
      res.json(JSON.parse(result));
    } catch {
      res.send(result);
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => {
  res.send('Meting API wrapper (ChenziGit version) is running. Use /api endpoint.');
});

app.listen(PORT, () => {
  console.log(`Meting server is running on http://localhost:${PORT}`);
});
