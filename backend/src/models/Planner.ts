import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyTask {
  time: string;
  activity: string;
}

export interface IDailySchedule {
  day: string;
  tasks: IStudyTask[];
}

export interface IPlanner extends Document {
  userId: mongoose.Types.ObjectId;
  subjects: string[];
  examDate: Date;
  hoursPerDay: number;
  durationDays: number;
  weakTopics: string[];
  schedule: IDailySchedule[];
  priorities: string[];
  revisionPlan: string;
  isCompleted?: boolean;
  createdAt: Date;
}

const StudyTaskSchema = new Schema<IStudyTask>({
  time: { type: String, required: true },
  activity: { type: String, required: true }
});

const DailyScheduleSchema = new Schema<IDailySchedule>({
  day: { type: String, required: true },
  tasks: { type: [StudyTaskSchema], default: [] }
});

const PlannerSchema = new Schema<IPlanner>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subjects: { type: [String], required: true },
  examDate: { type: Date, required: true },
  hoursPerDay: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  weakTopics: { type: [String], default: [] },
  schedule: { type: [DailyScheduleSchema], default: [] },
  priorities: { type: [String], default: [] },
  revisionPlan: { type: String, default: '' },
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

export const Planner = mongoose.model<IPlanner>('Planner', PlannerSchema);
