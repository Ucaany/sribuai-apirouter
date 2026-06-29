import { NextResponse } from 'next/server'
import { adminGuard } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const guard = await adminGuard()
  if (guard) return guard

  const body = await request.json()
  const { title, message, type = 'info' } = body

  if (!title || !message) {
    return NextResponse.json({ error: 'title dan message wajib diisi' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('id')

  if (!users?.length) {
    return NextResponse.json({ error: 'Tidak ada user' }, { status: 400 })
  }

  const notifications = users.map(u => ({
    user_id: u.id,
    title,
    message,
    type: type as 'info' | 'warning' | 'success' | 'error'
  }))

  const { error } = await supabase
    .from('notifications')
    .insert(notifications)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ 
    success: true, 
    sent_count: users.length 
  }, { status: 201 })
}
