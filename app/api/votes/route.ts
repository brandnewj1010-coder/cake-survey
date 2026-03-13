import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const voterName = searchParams.get('voter_name')

  if (!voterName) {
    return NextResponse.json({ error: '투표자 이름이 필요합니다.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('voter_name', voterName)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { cake_id, voter_name, preference } = body

  if (!cake_id || !voter_name || !preference) {
    return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 })
  }

  if (!['like', 'dislike'].includes(preference)) {
    return NextResponse.json({ error: '잘못된 투표값입니다.' }, { status: 400 })
  }

  if (voter_name.trim().length < 1 || voter_name.trim().length > 20) {
    return NextResponse.json({ error: '이름은 1~20자 이내로 입력해주세요.' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('votes')
    .select('id')
    .eq('cake_id', cake_id)
    .eq('voter_name', voter_name.trim())
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('votes')
      .update({ preference })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ...data, updated: true })
  }

  const { data, error } = await supabase
    .from('votes')
    .insert({ cake_id, voter_name: voter_name.trim(), preference })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ...data, updated: false }, { status: 201 })
}
