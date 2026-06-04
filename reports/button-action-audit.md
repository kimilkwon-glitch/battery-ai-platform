# Button action audit

Generated: 2026-06-04T00:15:05.792Z

**Summary:** 10 pass / 0 fail (10 total), P0 failures: 0

## Results

| Label | Route | Action | Auth | Status | Priority | Notes |
|---|---|---|---|---|---|---|
| 내 차량으로 정보등록 | /vehicle/[slug] | modal | no | **pass** | P0 | Source probes satisfied |
| 내 차량으로 등록 (검색 카드) | /search | modal | no | **pass** | P0 | Source probes satisfied |
| 장바구니 담기 | /batteries/[code] | save | no | **pass** | P0 | Source probes satisfied |
| 로그인 | /login | save | no | **pass** | P0 | Source probes satisfied |
| 회원가입 | /signup | save | no | **pass** | P0 | Source probes satisfied |
| 마이페이지 | /mypage | navigate | no | **pass** | P1 | Source probes satisfied |
| 주문하기 / 구매하기 | /cart, /order-request | navigate | no | **pass** | P0 | Source probes satisfied |
| 네이버 플레이스 | /service-center | external | no | **pass** | P0 | Source probes satisfied |
| 전화하기 | /service-center | external | no | **pass** | P1 | Source probes satisfied |
| 제품문의 접수 | /batteries/[code] | modal | no | **pass** | P1 | Source probes satisfied |

## Manual checklist

- 로그인 후 QM5 상세 → 내 차량으로 정보등록 → 성공 모달 → 마이페이지 차량 표시
- 비회원 로그인 redirect 복귀 ?action=saveVehicle 자동 저장
- GV80 / K3 / 100R 상세 CTA 무반응 없음 (브라우저 수동)
