import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('contact_messages').insert([
        { name, email, phone, subject, message, status: 'new' }
      ]);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: 'Message received successfully' });
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit message' }, { status: 500 });
  }
}
