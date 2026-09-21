import { NextResponse } from 'next/server';
import { DataStore, EventItem } from '@/lib/data-service';

export async function GET() {
  const events = DataStore.getEvents();
  return NextResponse.json({ success: true, events });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if this is a registration action
    if (body.action === 'register') {
      if (!body.eventId) return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
      const ok = DataStore.registerForEvent(body.eventId);
      if (!ok) return NextResponse.json({ error: 'Event is full or not found' }, { status: 400 });
      return NextResponse.json({ success: true, message: 'Successfully registered for event' });
    }

    // Creating a new event
    if (!body.title || !body.date) {
      return NextResponse.json({ error: 'Title and Date are required' }, { status: 400 });
    }

    const newEvent: EventItem = {
      id: body.id || `event-${Date.now()}`,
      title: body.title,
      organizer: body.organizer || 'BuildNext Community',
      type: body.type || 'Workshop',
      date: body.date,
      time: body.time || '06:00 PM IST',
      mode: body.mode || 'Online',
      spotsTotal: Number(body.spotsTotal) || 200,
      spotsFilled: 0,
      description: body.description || '',
      perks: Array.isArray(body.perks)
        ? body.perks
        : (body.perks ? body.perks.split('\n').filter(Boolean) : ['Participation Certificate']),
      status: 'Open'
    };

    DataStore.addEvent(newEvent);
    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

