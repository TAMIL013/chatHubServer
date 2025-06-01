import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  title: {
    type: String,
    required: true,
    default: 'New Chat'
  },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
}, { 
  collection: 'chats',
  dbName: 'chat_hub_db_dev'  // Explicitly specify the database name
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
