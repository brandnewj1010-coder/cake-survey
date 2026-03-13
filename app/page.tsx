'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

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
  if (n.includes('무화과') || n.includes('fig')) return '🌿'
  if (n.includes('피스타치오')) return '💚'
  return '🎂'
}

type TagInputProps = {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder: string
  colorClass: string
}

function TagInput({ tags, onChange, placeholder, colorClass }: TagInputProps) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return }
    const res = await fetch(`/api/suggestions?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    const filtered = data.filter((s: string) => !tags.includes(s))
    setSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
  }, [tags])

  const handleInput = (val: string) => {
    setInput(val)
    setSelectedIdx(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 200)
  }

  const addTag = (val: string) => {
    const trimmed = val.trim()
    if (!trimmed || tags.includes(trimmed)) { setInput(''); setShowSuggestions(false); return }
    onChange([...tags, trimmed])
    setInput('')
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIdx(-1)
    inputRef.current?.focus()
  }

  const removeTag = (idx: number) => {
    onChange(tags.filter((_, i) => i !== idx))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIdx >= 0 && suggestions[selectedIdx]) {
        addTag(suggestions[selectedIdx])
      } else if (input.trim()) {
        addTag(input)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="relative">
      <div
        className={`min-h-[52px] flex flex-wrap gap-2 items-center px-3 py-2 border-2 rounded-2xl bg-white cursor-text transition-all focus-within:shadow-md ${colorClass}`}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-white shadow-sm border border-gray-100"
          >
            <span>{getCakeEmoji(tag)}</span>
            <span className="text-gray-700">{tag}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(i) }}
              className="ml-1 text-gray-400 hover:text-red-400 transition-colors font-bold"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
          placeholder={tags.length === 0 ? placeholder : '+ 추가...'}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-700 placeholder-gray-300 text-sm py-1"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={s}
              onMouseDown={() => addTag(s)}
              className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                i === selectedIdx ? 'bg-rose-50' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{getCakeEmoji(s)}</span>
              <span className="text-gray-700">{s}</span>
              <span className="ml-auto text-xs text-gray-400">기존 응답</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Home() {
  const [step, setStep] = useState<'name' | 'form' | 'done'>('name')
  const [name, setName] = useState('')
  const [likedCakes, setLikedCakes] = useState<string[]>([])
  const [dislikedCakes, setDislikedCakes] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('cake_survey_name')
    if (saved) setName(saved)
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('이름을 입력해주세요.'); return }
    if (trimmed.length > 20) { setError('이름은 20자 이내로 입력해주세요.'); return }
    setError('')
    setLoading(true)

    const res = await fetch(`/api/responses/${encodeURIComponent(trimmed)}`)
    const existing = await res.json()

    if (existing) {
      setLikedCakes(existing.liked_cakes ?? [])
      setDislikedCakes(existing.disliked_cakes ?? [])
      setIsEditing(true)
    }

    localStorage.setItem('cake_survey_name', trimmed)
    setLoading(false)
    setStep('form')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (likedCakes.length === 0 && dislikedCakes.length === 0) {
      setError('호 또는 불호 케이크를 하나 이상 입력해주세요.')
      return
    }
    setError('')
    setSubmitting(true)

    const res = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), liked_cakes: likedCakes, disliked_cakes: dislikedCakes }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '제출 중 오류가 발생했습니다.')
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setStep('done')
    showToast(isEditing ? '수정이 완료되었습니다! ✅' : '제출이 완료되었습니다! 🎉')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl text-sm font-semibold animate-fade-in">
          {toast}
        </div>
      )}

      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 drop-shadow">🎂</div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">팀 케이크 수요조사</h1>
          <p className="text-gray-500 mt-2 text-sm">좋아하는 케이크와 싫어하는 케이크를 알려주세요!</p>
        </div>

        {/* Step: 이름 입력 */}
        {step === 'name' && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-lg font-bold text-gray-700 mb-1">👋 안녕하세요!</h2>
            <p className="text-gray-400 text-sm mb-6">먼저 이름을 입력해주세요</p>
            <form onSubmit={handleNameSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 홍길동"
                maxLength={20}
                autoFocus
                className="w-full border-2 border-gray-100 focus:border-rose-300 rounded-2xl px-5 py-4 text-gray-700 text-lg outline-none transition-all text-center font-medium placeholder-gray-300"
              />
              {error && <p className="text-rose-500 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg text-base"
              >
                {loading ? '확인 중...' : '다음 →'}
              </button>
            </form>
          </div>
        )}

        {/* Step: 케이크 입력 */}
        {step === 'form' && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm">
                {name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-800">{name}</p>
                <p className="text-xs text-gray-400">{isEditing ? '기존 응답을 수정합니다' : '새로 입력합니다'}</p>
              </div>
              <button
                onClick={() => { setStep('name'); setLikedCakes([]); setDislikedCakes([]) }}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline"
              >
                이름 변경
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* 좋아하는 케이크 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-green-600 mb-2">
                  <span className="text-lg">👍</span> 좋아하는 케이크
                  <span className="text-xs font-normal text-gray-400 ml-1">Enter로 추가</span>
                </label>
                <TagInput
                  tags={likedCakes}
                  onChange={setLikedCakes}
                  placeholder="예: 초코케이크, 딸기케이크..."
                  colorClass="border-green-200 focus-within:border-green-400"
                />
                {likedCakes.length > 0 && (
                  <p className="text-xs text-green-500 mt-1.5 pl-1">
                    {likedCakes.length}개 선택됨
                  </p>
                )}
              </div>

              {/* 싫어하는 케이크 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-red-500 mb-2">
                  <span className="text-lg">👎</span> 싫어하는 케이크
                  <span className="text-xs font-normal text-gray-400 ml-1">Enter로 추가</span>
                </label>
                <TagInput
                  tags={dislikedCakes}
                  onChange={setDislikedCakes}
                  placeholder="예: 치즈케이크, 당근케이크..."
                  colorClass="border-red-200 focus-within:border-red-400"
                />
                {dislikedCakes.length > 0 && (
                  <p className="text-xs text-red-400 mt-1.5 pl-1">
                    {dislikedCakes.length}개 선택됨
                  </p>
                )}
              </div>

              {error && <p className="text-rose-500 text-sm text-center">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg text-base mt-2"
              >
                {submitting ? '제출 중...' : isEditing ? '✅ 수정 완료' : '🎉 제출하기'}
              </button>
            </form>
          </div>
        )}

        {/* Step: 완료 */}
        {step === 'done' && (
          <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
              {isEditing ? '수정 완료!' : '제출 완료!'}
            </h2>
            <p className="text-gray-500 mb-2 text-sm">{name}님의 응답이 저장되었습니다</p>

            {/* 입력 내용 미리보기 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl text-left space-y-3">
              {likedCakes.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-green-600 mb-2">👍 좋아하는 케이크</p>
                  <div className="flex flex-wrap gap-1.5">
                    {likedCakes.map((c) => (
                      <span key={c} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                        {getCakeEmoji(c)} {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {dislikedCakes.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-red-500 mb-2">👎 싫어하는 케이크</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dislikedCakes.map((c) => (
                      <span key={c} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-100">
                        {getCakeEmoji(c)} {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <Link
                href="/results"
                className="block w-full bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold py-4 rounded-2xl transition-all shadow-md text-base"
              >
                🍰 우리 조직 케이크 호불호 보러가기
              </Link>
              <button
                onClick={() => { setStep('form'); setIsEditing(true) }}
                className="w-full border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-3 rounded-2xl transition-all text-sm"
              >
                ✏️ 수정하기
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
