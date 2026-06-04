import db from '../config/db.js';

// @desc    Get chat message history with a specific user
// @route   GET /api/messages/:userId
export const getMessages = async (req, res, next) => {
  const otherUserId = parseInt(req.params.userId, 10);
  const myId = req.user.id;

  try {
    const result = await db.query(
      'SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at ASC',
      [myId, otherUserId]
    );

    // Mark messages as read
    await db.query(
      'UPDATE messages SET is_read = true WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false',
      [otherUserId, myId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message
// @route   POST /api/messages
export const sendMessage = async (req, res, next) => {
  const { receiverId, messageText } = req.body;
  const myId = req.user.id;

  try {
    if (!receiverId || !messageText) {
      return res.status(400).json({ message: 'Please provide receiver ID and message text' });
    }

    const result = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, message_text) VALUES ($1, $2, $3) RETURNING *',
      [myId, parseInt(receiverId, 10), messageText]
    );

    const message = result.rows[0];

    // Notification for recipient (simulated real-time badge updates)
    await db.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [
        parseInt(receiverId, 10),
        'New Message Received',
        `You received a message from ${req.user.name}: "${messageText.substring(0, 30)}${messageText.length > 30 ? '...' : ''}"`
      ]
    );

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

// @desc    Get list of chat contacts
// @route   GET /api/messages/contacts/list
export const getContacts = async (req, res, next) => {
  const myId = req.user.id;

  try {
    // Select all user IDs who have sent or received messages from current user
    const sentTo = await db.query('SELECT DISTINCT receiver_id as id FROM messages WHERE sender_id = $1', [myId]);
    const receivedFrom = await db.query('SELECT DISTINCT sender_id as id FROM messages WHERE receiver_id = $1', [myId]);

    const idsSet = new Set([
      ...sentTo.rows.map(r => r.id),
      ...receivedFrom.rows.map(r => r.id)
    ]);

    const uniqueIds = Array.from(idsSet);
    
    if (uniqueIds.length === 0) {
      return res.json([]);
    }

    // Fetch details for these users
    const usersResult = await db.query(
      `SELECT id, name, email, role FROM users WHERE id IN (${uniqueIds.join(',')})`
    );

    const contacts = usersResult.rows;

    // Inject last message info
    for (let contact of contacts) {
      const lastMsgResult = await db.query(
        'SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at DESC LIMIT 1',
        [myId, contact.id]
      );
      
      const lastMsg = lastMsgResult.rows[0];
      contact.lastMessage = lastMsg ? lastMsg.message_text : '';
      contact.lastMessageTime = lastMsg ? lastMsg.created_at : null;
      contact.unreadCount = lastMsg && lastMsg.sender_id !== myId && !lastMsg.is_read ? 1 : 0;
    }

    // Sort contacts by last message time
    contacts.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.json(contacts);
  } catch (err) {
    next(err);
  }
};
