import Peer, { DataConnection } from 'peerjs';

export type SyncState = {
  scratchpad: string;
  calculatorHistory: any[];
  currentExpression: string;
};

type SyncCallback = (state: Partial<SyncState>) => void;

class LocalSyncService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private callbacks: Set<SyncCallback> = new Set();
  public myId: string | null = null;
  private isHost: boolean = false;
  private roomId: string | null = null;

  public initialize(roomId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.peer = new Peer();

      this.peer.on('open', (id) => {
        this.myId = id;
        
        if (roomId) {
          // Join existing room
          this.isHost = false;
          this.roomId = roomId;
          this.connectToPeer(roomId);
        } else {
          // Host a new room (the roomId is our peer ID)
          this.isHost = true;
          this.roomId = id;
        }

        resolve(this.roomId);
      });

      this.peer.on('connection', (conn) => {
        if (!this.isHost) {
          // If we are a client, we shouldn't be receiving connections usually,
          // but we might if we implement a mesh network. For simplicity, hub-spoke.
          return;
        }
        
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        reject(err);
      });
    });
  }

  private connectToPeer(targetId: string) {
    if (!this.peer) return;
    const conn = this.peer.connect(targetId);
    this.setupConnection(conn);
  }

  private setupConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
    });

    conn.on('data', (data: any) => {
      if (data && data.type === 'SYNC') {
        this.callbacks.forEach(cb => cb(data.payload));
        
        // If I am the host, broadcast to other connected peers
        if (this.isHost) {
          this.broadcast(data.payload, conn.peer);
        }
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });
    
    conn.on('error', () => {
       this.connections.delete(conn.peer);
    });
  }

  public subscribe(callback: SyncCallback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  public broadcast(stateUpdate: Partial<SyncState>, excludePeerId?: string) {
    const message = { type: 'SYNC', payload: stateUpdate };
    this.connections.forEach((conn, peerId) => {
      if (peerId !== excludePeerId) {
         conn.send(message);
      }
    });
  }

  public disconnect() {
    this.connections.forEach(conn => conn.close());
    this.connections.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }

  public getRoomId(): string | null {
    return this.roomId;
  }
}

export const localSyncService = new LocalSyncService();
