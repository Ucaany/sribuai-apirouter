import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateApiKey } from '@/lib/api-key'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const { key, hash, preview } = generateApiKey()
  const serviceClient = await createServiceClient()

  const { error } = await serviceClient.from('api_keys').insert({
    user_id: user.id,
    name: name.trim(),
    key_hash: hash,
    key_preview: preview,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ key })
}
