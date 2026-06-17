-- 회원 휴대폰 번호(숫자만) UNIQUE — Production 적용 전 수동 검토
-- ensure-member-schema 부트스트랩에는 포함하지 않음

CREATE UNIQUE INDEX IF NOT EXISTS idx_members_phone_digits
  ON members (regexp_replace(phone, '[^0-9]', '', 'g'))
  WHERE phone IS NOT NULL AND phone <> '' AND phone <> '미입력';
