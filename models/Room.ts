import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomId: string;
  meetingId?: mongoose.Types.ObjectId;
  activeParticipants: Array<{
    userId: string;
    socketId: string;
    peerId: string;
    mediaState: {
      video: boolean;
      audio: boolean;
      screenShare: boolean;
    };
    joinedAt: Date;
  }>;
  chatMessages: Array<{
    userId: string;
    username: string;
    message: string;
    timestamp: Date;
    type: 'text' | 'system' | 'file';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  meetingId: {
    type: Schema.Types.ObjectId,
    ref: 'Meeting'
  },
  activeParticipants: [{
    userId: String,
    socketId: String,
    peerId: String,
    mediaState: {
      video: {
        type: Boolean,
        default: true
      },
      audio: {
        type: Boolean,
        default: true
      },
      screenShare: {
        type: Boolean,
        default: false
      }
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  chatMessages: [{
    userId: String,
    username: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['text', 'system', 'file'],
      default: 'text'
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IRoom>('Room', roomSchema); 