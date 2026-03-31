import { pool } from './dbClient';

export async function getLatestOrderStatus(conversationId: number) {
  const [rows]: any = await pool.query(
    `
    SELECT status
    FROM order_status_updates
    WHERE conversation_id = ?
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [conversationId]
  );

  return rows.length ? rows[0].status : null;
}

export function stagePassed(stage: string, status: string | null): boolean {

  if (!status) return false;

  switch (stage) {

    case "ORDER_CREATED":
      return true;

    case "PAYMENT_PENDING":
      return status === "PAYMENT_PENDING";

    default:
      return false;
  }
}
