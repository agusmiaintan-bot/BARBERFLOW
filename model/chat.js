const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  room_id: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  nama: String,
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Export model dengan pengecekan untuk menghindari overwrite
module.exports = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
