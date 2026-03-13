'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type CakeWithVotes = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  likes: number
  dislikes: number
  myVote?: 'like' | 'dislike' | null
}

export default function Home() {
  const [name, setName] = useState('')
  const [submittedName, setSubmittedName] = useState('')
  const [cakes, setCakes] = useState<CakeWithVotes[]>([])
  const [myVotes, setMyVotes] = useState<Record<string, 'like' | 'dislike'>>({})
  const [loading, setLoading] = useState(false)
  const [voting, setVoting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const fetchCakes = useCallback(async () => {
    const res = await fetch('/api/cakes')
    const data = await res.json()
    if (!res.ok) return
    setCakes(data)
  }, [])

  const fetchMyVotes = useCallback(async (voterName: string) => {
    const res = await fetch(`/api/votes?voter_name=${encodeURIComponent(voterName)}`)
    const data = await res.json()
    if (!res.ok) return
    const map: Record<string, 'like' | 'dislike'> = {}
    data.forEach((v: { cake_id: string; preference: 'like' | 'dislike' }) => {
      map[v.cake_id] = v.preference
    })
    setMyVotes(map)
  }, [])

  useEffect(() => {
    fetchCakes()
    const saved = localStorage.getItem('cake_survey_name')
    if (saved) {
      setSubmittedName(saved)
      setName(saved)
      fetchMyVotes(saved)
    }
  }, [fetchCakes, fetchMyVotes])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('이름을 입력해주세요.')
      return
    }
    if (trimmed.length > 20) {
      setError('이름은 20자 이내로 입력해주세요.')
      return
    }
    setError('')
    setLoading(true)
    setSubmittedName(trimmed)
    localStorage.setItem('cake_survey_name', trimmed)
    await fetchMyVotes(trimmed)
    setLoading(false)
  }

  const handleVote = async (cakeId: string, preference: 'like' | 'dislike') => {
    if (!submittedName) return
    setVoting(cakeId + preference)

    const prevVotes = { ...myVotes }
    const prevCakes = [...cakes]

    setMyVotes((prev) => ({ ...prev, [cakeId]: preference }))
    setCakes((prev) =>
      prev.map((cake) => {
        if (cake.id !== cakeId) return cake
        const oldPref = prevVotes[cakeId]
        let likes = cake.likes
        let dislikes = cake.dislikes
        if (oldPref === 'like') likes--
        if (oldPref === 'dislike') dislikes--
        if (preference === 'like') likes++
        if (preference === 'dislike') dislikes++
        return { ...cake, likes, dislikes }
      })
    )

    const res = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cake_id: cakeId, voter_name: submittedName, preference }),
    })

    if (!res.ok) {
      setMyVotes(prevVotes)
      setCakes(prevCakes)
      showToast('투표 중 오류가 발생했습니다.')
    } else {
      const data = await res.json()
      showToast(data.updated ? '투표가 변경되었습니다! ✅' : '투표가 완료되었습니다! 🎉')
    }

    setVoting(null)
  }

  const handleChangeName = () => {
    setSubmittedName('')
    setMyVotes({})
    localStorage.removeItem('cake_survey_name')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">🎂</div>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">팀 케이크 수요조사</h1>
          <p className="text-gray-500 text-lg">좋아하는 케이크에 👍, 싫어하는 케이크에 👎를 눌러주세요!</p>
          <Link
            href="/results"
            className="inline-block mt-4 px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-sm font-semibold transition-colors shadow"
          >
            📊 결과 보기
          </Link>
        </div>

        {/* 이름 입력 */}
        {!submittedName ? (
          <div className="max-w-md mx-auto mb-10">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">먼저 이름을 입력해주세요</h2>
              <form onSubmit={handleNameSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 홍길동"
                  maxLength={20}
                  className="w-full border-2 border-gray-200 focus:border-rose-400 rounded-xl px-4 py-3 text-gray-700 outline-none transition-colors text-center text-lg"
                />
                {error && <p className="text-rose-500 text-sm text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-lg"
                >
                  {loading ? '확인 중...' : '투표 시작하기 🎉'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-white rounded-full px-6 py-2 shadow flex items-center gap-2">
              <span className="text-gray-500 text-sm">투표자:</span>
              <span className="font-bold text-rose-500">{submittedName}</span>
            </div>
            <button
              onClick={handleChangeName}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              변경
            </button>
          </div>
        )}

        {/* 케이크 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cakes.map((cake) => {
            const myPref = myVotes[cake.id]
            const total = cake.likes + cake.dislikes
            const likeRate = total > 0 ? Math.round((cake.likes / total) * 100) : 0

            return (
              <div
                key={cake.id}
                className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                  myPref ? 'ring-2 ' + (myPref === 'like' ? 'ring-green-400' : 'ring-red-400') : ''
                }`}
              >
                {/* 이미지 */}
                <div className="relative h-48 bg-gray-100">
                  {cake.image_url ? (
                    <Image
                      src={cake.image_url}
                      alt={cake.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-5xl">🎂</div>
                  )}
                  {myPref && (
                    <div className={`absolute top-2 right-2 rounded-full px-3 py-1 text-white text-xs font-bold shadow ${
                      myPref === 'like' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {myPref === 'like' ? '👍 좋아요' : '👎 싫어요'}
                    </div>
                  )}
                </div>

                {/* 내용 */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{cake.name}</h3>
                  {cake.description && (
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{cake.description}</p>
                  )}

                  {/* 집계 바 */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>👍 {cake.likes}</span>
                      <span>{total > 0 ? `${likeRate}% 좋아요` : '아직 투표 없음'}</span>
                      <span>👎 {cake.dislikes}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      {total > 0 && (
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${likeRate}%` }}
                        />
                      )}
                    </div>
                  </div>

                  {/* 투표 버튼 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVote(cake.id, 'like')}
                      disabled={!submittedName || voting !== null}
                      className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all duration-150 ${
                        myPref === 'like'
                          ? 'bg-green-500 text-white shadow-md scale-105'
                          : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {voting === cake.id + 'like' ? '...' : '👍 좋아요'}
                    </button>
                    <button
                      onClick={() => handleVote(cake.id, 'dislike')}
                      disabled={!submittedName || voting !== null}
                      className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all duration-150 ${
                        myPref === 'dislike'
                          ? 'bg-red-500 text-white shadow-md scale-105'
                          : 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {voting === cake.id + 'dislike' ? '...' : '👎 싫어요'}
                    </button>
                  </div>

                  {!submittedName && (
                    <p className="text-center text-xs text-gray-400 mt-2">이름 입력 후 투표 가능합니다</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {cakes.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🎂</div>
            <p>케이크 목록을 불러오는 중...</p>
          </div>
        )}

        <p className="text-center text-gray-400 text-sm mt-12">
          투표는 언제든지 변경 가능합니다 · 동일 이름으로 재접속 시 이전 투표가 유지됩니다
        </p>
      </div>
    </main>
  )
}
