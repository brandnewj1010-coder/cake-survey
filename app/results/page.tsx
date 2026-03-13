'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type CakeResult = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  likes: number
  dislikes: number
  total: number
  likeRate: number
}

export default function ResultsPage() {
  const [results, setResults] = useState<CakeResult[]>([])
  const [totalVoters, setTotalVoters] = useState(0)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchResults = useCallback(async () => {
    const res = await fetch('/api/results')
    const data = await res.json()
    if (!res.ok) return
    setResults(data.results)
    setTotalVoters(data.totalVoters)
    setLastUpdated(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchResults()
    const interval = setInterval(fetchResults, 10000)
    return () => clearInterval(interval)
  }, [fetchResults])

  const totalVotes = results.reduce((sum, r) => sum + r.total, 0)
  const topCake = results[0]
  const mostDisliked = [...results].sort((a, b) => b.dislikes - a.dislikes)[0]

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🎂</div>
          <p className="text-gray-500 text-lg">결과를 불러오는 중...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">📊</div>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">케이크 수요조사 결과</h1>
          <p className="text-gray-500">
            총 <span className="font-bold text-rose-500">{totalVoters}명</span>이 참여했습니다 ·{' '}
            <span className="font-bold text-gray-600">{totalVotes}개</span> 투표
          </p>
          {lastUpdated && (
            <p className="text-gray-400 text-xs mt-1">
              마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')} (10초마다 자동 새로고침)
            </p>
          )}
          <Link
            href="/"
            className="inline-block mt-4 px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-sm font-semibold transition-colors shadow"
          >
            🎂 투표하러 가기
          </Link>
        </div>

        {/* 하이라이트 카드 */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-400 text-white rounded-2xl p-6 shadow-lg">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-sm font-medium opacity-80 mb-1">가장 사랑받는 케이크</p>
              <p className="text-2xl font-extrabold">{topCake?.name}</p>
              <p className="text-sm mt-1 opacity-90">
                👍 {topCake?.likes}표 · 좋아요율 {topCake?.likeRate}%
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-500 to-gray-700 text-white rounded-2xl p-6 shadow-lg">
              <div className="text-3xl mb-2">😬</div>
              <p className="text-sm font-medium opacity-80 mb-1">가장 호불호 갈리는 케이크</p>
              <p className="text-2xl font-extrabold">{mostDisliked?.name}</p>
              <p className="text-sm mt-1 opacity-90">
                👎 {mostDisliked?.dislikes}표
              </p>
            </div>
          </div>
        )}

        {/* 결과 목록 */}
        <div className="space-y-4">
          {results.map((cake, index) => (
            <div key={cake.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="flex items-center gap-4 p-5">
                {/* 순위 */}
                <div className={`text-2xl font-extrabold w-10 text-center ${
                  index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-gray-300'
                }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                </div>

                {/* 이미지 */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {cake.image_url ? (
                    <Image src={cake.image_url} alt={cake.name} fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-2xl">🎂</div>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-800 text-lg">{cake.name}</h3>
                    <div className="flex gap-3 text-sm text-gray-600 ml-2 flex-shrink-0">
                      <span className="text-green-600 font-semibold">👍 {cake.likes}</span>
                      <span className="text-red-500 font-semibold">👎 {cake.dislikes}</span>
                    </div>
                  </div>

                  {/* 진행 바 */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden flex">
                      {cake.total > 0 ? (
                        <>
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
                            style={{ width: `${cake.likeRate}%` }}
                          />
                          <div
                            className="h-full bg-gradient-to-r from-red-400 to-rose-500 transition-all duration-700"
                            style={{ width: `${100 - cake.likeRate}%` }}
                          />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500 w-14 text-right flex-shrink-0">
                      {cake.total > 0 ? `좋아요 ${cake.likeRate}%` : '투표 없음'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🗳️</div>
            <p>아직 투표 데이터가 없습니다.</p>
          </div>
        )}

        <p className="text-center text-gray-400 text-sm mt-12">
          결과는 10초마다 자동 업데이트됩니다
        </p>
      </div>
    </main>
  )
}
