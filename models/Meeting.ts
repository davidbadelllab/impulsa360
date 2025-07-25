import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  description?: string;
  hostId: mongoose.Types.ObjectId;
  roomId: string;
  scheduledTime?: Date;
  duration?: number;
  participants: Array<{
    userId: mongoose.Types.ObjectId;
    joinedAt?: Date;
    leftAt?: Date;
    role: 'host' | 'moderator' | 'participant';
  }>;
  settings: {
    maxParticipants: number;
    requireApproval: boolean;
    enableRecording: boolean;
    enableChat: boolean;
  };
  status: 'scheduled' | 'active' | 'ended';
  recording: {
    isRecording: boolean;
    recordingPath?: string;
    recordingStartTime?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new Schema<IMeeting>({
  title: {
    type: String,
    required: true
  },
  description: String,
  hostId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  scheduledTime: Date,
  duration: {
    type: Number,
    default: 60
  },
  participants: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date,
    role: {
      type: String,
      enum: ['host', 'moderator', 'participant'],
      default: 'participant'
    }
  }],
  settings: {
    maxParticipants: {
      type: Number,
      default: 50
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    enableRecording: {
      type: Boolean,
      default: false
    },
    enableChat: {
      type: Boolean,
      default: true
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'ended'],
    default: 'scheduled'
  },
  recording: {
    isRecording: {
      type: Boolean,
      default: false
    },
    recordingPath: String,
    recordingStartTime: Date
  }
}, {
  timestamps: true
});

export default mongoose.model<IMeeting>('Meeting', meetingSchema); 