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
    .select('cake_id, voter_name, preference')

  if (votesError) {
    return NextResponse.json({ error: votesError.message }, { status: 500 })
  }

  const results = cakes.map((cake) => {
    const cakeVotes = votes.filter((v) => v.cake_id === cake.id)
    const likes = cakeVotes.filter((v) => v.preference === 'like').length
    const dislikes = cakeVotes.filter((v) => v.preference === 'dislike').length
    const total = likes + dislikes
    return {
      ...cake,
      likes,
      dislikes,
      total,
      likeRate: total > 0 ? Math.round((likes / total) * 100) : 0,
    }
  })

  const voters = [...new Set(votes.map((v) => v.voter_name))]

  results.sort((a, b) => b.likes - a.likes)

  return NextResponse.json({ results, totalVoters: voters.length })
}
