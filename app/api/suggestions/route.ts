import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.toLowerCase() ?? ''

  const { data, error } = await supabase
    .from('responses')
    .select('liked_cakes, disliked_cakes')

  if (error) return NextResponse.json([])

  const allCakes = new Set<string>()
  data.forEach((row) => {
    row.liked_cakes?.forEach((c: string) => allCakes.add(c))
    row.disliked_cakes?.forEach((c: string) => allCakes.add(c))
  })

  const filtered = q
    ? [...allCakes].filter((c) => c.toLowerCase().includes(q))
    : [...allCakes]

  return NextResponse.json(filtered.slice(0, 8))
}
