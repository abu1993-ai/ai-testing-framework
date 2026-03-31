import { pool } from "./dbClient";

export async function getConversationIdByPhone(phone: string): Promise<number | null> {

  const [contactRows]: any = await pool.query(
    `SELECT id FROM contacts WHERE phone_number = ? LIMIT 1`,
    [phone]
  );

  if (!contactRows.length) return null;

  const contactId = contactRows[0].id;

  const [conversationRows]: any = await pool.query(
    `
      SELECT id
      FROM conversations
      WHERE contact_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [contactId]
  );

  return conversationRows.length ? conversationRows[0].id : null;
}
