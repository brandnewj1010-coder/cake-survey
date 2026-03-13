import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Cake = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  created_at: string
}

export type Vote = {
  id: string
  cake_id: string
  voter_name: string
  preference: 'like' | 'dislike'
  created_at: string
}

export type CakeWithVotes = Cake & {
  likes: number
  dislikes: number
  myVote?: 'like' | 'dislike' | null
}
