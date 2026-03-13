-- 기존 테이블 제거 (있을 경우)
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS cakes CASCADE;

-- 새 응답 테이블 (이름별 호/불호 케이크 목록)
CREATE TABLE IF NOT EXISTS responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  liked_cakes TEXT[] NOT NULL DEFAULT '{}',
  disliked_cakes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 수정 시 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER responses_updated_at
  BEFORE UPDATE ON responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "responses_select" ON responses FOR SELECT USING (true);
CREATE POLICY "responses_insert" ON responses FOR INSERT WITH CHECK (true);
CREATE POLICY "responses_update" ON responses FOR UPDATE USING (true);
CREATE POLICY "responses_delete" ON responses FOR DELETE USING (true);
