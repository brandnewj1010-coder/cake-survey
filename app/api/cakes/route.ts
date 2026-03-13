import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data: cakes, error: cakesError } = await supabase
    .from('cakes')
    .select('*')
    .order('created_at', { ascending: true })

  if (cakesError) {
    return NextResponse.json({ error: cakesError.message }, { status: 500 })
  }

  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('cake_id, preference')

  if (votesError) {
    return NextResponse.json({ error: votesError.message }, { status: 500 })
  }

  const cakesWithVotes = cakes.map((cake) => {
    const cakeVotes = votes.filter((v) => v.cake_id === cake.id)
    return {
      ...cake,
      likes: cakeVotes.filter((v) => v.preference === 'like').length,
      dislikes: cakeVotes.filter((v) => v.preference === 'dislike').length,
    }
  })

  return NextResponse.json(cakesWithVotes)
}
