# 🎂 팀 케이크 수요조사

팀원들이 케이크의 호/불호를 투표할 수 있는 웹 애플리케이션입니다.

## 기술 스택

- **Frontend & API**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel

---

## 🚀 배포 방법 (처음 한 번만 진행)

### 1단계: Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 접속 후 로그인 (GitHub 계정 사용 가능)
2. **"New Project"** 클릭
3. 프로젝트 이름: `cake-survey` (원하는 이름 OK)
4. 데이터베이스 비밀번호 설정 (기억해두기)
5. 리전: `Northeast Asia (Seoul)` 선택 → **"Create new project"**

### 2단계: DB 테이블 생성

1. Supabase 대시보드 → **SQL Editor** 클릭
2. `supabase/schema.sql` 파일 내용을 전체 복사
3. SQL Editor에 붙여넣고 **"Run"** 클릭
4. 성공 메시지 확인 ✅

### 3단계: Supabase API 키 확인

1. 대시보드 → **Settings** → **API**
2. 다음 두 가지를 복사해두기:
   - **Project URL**: `https://xxxx.supabase.co`
   - **anon / public** 키 (API Keys 섹션)

### 4단계: GitHub에 코드 업로드

```bash
git init
git add .
git commit -m "feat: 케이크 수요조사 앱"
git branch -M main
git remote add origin https://github.com/your-username/cake-survey.git
git push -u origin main
```

> GitHub 리포지토리를 미리 만들어두세요: [github.com/new](https://github.com/new)

### 5단계: Vercel 배포

1. [vercel.com](https://vercel.com) 접속 후 GitHub 계정으로 로그인
2. **"Add New Project"** → GitHub 리포지토리 선택 (`cake-survey`)
3. **"Import"** 클릭
4. **Environment Variables** 섹션에 다음 두 값 입력:

| 변수명 | 값 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` |

5. **"Deploy"** 클릭 → 약 1~2분 후 배포 완료! 🎉

---

## 💻 로컬 개발

```bash
# 1. 환경변수 파일 생성
cp .env.local.example .env.local
# .env.local 파일을 열어서 실제 값으로 수정

# 2. 패키지 설치
npm install

# 3. 개발 서버 시작
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 📱 기능

- 이름 입력 후 케이크별 **좋아요 👍 / 싫어요 👎** 투표
- 투표는 언제든지 **변경 가능** (같은 이름으로 재투표)
- **실시간 집계 바** (좋아요/싫어요 비율 시각화)
- `/results` 페이지에서 **순위별 결과** 확인 (10초마다 자동 업데이트)
- **최애 케이크 🏆 / 최다 싫어요 😬** 하이라이트 카드

---

## 📁 프로젝트 구조

```
cake-survey/
├── app/
│   ├── page.tsx          # 메인 투표 페이지
│   ├── results/
│   │   └── page.tsx      # 결과 집계 페이지
│   └── api/
│       ├── cakes/route.ts    # 케이크 목록 API
│       ├── votes/route.ts    # 투표 API
│       └── results/route.ts  # 결과 집계 API
├── lib/
│   └── supabase.ts       # Supabase 클라이언트
├── supabase/
│   └── schema.sql        # DB 테이블 생성 SQL
└── .env.local.example    # 환경변수 예시
```
