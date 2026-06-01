# Battery Manager 장바구니 기능 설계 v1 (5차)

> **상태:** 설계·타입 초안·UI 미리보기만 완료. 실제 담기·저장·결제·주문 DB는 **6차**에서 구현.  
> **코드 참조:** `src/types/cart.ts`, `src/data/cart-flow-guide.ts`, `/cart-design` 미리보기 페이지.

---

## 1. 장바구니 기본 철학

Battery Manager 장바구니는 **일반 쇼핑몰 장바구니와 다릅니다.**

| 일반 쇼핑몰 | Battery Manager |
|------------|-----------------|
| 상품명·수량·가격 | + 차량·규격·단자·폐전지·수령·설치·확인 상태 |
| 바로 결제 | **주문 전 확인** 흐름 우선 |

### 필수로 한 줄(item)에 묶을 정보

- 상품명, 배터리 규격, 브랜드, 단자 방향
- 차량명, 연식/세대, 추천·확인 상태 (`fitmentStatus`)
- 폐전지 반납 여부 (`usedBatteryReturn`)
- 수령 방식·설치 방식 (`fulfillment`, `install`)
- 주문 전 확인 필요 여부, 사진 확인 필요 여부, 고객 메모
- 경고 문구 배열 (`warnings`)

### 설계 원칙

1. **어떤 차량 기준**으로 담았는지 카드에 표시한다.
2. **폐전지 반납/미반납**에 따라 가격·안내·2차 메시지 템플릿이 달라진다.
3. 규격 미확정 → `fitmentStatus !== confirmed` → 확인 필요 UI.
4. **AGM80L / AGM80R** 등 단자 방향 오주문을 구조적으로 줄인다.
5. 장바구니 CTA는 **주문하기**보다 **주문 전 체크·사진 확인·고객센터**를 동등 또는 우선 노출한다.

### 기존 코드와의 관계

- `src/components/platform/CartContext.tsx`: 현재 `{ productId, qty }` 스텁 → **6차에서 `BatteryCartItem`으로 교체 예정**.
- `src/app/shop/cart`: 단순 쇼핑 데모 → **6차 `/cart` 신규** 또는 점진 이전.

---

## 2. 데이터 구조 (`src/types/cart.ts`)

### `BatteryCartItem` (핵심 필드)

```ts
type BatteryCartItem = {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  batterySpec: string;
  terminalDirection?: "L" | "R" | "unknown";
  quantity: number;
  basePrice: number;
  finalPrice?: number;

  vehicle?: {
    vehicleId?: string;
    displayName?: string;
    generationName?: string;
    year?: string;
    fuelType?: string;
    isg?: boolean;
  };

  recommendationStatus?: "vehicle_recommended" | "spec_matched" | "customer_selected" | "unverified";
  fitmentStatus: "confirmed" | "needs_photo_check" | "needs_customer_confirm" | "unknown";

  usedBatteryReturn: {
    option: "return" | "no_return" | "undecided";
    priceImpact?: number;
    guideRequired: boolean;
    guideAcknowledged?: boolean;
  };

  fulfillment: {
    method: "delivery" | "store_pickup" | "visit_install" | "undecided";
    storeId?: "deokcheon" | "hakjang";
    requestedRegion?: string;
  };

  install: {
    method: "self" | "store_install" | "visit_install" | "undecided";
  };

  preOrderCheckRequired: boolean;
  photoCheckRequired: boolean;
  customerMemo?: string;
  warnings: string[];
  source?: "vehicle_detail" | "battery_detail" | "search" | "manual";

  createdAt: string;
  updatedAt: string;
};
```

### `BatteryCartSummary`

```ts
type BatteryCartSummary = {
  itemCount: number;
  subtotal: number;
  usedBatteryReturnAdjustment: number;
  estimatedTotal: number;
  hasNeedsReviewItem: boolean;
  hasNoReturnItem: boolean;
  hasUndecidedUsedBattery: boolean;
  hasUndecidedFulfillment: boolean;
};
```

### 저장 (6차 초안)

- **비회원 우선:** `localStorage` 키 `battery-manager-cart-v1-draft`
- 서버·로그인 동기화는 후순위

---

## 3. UX 흐름

### 흐름 A — 차량 상세 → 담기

1. 차량 검색 → 차량 상세  
2. 추천 배터리·규격·단자 확인  
3. 폐전지 반납/미반납 선택  
4. 수령 방식 선택  
5. 장바구니 담기 (`source: vehicle_detail`, `vehicle` 자동 채움)  
6. 장바구니에서 주문 전 체크 (`/order-checklist` 연결)

### 흐름 B — 배터리 상세 → 담기

1. 규격 검색 → 배터리 상세  
2. 차량 입력/선택 유도  
3. 미확인 시 `needs_customer_confirm`  
4. 폐전지·수령 선택 후 담기  
5. 사진 확인 CTA (`/photo-check`)

### 흐름 C — 규격만 알고 주문

1. 규격 검색 → 상품 선택  
2. 차량 입력 선택·권장  
3. 단자 주의 → 담기  
4. 주문 전 확인 박스

### 흐름 D — 폐전지 반납

1. 반납 조건 + 안내 체크  
2. 카드에 반납 조건 표시  
3. 주문 전 반납 가능 재확인  
4. 주문 후 `used-battery-return-guide` / `used-battery-pickup-request` 메시지(2차 템플릿)

### 흐름 E — 미반납

1. 미반납 + 가격 차이 안내  
2. 카드에 미반납 표시  
3. 회수 없음 확인

---

## 4. `/cart` 페이지 섹션 (6차 UI 목표)

| 순서 | 섹션 | 내용 |
|------|------|------|
| 1 | 상단 요약 | 담긴 수, 확인 필요 여부, 폐전지 조건 요약 |
| 2 | 상품 카드 | 이미지, 규격, 차량, 단자, 폐전지, 수령·설치, 상태 배지, 경고, 수량, 삭제/수정 |
| 3 | 확인 필요 박스 | 트리거 조건 충족 시 표시 |
| 4 | 폐전지 안내 박스 | 반납 조건·`/support/used-battery-return` 링크 |
| 5 | 주문 전 체크리스트 | 6항목 + `/order-checklist` |
| 6 | CTA | 주문하기 / 사진 확인 / 고객센터 / 계속 쇼핑 |

### 주문하기 버튼 정책 (5차 확정안)

**기본: `soft_block_with_ack`**

| 조건 | 동작 |
|------|------|
| 확인 필요 항목 있음 + 위험 인지 미완료 | **주문하기 비활성** |
| 확인 필요 + 고객이 경고 모달에서 인지 | 진행 가능(비권장, 로그 저장) |
| 전 항목 confirmed, 폐전지·수령 결정 완료 | 주문하기 활성 → **주문서 작성 단계만**(PG 미연동) |

---

## 5. 상태별 화면 문구

### `fitmentStatus`

| 값 | 배지 | 메시지 |
|----|------|--------|
| `confirmed` | 확인됨 | 차량 기준 추천 규격입니다. 주문 전 실제 장착 배터리 사진 확인을 권장합니다. |
| `needs_photo_check` | 사진 확인 권장 | 차량 정보만으로 확정이 어려워 사진 확인을 권장합니다. |
| `needs_customer_confirm` | 고객 확인 필요 | 고객님이 입력한 차량 정보 기준으로 확인이 필요합니다. |
| `unknown` | 규격 확인 필요 | 차량 정보가 없어 규격 확인이 필요합니다. |

### `usedBatteryReturn.option`

| 값 | 표시 |
|----|------|
| `return` | 반납 조건 · 회수 필요 |
| `no_return` | 미반납 · 회수 없음 |
| `undecided` | 선택 필요 |

### `fulfillment.method`

| 값 | 표시 |
|----|------|
| `delivery` | 택배 배송 |
| `store_pickup` | 매장 방문 수령 (덕천/학장) |
| `visit_install` | 출장 교체 |
| `undecided` | 수령 방식 미선택 |

---

## 6. 상품·차량·검색·사진 확인 연결

### 배터리 상세 (`/batteries/[code]`)

- **장바구니 담기:** 규격·가격 블록 하단, 폐전지 선택 **후**
- 차량 정보: 담기 전 모달/인라인 입력 권장
- 폐전지: 반납/미반납 라디오 + `/support/used-battery-return` 링크

### 차량 상세

- 추천 카드 **장바구니 담기**
- `vehicle` 객체 자동 주입, `fitmentStatus`는 DB 추천 신뢰도에 따라 `confirmed` 또는 `needs_photo_check`

### 검색 결과

- **바로 담기 비권장** — 상세 이동 후 담기
- 규격만 검색한 경우 `unknown` / `needs_customer_confirm` 기본값

### 사진 확인 (`/photo-check`)

- 완료 후 `fitmentStatus` 갱신 가능(6차)
- `photoCheckRequired: false` 로 전환

---

## 7. 주문 전 체크리스트 연동

- 데이터: `CART_ORDER_CHECKLIST` (`cart-flow-guide.ts`)
- 기존 `/order-checklist`, `/support/order-guide#used-battery-precheck`와 문구 일치 유지
- 장바구니 하단에서 **동일 6항목** 체크 UI (6차: 체크 상태 localStorage 또는 주문서로 전달)

---

## 8. 위험 요소와 대응

| 위험 | 대응 |
|------|------|
| 단자 L/R 오주문 | 단자 배지, 체크리스트, 사진 확인 CTA |
| AGM/일반 혼동 | spec 코드 강조, 확인 필요 배지 |
| 폐전지 반납 미이해 | 가격 차이, 안내 링크, 반납 체크, 2차 메시지 |
| 연식·세대 오입력 | 차량 카드, `needs_customer_confirm` |
| 택배 vs 출장 혼동 | 수령·설치 라벨 분리 |
| 비회원 장바구니 소실 | localStorage 안내 배너 |
| 모바일 옵션 누락 | undecided 배지, 담기 전 필수 선택 |
| 확인 없이 결제 | soft block, 확인 필요 박스 |

---

## 9. 6차 실제 개발 범위 제안

1. `/cart` 페이지 생성  
2. `localStorage` 임시 저장 (`battery-manager-cart-v1-draft`)  
3. `BatteryCartItem` 적용 및 `CartContext` 마이그레이션  
4. 담기 / 삭제 / 수량 변경  
5. 폐전지 반납·미반납 UI  
6. 차량·규격·단자 표시  
7. 확인 필요 경고·배지  
8. 주문 전 체크리스트  
9. 주문하기 → 주문서 작성 또는 준비 중 (PG·주문 DB 없음)  
10. 비회원 localStorage 우선  

### 6차에서 하지 않을 것 (별도 마일스톤)

- 결제 PG, 주문 DB 영속화, 재고 실시간 연동  
- 택배 회수 API, 폐전지 자동 추가금 청구  
- 무통장 48시간 자동 취소 **실행** (3차는 UI만 완료)

---

## 10. 검수 체크리스트 (5차)

- [x] 본 문서 및 타입 초안
- [x] UX 흐름 A–E 문서화
- [x] `/cart-design` 미리보기 (실제 장바구니 아님 표시)
- [x] 폐전지·fitment·수령 방식 설계 포함
- [ ] 6차: `/cart` 실구현

---

*작성: 5차 설계 작업 · Battery Manager*
