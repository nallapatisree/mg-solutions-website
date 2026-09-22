import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { str, isEmail, isPhone } from '../../../lib/validate';

export const runtime = 'nodejs';

// PUBLIC endpoint: accepts enquiries from the website contact form.
export async function POST(request) {
  try {
    const body = await request.json();

    const data = {
      name: str(body.name, { max: 120 }),
      email: str(body.email, { max: 160 }).toLowerCase(),
      mobile: str(body.mobile, { max: 30 }),
      company_name: str(body.company_name, { max: 160 }),
      service_requested: str(body.service_requested, { max: 120 }),
      budget_range: str(body.budget_range, { max: 60 }),
      project_description: str(body.project_description, { max: 5000 }),
      message: str(body.message, { max: 5000 })
    };

    const fields = {};
    if (!data.name) fields.name = 'Please enter your name';
    if (!isEmail(data.email)) fields.email = 'Please enter a valid email address';
    if (data.mobile && !isPhone(data.mobile)) fields.mobile = 'Please enter a valid phone number';
    if (!data.message && !data.project_description) fields.message = 'Please tell us about your project';

    if (Object.keys(fields).length) {
      return NextResponse.json({ error: 'Please correct the highlighted fields', fields }, { status: 400 });
    }

    const db = getDb();
    db.prepare(
      `INSERT INTO enquiries (name, email, mobile, company_name, service_requested, budget_range, project_description, message, status)
       VALUES (@name, @email, @mobile, @company_name, @service_requested, @budget_range, @project_description, @message, 'New')`
    ).run(data);

    return NextResponse.json({ ok: true });
  } catch {
    // Never leak internal error details to the public.
    return NextResponse.json({ error: 'Unable to submit your enquiry right now' }, { status: 500 });
  }
}
