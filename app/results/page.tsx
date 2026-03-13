'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type SurveyResponse = {
  id: string
  name: string
  liked_cakes: string[]
  disliked_cakes: string[]
  created_at: string
}

type RankItem = { name: string; count: number }
type Rankings = { topLiked: RankItem[]; topDisliked: RankItem[] }

function getCakeEmoji(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('초코') || n.includes('choco')) return '🍫'
  if (n.includes('딸기') || n.includes('strawberry')) return '🍓'
  if (n.includes('치즈') || n.includes('cheese')) return '🧀'
  if (n.includes('당근') || n.includes('carrot')) return '🥕'
  if (n.includes('레몬') || n.includes('lemon')) return '🍋'
  if (n.includes('바닐라') || n.includes('vanilla')) return '🍦'
  if (n.includes('블루베리') || n.includes('blueberry')) return '🫐'
  if (n.includes('마카롱') || n.includes('macaron')) return '🍬'
  if (n.includes('녹차') || n.includes('matcha') || n.includes('green')) return '🍵'
  if (n.includes('티라미수') || n.includes('tiramisu')) return '☕'
  if (n.includes('망고') || n.includes('mango')) return '🥭'
  if (n.includes('복숭아') || n.includes('peach')) return '🍑'
  if (n.includes('사과') || n.includes('apple')) return '🍎'
  if (n.includes('포도') || n.includes('grape')) return '🍇'
  if (n.includes('생크림') || n.includes('크림') || n.includes('cream')) return '🍰'
  if (n.includes('홍차') || n.includes('얼그레이')) return '🫖'
  if (n.includes('밤') || n.includes('chestnut')) return '🌰'
  if (n.includes('오레오') || n.includes('oreo')) return '🍪'
  if (n.includes('피스타치오')) return '💚'
  return '🎂'
}

const rankMedal = ['🥇', '🥈', '🥉']

function RankingModal({ rankings, onClose }: { rankings: Rankings; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 text-2xl font-bold">×</button>
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🏆</div>
          <h2 className="text-xl font-extrabold text-gray-800">케이크 인기 순위</h2>
          <p className="text-gray-400 text-xs mt-1">팀원들의 취향을 집계했어요</p>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-green-600 mb-3 flex items-center gap-2">
              <span>👍</span> 가장 사랑받는 케이크 TOP 3
            </h3>
            {rankings.topLiked.length === 0 ? (
              <p className="text-gray-300 text-xs text-center py-2">아직 데이터가 없습니다</p>
            ) : (
              <div className="space-y-2">
                {rankings.topLiked.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3 bg-green-50 rounded-2xl px-4 py-3">
                    <span className="text-xl">{rankMedal[i]}</span>
                    <span className="text-lg">{getCakeEmoji(item.name)}</span>
                    <span className="font-semibold text-gray-700 flex-1">{item.name}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{item.count}명</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-500 mb-3 flex items-center gap-2">
              <span>👎</span> 가장 불호하는 케이크 TOP 3
            </h3>
            {rankings.topDisliked.length === 0 ? (
              <p className="text-gray-300 text-xs text-center py-2">아직 데이터가 없습니다</p>
            ) : (
              <div className="space-y-2">
                {rankings.topDisliked.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3 bg-red-50 rounded-2xl px-4 py-3">
                    <span className="text-xl">{rankMedal[i]}</span>
                    <span className="text-lg">{getCakeEmoji(item.name)}</span>
                    <span className="font-semibold text-gray-700 flex-1">{item.name}</span>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{item.count}명</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ name, onConfirm, onCancel, deleting }: {
  name: string
  onConfirm: () => void
  onCancel: () => void
  deleting: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-xs w-full text-center" onClick={(e) => e.stopPropagation()}>
        <div className="text-5xl mb-4">🗑️</div>
        <h2 className="text-lg font-extrabold text-gray-800 mb-2">응답을 삭제할까요?</h2>
        <p className="text-gray-500 text-sm mb-6">
          <span className="font-bold text-rose-500">{name}</span>님의 응답이 DB에서 완전히 삭제됩니다. 되돌릴 수 없어요!
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold text-sm transition-colors"
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [rankings, setRankings] = useState<Rankings | null>(null)
  const [showRanking, setShowRanking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [myName, setMyName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const fetchData = useCallback(async () => {
    const [resRes, rankRes] = await Promise.all([
      fetch('/api/responses'),
      fetch('/api/rankings'),
    ])
    const [resData, rankData] = await Promise.all([resRes.json(), rankRes.json()])
    setResponses(resData)
    setRankings(rankData)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    const saved = localStorage.getItem('cake_survey_name')
    if (saved) setMyName(saved)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/responses/${encodeURIComponent(deleteTarget)}`, { method: 'DELETE' })
    if (res.ok) {
      if (deleteTarget === myName) {
        localStorage.removeItem('cake_survey_name')
        setMyName('')
      }
      setResponses((prev) => prev.filter((r) => r.name !== deleteTarget))
      showToast(`${deleteTarget}님의 응답이 삭제되었습니다.`)
    } else {
      showToast('삭제 중 오류가 발생했습니다.')
    }
    setDeleting(false)
    setDeleteTarget(null)
    fetchData()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎂</div>
          <p className="text-gray-400">불러오는 중...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl text-sm font-semibold animate-fade-in">
          {toast}
        </div>
      )}

      {showRanking && rankings && (
        <RankingModal rankings={rankings} onClose={() => setShowRanking(false)} />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          name={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🍰</div>
          <h1 className="text-3xl font-extrabold text-gray-800">우리 팀 케이크 호불호</h1>
          <p className="text-gray-400 text-sm mt-2">
            총 <span className="font-bold text-rose-500">{responses.length}명</span>이 참여했습니다
          </p>
          <div className="flex justify-center gap-3 mt-5 flex-wrap">
            <button
              onClick={() => setShowRanking(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white rounded-full text-sm font-bold shadow-md transition-all hover:shadow-lg"
            >
              🏆 순위보기
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 rounded-full text-sm font-semibold border border-gray-200 shadow-sm transition-all"
            >
              ✏️ 내 응답 입력/수정
            </Link>
          </div>
        </div>

        {/* 응답 목록 */}
        {responses.length === 0 ? (
          <div className="text-center py-20 text-gray-300">
            <div className="text-5xl mb-4">🫙</div>
            <p>아직 응답이 없습니다</p>
            <Link href="/" className="text-rose-400 text-sm underline mt-2 inline-block">
              첫 번째로 응답하러 가기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((resp) => {
              const isMe = resp.name === myName
              return (
                <div
                  key={resp.id}
                  className={`bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow p-6 border ${
                    isMe ? 'border-rose-200 ring-1 ring-rose-100' : 'border-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-base shadow-sm ${
                      isMe
                        ? 'bg-gradient-to-br from-rose-400 to-pink-500'
                        : 'bg-gradient-to-br from-rose-200 to-pink-300'
                    }`}>
                      {resp.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{resp.name}</p>
                        {isMe && (
                          <span className="text-xs bg-rose-100 text-rose-500 px-2 py-0.5 rounded-full font-semibold">나</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(resp.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                      </p>
                    </div>

                    {/* 삭제 버튼 - 본인 카드에만 표시 */}
                    {isMe && (
                      <button
                        onClick={() => setDeleteTarget(resp.name)}
                        className="ml-auto flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium border border-transparent hover:border-red-100"
                        title="내 응답 삭제"
                      >
                        🗑️ 삭제
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {resp.liked_cakes.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-green-600 mb-2 flex items-center gap-1">
                          👍 <span>호</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {resp.liked_cakes.map((cake) => (
                            <span
                              key={cake}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100"
                            >
                              <span className="text-base">{getCakeEmoji(cake)}</span>
                              {cake}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {resp.disliked_cakes.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-red-500 mb-2 flex items-center gap-1">
                          👎 <span>불호</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {resp.disliked_cakes.map((cake) => (
                            <span
                              key={cake}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-medium border border-red-100"
                            >
                              <span className="text-base">{getCakeEmoji(cake)}</span>
                              {cake}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {resp.liked_cakes.length === 0 && resp.disliked_cakes.length === 0 && (
                      <p className="text-gray-300 text-sm">아직 입력된 내용이 없습니다</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="text-center text-gray-300 text-xs mt-10">
          15초마다 자동 업데이트 · 삭제는 본인 카드에서만 가능합니다
        </p>
      </div>
    </main>
  )
}
