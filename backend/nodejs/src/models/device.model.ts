import mongoose, { Document, Schema } from 'mongoose';

export interface IDevice extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  macAddress: string;
  ipAddress: string;
  vendor?: string;
  lastSeen?: Date;
  isOnline?: boolean;
  netmask?: string;
  link?: string;
  powerSettings: {
    wolEnabled: boolean;
    wolPort: number;
    requireConfirmation: boolean;
    pingCommand?: string;
    wakeCommand?: string;
    wakeCron?: string;
    wakeCronEnabled: boolean;
  };
  monitoring: {
    enabled: boolean;
    interval: number; // in minutes
    alertOnOffline: boolean;
    lastStatus?: string;
    lastStatusChange?: Date;
    uptime?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema = new Schema<IDevice>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  macAddress: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    match: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
  },
  ipAddress: {
    type: String,
    required: true,
    trim: true
  },
  netmask: {
    type: String,
    trim: true,
    default: '255.255.255.0'
  },
  link: {
    type: String,
    trim: true
  },
  vendor: {
    type: String,
    trim: true
  },
  lastSeen: {
    type: Date
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  powerSettings: {
    wolEnabled: {
      type: Boolean,
      default: true
    },
    wolPort: {
      type: Number,
      default: 9
    },
    requireConfirmation: {
      type: Boolean,
      default: true
    },
    pingCommand: String,
    wakeCommand: String,
    wakeCron: String,
    wakeCronEnabled: {
      type: Boolean,
      default: false
    }
  },
  monitoring: {
    enabled: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 5, // 5 minutes default
      min: 1,
      max: 60
    },
    alertOnOffline: {
      type: Boolean,
      default: true
    },
    lastStatus: String,
    lastStatusChange: Date,
    uptime: Number
  }
}, {
  timestamps: true
});

// Indexes for faster queries
DeviceSchema.index({ userId: 1, macAddress: 1 }, { unique: true });
DeviceSchema.index({ userId: 1, isOnline: 1 });
DeviceSchema.index({ userId: 1, 'monitoring.enabled': 1 });

export const Device = mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema);