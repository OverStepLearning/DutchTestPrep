import mongoose, { Document, Schema } from 'mongoose';

export interface IInvitationCode extends Document {
  code: string;
  isUsed: boolean;
  createdAt: Date;
  usedAt?: Date;
  usedBy?: mongoose.Types.ObjectId;
}

const InvitationCodeSchema: Schema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  usedAt: {
    type: Date
  },
  usedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Index for faster queries
InvitationCodeSchema.index({ code: 1 });
InvitationCodeSchema.index({ isUsed: 1 });

export default mongoose.model<IInvitationCode>('InvitationCode', InvitationCodeSchema); 