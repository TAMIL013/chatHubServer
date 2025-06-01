import Chat from '../models/Chat.js';

export async function saveChat(userId, messages) {
  try {
    const chat = await Chat.create({
      userId,
      messages
    });
    return chat._id;
  } catch (error) {
    console.error('Error saving chat:', error);
    throw error;
  }
}

export async function updateChat(chatId, userId, messages) {
  try {
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    // Update the entire messages array
    chat.messages = messages;
    await chat.save();
    return chat._id;
  } catch (error) {
    console.error('Error updating chat:', error);
    throw error;
  }
} 