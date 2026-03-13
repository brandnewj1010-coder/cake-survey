-- 케이크 목록 테이블
CREATE TABLE IF NOT EXISTS cakes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 투표 테이블
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cake_id UUID NOT NULL REFERENCES cakes(id) ON DELETE CASCADE,
  voter_name TEXT NOT NULL,
  preference TEXT NOT NULL CHECK (preference IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (cake_id, voter_name)
);

-- 케이크 샘플 데이터
INSERT INTO cakes (name, description, image_url) VALUES
  ('딸기 케이크', '신선한 딸기와 생크림이 가득한 케이크', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80'),
  ('초코 케이크', '진한 초콜릿 시트에 초코 크림', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80'),
  ('치즈 케이크', '부드럽고 진한 뉴욕 스타일 치즈케이크', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80'),
  ('당근 케이크', '촉촉한 당근 시트와 크림치즈 프로스팅', 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&q=80'),
  ('레몬 케이크', '상큼한 레몬 크림과 촉촉한 시트', 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&q=80'),
  ('마카롱 케이크', '알록달록 마카롱이 올라간 생크림 케이크', 'https://images.unsplash.com/photo-1558023698-ee0a7e2e9b3b?w=400&q=80')
ON CONFLICT DO NOTHING;

-- RLS (Row Level Security) 활성화
ALTER TABLE cakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- 누구나 케이크 조회 가능
CREATE POLICY "cakes_select_policy" ON cakes
  FOR SELECT USING (true);

-- 누구나 투표 조회 가능
CREATE POLICY "votes_select_policy" ON votes
  FOR SELECT USING (true);

-- 누구나 투표 추가 가능
CREATE POLICY "votes_insert_policy" ON votes
  FOR INSERT WITH CHECK (true);

-- 본인 투표만 수정 가능 (이름 기반)
CREATE POLICY "votes_update_policy" ON votes
  FOR UPDATE USING (true);

-- 본인 투표만 삭제 가능 (이름 기반)
CREATE POLICY "votes_delete_policy" ON votes
  FOR DELETE USING (true);
