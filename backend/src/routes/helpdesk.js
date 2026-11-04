const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createTicket,
  listUserTickets,
  getTicketDetails,
  addReplyToTicket,
  updateTicketStatus,
} = require('../services/helpdeskTurso');

// Protect all helpdesk routes with JWT
router.use(authenticateToken);

// ==============================================================================
// 1. CREATE TICKET
// ==============================================================================
router.post('/tickets', async (req, res) => {
  try {
    const { category, subject, description, priority } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required.' });
    }

    const ticket = await createTicket({
      userId: req.user.userId,
      userName: req.user.name || 'Atelion User',
      userEmail: req.user.email,
      userRole: req.user.role || 'student',
      category: category || 'technical',
      subject: subject.trim(),
      description: description.trim(),
      priority: priority || 'normal',
    });

    console.log(`[TURSO-HELPDESK] 🎫 Ticket created #${ticket.ticketNumber} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully.',
      ticket,
    });
  } catch (err) {
    console.error('[TURSO-CREATE-TICKET-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Failed to create ticket in Turso DB.' });
  }
});

// ==============================================================================
// 2. LIST CURRENT USER'S TICKETS
// ==============================================================================
router.get('/tickets', async (req, res) => {
  try {
    const tickets = await listUserTickets(req.user.email);
    res.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (err) {
    console.error('[TURSO-LIST-TICKETS-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Failed to fetch tickets from Turso DB.' });
  }
});

// ==============================================================================
// 3. GET SINGLE TICKET & CONVERSATION THREAD
// ==============================================================================
router.get('/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getTicketDetails(id, req.user.email);

    if (!data) {
      return res.status(404).json({ error: 'Ticket not found or unauthorized access.' });
    }

    res.json({
      success: true,
      ticket: data.ticket,
      messages: data.messages,
    });
  } catch (err) {
    console.error('[TURSO-GET-TICKET-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Failed to retrieve ticket details.' });
  }
});

// ==============================================================================
// 4. POST REPLY TO TICKET
// ==============================================================================
router.post('/tickets/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Reply message cannot be empty.' });
    }

    // Verify ticket ownership
    const existing = await getTicketDetails(id, req.user.email);
    if (!existing) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const reply = await addReplyToTicket({
      ticketId: id,
      senderType: 'user',
      senderName: req.user.name || 'User',
      senderEmail: req.user.email,
      message: message.trim(),
    });

    console.log(`[TURSO-HELPDESK] 💬 Reply added to ticket #${existing.ticket.ticket_number}`);

    res.status(201).json({
      success: true,
      message: 'Reply posted successfully.',
      reply,
    });
  } catch (err) {
    console.error('[TURSO-REPLY-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Failed to post reply.' });
  }
});

// ==============================================================================
// 5. UPDATE TICKET STATUS (e.g. USER CLOSES OR MARKS RESOLVED)
// ==============================================================================
router.patch('/tickets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existing = await getTicketDetails(id, req.user.email);
    if (!existing) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const updated = await updateTicketStatus(id, status);

    res.json({
      success: true,
      message: `Ticket marked as ${status}.`,
      ticket: updated,
    });
  } catch (err) {
    console.error('[TURSO-STATUS-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Failed to update ticket status.' });
  }
});

module.exports = router;

