import Chat from '../models/Chat.js';
import { streamOpenRouter, createChatTitle } from '../services/openRouterService.js';

export const continueChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const _id = req.params.id;
    if (!_id || !message) return res.status(400).json({ error: 'id and message required' });
    const chat = await Chat.findOne({ _id, userId: res.user.email });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

  
    const messages = [
      ...chat.messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');


    // Handle the stream
    try {
      await streamOpenRouter(
        messages,
        process.env.OPENROUTER_API_KEY,
        res,
        _id
      );
      
    } catch (error) {
      
      if (!res.headersSent) {
        res.status(error.code || 500).json({
          error: 'Failed to process AI response',
          details: error.message || error.error || 'Unknown error'
        });
      } else {
        res.write(`data: ${JSON.stringify({ error: 'Stream processing failed' })}\n\n`);
        res.end();
      }
    }
  } catch (err) {
    console.error('Chat controller error:', err);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        details: err.message
      });
    } else {
      res.end();
    }
  }
};

// GET /api/chat/all
export const getAllChats = async (req, res, next) => {
  try {
    const userId=res.user.email
    const chats = await Chat.find({ userId }).select('_id createdAt title');
    res.json(chats);
  } catch (err) {
    next(err);
  }
};
// GET /api/chat/:id
export const getChat = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'Chat ID required' });

    // Find the chat and ensure it belongs to the user
    const chat = await Chat.findOne({ 
      _id: id, 
      userId: res.user.email 
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (err) {
    console.error('Get chat error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
};

// POST /api/chat/start2
export const startChat = async (request, response, next) => {
  try {
    const { message } = request.body;
    if (!message) return response.status(400).json({ error: 'Message required' });

    // Create initial messages array
    const messages = [{
      role: "system",
      content: "You are a helpful assistant that provides responses formatted in Markdown. Always return your answers using Markdown syntax, including headings, numbers, lists, bold, and italic text."
    }];

    // Get title for the chat
    const title = await createChatTitle(message);

    // Create chat record with title
    const chat = await Chat.create({
      userId: response.user.email,
      messages: messages,
      title: title
    });

    // Return the chat ID and title
    response.json({
      chatId: chat._id,
      title: title
    });

  } catch (err) {
    console.error('Chat controller error:', err);
    response.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
};