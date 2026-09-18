import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { str, toInt, clamp } from '../../../lib/validate';

export const runtime = 'nodejs';

// PUBLIC endpoint: clients may submit feedback.
// Submissions are always created as `pending` and stay invisible until an admin approves.
export async function POST(request) {
  try {
    const body = await request.json();
    const data = {
      client_name: str(body.client_name, { max: 120 }),
      company_name: str(body.company_name, { max: 160 }),
      rating: clamp(toInt(body.rating, 5), 1, 5),
      feedback: str(body.feedback, { max: 3000 }),
      service_taken: str(body.service_taken, { max: 160 })
    };

    if (!data.client_name || !data.feedback) {
      return NextResponse.json({ error: 'Name and feedback are required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(
      `INSERT INTO testimonials (client_name, company_name, rating, feedback, service_taken, approval_status, is_visible)
       VALUES (@client_name, @company_name, @rating, @feedback, @service_taken, 'pending', 1)`
    ).run(data);

    return NextResponse.json({ ok: true, message: 'Thank you - your feedback is awaiting review.' });
  } catch {
    return NextResponse.json({ error: 'Unable to submit feedback right now' }, { status: 500 });
  }
}
