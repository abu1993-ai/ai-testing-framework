import { query } from './dbConnection';

export async function waitForAIResponse(
  phone: string,
  startTime: number
): Promise<string | null> {

  for (let i = 0; i < 30; i++) {

    try {
      const result: any = await query(`
        SELECT request_body, response_body, created_at
        FROM ai_fabric.channel_logs
        WHERE created_at >= NOW() - INTERVAL '30 seconds'
        ORDER BY id DESC
      `);

      const match = result.rows.find((r: any) => {
        try {
          const req = typeof r.request_body === 'string'
            ? JSON.parse(r.request_body)
            : r.request_body;

          const created = new Date(r.created_at).getTime();

          return (
            req?.from === phone &&
            created >= startTime &&
            r.response_body
          );

        } catch {
          return false;
        }
      });

      if (match) {
        const res = typeof match.response_body === 'string'
          ? JSON.parse(match.response_body)
          : match.response_body;

        const text = res?.response_parts?.find((p: any) => p.type === 'text');

        if (text?.content) return text.content;
      }

    } catch (err) {
      console.log("DB ERROR:", err);
    }

    await new Promise(r => setTimeout(r, 3000));
  }

  return null;
}