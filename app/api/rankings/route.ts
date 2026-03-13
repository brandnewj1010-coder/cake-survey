import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('responses')
    .select('liked_cakes, disliked_cakes')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const likedCount: Record<string, number> = {}
  const dislikedCount: Record<string, number> = {}

  data.forEach((row) => {
    row.liked_cakes?.forEach((cake: string) => {
      likedCount[cake] = (likedCount[cake] ?? 0) + 1
    })
    row.disliked_cakes?.forEach((cake: string) => {
      dislikedCount[cake] = (dislikedCount[cake] ?? 0) + 1
    })
  })

  const topLiked = Object.entries(likedCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }))

  const topDisliked = Object.entries(dislikedCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }))

  return NextResponse.json({ topLiked, topDisliked })
}
