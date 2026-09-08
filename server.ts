import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

interface PeerInfo {
  id: string;
  name: string;
  deviceType: 'phone' | 'tablet' | 'desktop' | 'laptop';
  os: 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'unknown';
  browser: string;
  avatarColor: string;
  joinedAt: number;
}

interface RoomPeer {
  ws: WebSocket;
  peer: PeerInfo;
  room: string;
}

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/info', (req, res) => {
  // Extract client IP address for local network grouping
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || 'local';
  
  res.json({
    ip,
    name: 'Universal Drop',
    supportedPlatforms: ['Windows', 'macOS', 'iOS', 'Android', 'Linux']
  });
});

// WebSocket Server attached to same port 3000
const wss = new WebSocketServer({ server, path: '/ws' });

// In-memory room management
const rooms = new Map<string, Map<string, RoomPeer>>();

function getOrCreateRoom(roomId: string): Map<string, RoomPeer> {
  let room = rooms.get(roomId);
  if (!room) {
    room = new Map();
    rooms.set(roomId, room);
  }
  return room;
}

function broadcastPeers(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const peersList: PeerInfo[] = Array.from(room.values()).map(r => r.peer);

  for (const [peerId, client] of room.entries()) {
    if (client.ws.readyState === WebSocket.OPEN) {
      // Send everyone other peers + confirm self
      const payload = JSON.stringify({
        type: 'peers_list',
        peers: peersList.filter(p => p.id !== peerId),
        selfId: peerId
      });
      client.ws.send(payload);
    }
  }
}

wss.on('connection', (ws: WebSocket) => {
  let currentRoom: string | null = null;
  let currentPeerId: string | null = null;

  ws.on('message', (messageRaw: string | Buffer) => {
    try {
      const data = JSON.parse(messageRaw.toString());
      const { type } = data;

      if (type === 'join') {
        const { room: requestedRoom, peer } = data;
        const roomId = (requestedRoom || 'global').toLowerCase().trim();
        currentRoom = roomId;
        currentPeerId = peer.id;

        const room = getOrCreateRoom(roomId);
        room.set(peer.id, {
          ws,
          peer,
          room: roomId
        });

        // Acknowledge join
        ws.send(JSON.stringify({
          type: 'joined',
          room: roomId,
          self: peer
        }));

        // Broadcast updated peers to everyone in the room
        broadcastPeers(roomId);
      } else if (type === 'update_peer') {
        if (currentRoom && currentPeerId) {
          const room = rooms.get(currentRoom);
          const entry = room?.get(currentPeerId);
          if (entry) {
            entry.peer = { ...entry.peer, ...data.peer };
            broadcastPeers(currentRoom);
          }
        }
      } else if (type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      } else if (
        type === 'transfer_offer' ||
        type === 'transfer_accept' ||
        type === 'transfer_reject' ||
        type === 'transfer_chunk' ||
        type === 'transfer_complete' ||
        type === 'transfer_cancel'
      ) {
        // Targeted routing to specific peer
        if (currentRoom && data.targetPeerId) {
          const room = rooms.get(currentRoom);
          const target = room?.get(data.targetPeerId);
          if (target && target.ws.readyState === WebSocket.OPEN) {
            target.ws.send(JSON.stringify({
              ...data,
              fromPeerId: currentPeerId
            }));
          } else {
            // Target not found or disconnected
            ws.send(JSON.stringify({
              type: 'peer_unavailable',
              targetPeerId: data.targetPeerId,
              transferId: data.transferId
            }));
          }
        }
      }
    } catch (err) {
      console.error('Error handling WS message:', err);
    }
  });

  const cleanup = () => {
    if (currentRoom && currentPeerId) {
      const room = rooms.get(currentRoom);
      if (room) {
        room.delete(currentPeerId);
        if (room.size === 0) {
          rooms.delete(currentRoom);
        } else {
          broadcastPeers(currentRoom);
        }
      }
    }
  };

  ws.on('close', cleanup);
  ws.on('error', cleanup);
});

// Setup Vite or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Universal Drop running on http://localhost:${PORT}`);
  });
}

setupServer();
