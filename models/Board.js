const mongoose = require('mongoose');

// Tasks are embedded documents inside a board, matching the shape the
// front-end already works with: { id, title, description, due, status, assignee }
const TaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    due: { type: String, default: '' }, // stored as 'YYYY-MM-DD' string, same as the <input type="date"> value
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    },
    assignee: { type: String, default: '' }
  },
  { _id: false } // client already generates its own 'id', no need for a separate Mongo _id per task
);

const BoardSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    tasks: { type: [TaskSchema], default: [] },
    // Preserves the left-to-right tab order the client sent, since Mongo
    // doesn't otherwise guarantee document ordering on read.
    order: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    // Strip Mongo-specific fields so the JSON sent to the client looks
    // exactly like it did when it was read straight out of data.json
    toJSON: {
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.order;
        ret.tasks = (ret.tasks || []).map((t) => {
          const task = { ...t };
          delete task._id;
          return task;
        });
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Board', BoardSchema);
