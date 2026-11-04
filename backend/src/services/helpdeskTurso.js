const { createClient } = require('@libsql/client');
const crypto = require('crypto');

let tursoClient = null;

function getTursoClient() {
  if (tursoClient) return tursoClient;

  const url = process.env.TURSO_HELPDESK_URL || 'file:./helpdesk.db';
  const authToken = process.env.TURSO_HELPDESK_AUTH_TOKEN || undefined;

  console.log(`[TURSO-HELPDESK] 🛡️ Initializing isolated Turso connection to: ${url.startsWith('file:') ? 'Local SQLite file' : url}`);

  tursoClient = createClient({
    url,
    authToken,
  });

  return tursoClient;
}

/**
 * Auto-initialize SQLite schema in Turso DB
 */
async function initHelpDeskTables() {
  const client = getTursoClient();

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS helpdesk_tickets (
        id TEXT PRIMARY KEY,
        ticket_number TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_email TEXT NOT NULL,
        user_role TEXT NOT NULL,
        category TEXT NOT NULL,
        subject TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT DEFAULT 'normal',
        status TEXT DEFAULT 'open',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS helpdesk_messages (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        sender_type TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        sender_email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (ticket_id) REFERENCES helpdesk_tickets(id) ON DELETE CASCADE
      );
    `);

    console.log('[TURSO-HELPDESK] ✅ Turso Help Desk tables verified and ready.');
  } catch (err) {
    console.error('[TURSO-HELPDESK] ❌ Error initializing Turso schema:', err.message);
  }
}

/**
 * Generate human-friendly ticket code (e.g. ATEL-7492)
 */
function generateTicketNumber() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ATEL-${randomNum}`;
}

/**
 * Create a new ticket
 */
async function createTicket({ userId, userName, userEmail, userRole, category, subject, description, priority = 'normal' }) {
  const client = getTursoClient();
  const id = crypto.randomUUID();
  const ticketNumber = generateTicketNumber();
  const now = new Date().toISOString();

  await client.execute({
    sql: `
      INSERT INTO helpdesk_tickets (
        id, ticket_number, user_id, user_name, user_email, user_role, category, subject, description, priority, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)
    `,
    args: [id, ticketNumber, userId, userName, userEmail.toLowerCase().trim(), userRole, category, subject, description, priority, now, now],
  });

  // Also add initial message
  const initialMsgId = crypto.randomUUID();
  await client.execute({
    sql: `
      INSERT INTO helpdesk_messages (id, ticket_id, sender_type, sender_name, sender_email, message, created_at)
      VALUES (?, ?, 'user', ?, ?, ?, ?)
    `,
    args: [initialMsgId, id, userName, userEmail.toLowerCase().trim(), description, now],
  });

  return {
    id,
    ticketNumber,
    subject,
    status: 'open',
    priority,
    category,
    createdAt: now,
  };
}

/**
 * List tickets for a specific user
 */
async function listUserTickets(userEmail) {
  const client = getTursoClient();
  const res = await client.execute({
    sql: `
      SELECT id, ticket_number, category, subject, priority, status, created_at, updated_at
      FROM helpdesk_tickets
      WHERE user_email = ?
      ORDER BY updated_at DESC
    `,
    args: [userEmail.toLowerCase().trim()],
  });

  return res.rows;
}

/**
 * Get ticket details and all message threads
 */
async function getTicketDetails(ticketId, userEmail = null) {
  const client = getTursoClient();

  const ticketSql = userEmail
    ? `SELECT * FROM helpdesk_tickets WHERE id = ? AND user_email = ?`
    : `SELECT * FROM helpdesk_tickets WHERE id = ?`;
  const ticketArgs = userEmail ? [ticketId, userEmail.toLowerCase().trim()] : [ticketId];

  const ticketRes = await client.execute({ sql: ticketSql, args: ticketArgs });
  if (ticketRes.rows.length === 0) return null;

  const ticket = ticketRes.rows[0];

  const msgRes = await client.execute({
    sql: `SELECT * FROM helpdesk_messages WHERE ticket_id = ? ORDER BY created_at ASC`,
    args: [ticketId],
  });

  return {
    ticket,
    messages: msgRes.rows,
  };
}

/**
 * Add a reply to an existing ticket
 */
async function addReplyToTicket({ ticketId, senderType, senderName, senderEmail, message }) {
  const client = getTursoClient();
  const msgId = crypto.randomUUID();
  const now = new Date().toISOString();

  await client.execute({
    sql: `
      INSERT INTO helpdesk_messages (id, ticket_id, sender_type, sender_name, sender_email, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [msgId, ticketId, senderType, senderName, senderEmail, message, now],
  });

  // Update ticket updated_at and status if resolved previously
  await client.execute({
    sql: `UPDATE helpdesk_tickets SET updated_at = ?, status = CASE WHEN status = 'resolved' THEN 'open' ELSE status END WHERE id = ?`,
    args: [now, ticketId],
  });

  return { id: msgId, ticketId, senderType, senderName, message, createdAt: now };
}

/**
 * Update ticket status
 */
async function updateTicketStatus(ticketId, status) {
  const client = getTursoClient();
  const now = new Date().toISOString();

  const validStatuses = ['open', 'in_progress', 'waiting_user', 'resolved', 'closed'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  await client.execute({
    sql: `UPDATE helpdesk_tickets SET status = ?, updated_at = ? WHERE id = ?`,
    args: [status, now, ticketId],
  });

  return { ticketId, status, updatedAt: now };
}

module.exports = {
  getTursoClient,
  initHelpDeskTables,
  createTicket,
  listUserTickets,
  getTicketDetails,
  addReplyToTicket,
  updateTicketStatus,
};

