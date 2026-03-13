import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, liked_cakes, disliked_cakes } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('responses')
    .select('id')
    .eq('name', name.trim())
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('responses')
      .update({ liked_cakes: liked_cakes ?? [], disliked_cakes: disliked_cakes ?? [] })
      .eq('name', name.trim())
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ...data, updated: true })
  }

  const { data, error } = await supabase
    .from('responses')
    .insert({ name: name.trim(), liked_cakes: liked_cakes ?? [], disliked_cakes: disliked_cakes ?? [] })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, updated: false }, { status: 201 })
}
