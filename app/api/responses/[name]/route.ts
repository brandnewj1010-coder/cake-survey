import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)

  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('name', decodedName)
    .single()

  if (error) return NextResponse.json(null)
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)

  const { error } = await supabase
    .from('responses')
    .delete()
    .eq('name', decodedName)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
