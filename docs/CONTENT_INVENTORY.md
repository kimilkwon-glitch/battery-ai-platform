# Battery Manager 콘텐츠 인벤토리

> 자동 생성 문서 — `npm run generate:content-workbench` 로 갱신

## 요약

- 전체 콘텐츠: **36**
- 가이드: 13
- Q&A: 7
- 증상: 7
- 사진분석: 2
- 오주문 방지: 4
- 규격문의: 1
- 쇼핑안내: 1
- 브랜드가이드: 1
- published: **35**
- draft: **1**
- needs_review: **0**
- hidden: **0**
- 연결 누락: **9**

## 연결 누락 콘텐츠

- `symptom-winter-discharge` · 겨울철 방전 · src/data/diagnosis/symptom-rules.json
- `symptom-battery-warning-light` · 배터리 경고등 · src/data/diagnosis/symptom-rules.json
- `photo-analysis-disclaimer` · 사진 분석 보조 안내 · src/data/common/fallback.ts
- `manufacture-date` · 제조일자 확인법 · src/data/content/hub-guides.json
- `symptom-agm-replacement` · AGM 교체 필요 · src/data/diagnosis/symptom-rules.json
- `q-agm-required` · AGM 꼭 써야 하나요? · src/data/qna/questions.json
- `cca-ah` · CCA/Ah 의미 · src/data/content/hub-guides.json
- `symptom-ibs-bms-error` · IBS/BMS 오류 · src/data/diagnosis/symptom-rules.json
- `admin-spec-inquiry-001` · 연식·연료별 규격 문의 안내 · src/data/admin/adminContent.sample.json

## 수정 필요 (needs_review)

_(없음)_

## 가이드

### winter-cca
- 제목: 겨울철 CCA 점검
- 상태: 게시중
- 카테고리: 점검·관리 팁
- 태그: 겨울, CCA
- 관련 차량: grandeur-ig
- 관련 배터리: AGM80L
- 관련 규격: AGM80L
- 요약: 영하권 시동
- 본문:

기온이 낮아지면 체감 CCA가 급격히 떨어집니다. 겨울 전 부하 테스트를 권장합니다.

- thumbnailType: guide
- 원본 파일: src/data/content/hub-guides.json
- 공개 경로: /guide/spec?guide=winter-cca
- 메모: —

---

### grandeur-ig-fuel-battery-guide
- 제목: 그랜저 IG 배터리, 가솔린·디젤·LPG를 나눠서 확인해야 합니다
- 상태: 게시중
- 카테고리: 연식·연료별 주의
- 태그: 그랜저, 그랜저 IG, 가솔린, 디젤, LPG, AGM80L, DIN
- 관련 차량: grandeur-ig
- 관련 배터리: AGM80L, DIN80L, DIN90L
- 관련 규격: AGM80L, DIN80L, DIN90L
- 요약: 그랜저 IG는 연료에 따라 배터리 규격이 달라질 수 있어, 단순히 그랜저 IG 하나로만 검색하면 정확도가 떨어질 수 있습니다.
- 본문:

그랜저 IG는 연료를 나눠 봐야 합니다
그랜저 IG는 가솔린·디젤·LPG 모델이 있어서, "그랜저 배터리" 한 마디로는 답이 갈립니다. 연료 종류를 모르면 AGM80L을 주문했다가 LPG 차량이라 DIN 계열이 필요한 경우가 생깁니다.

가솔린과 디젤은 AGM80L 기준으로 확인합니다
IG 가솔린·디젤 중 ISG가 붙은 트림은 AGM80L로 확인하는 경우가 많습니다. 일반 MF/DIN으로 내리면 충전 제어·시동 반복 문제가 생길 수 있어, ISG 여부도 같이 확인하는 게 좋습니다.

LPG는 DIN80L 또는 DIN90L 계열을 확인해야 합니다
LPG IG는 AGM이 아니라 DIN80L, DIN90L 쪽으로 잡히는 경우가 있습니다. LPG는 배터리 위치·고정 방식도 조금 달라서, 연료를 LPG로 확인한 뒤 해당 카드를 보는 게 안전합니다.

고객이 보기 쉽게 연료별 카드로 보여주는 것이 좋습니다
매장에서도 화면을 같이 보면서 "가솔린 탭 → AGM80L"처럼 안내합니다. Battery Manager 그랜저 IG 페이지에서도 연료 탭을 누르면 바로 해당 규격 카드가 보이도록 되어 있습니다.

기존 배터리 사진을 확인하면 오주문을 줄일 수 있습니다
라벨에 AGM80L, DIN80L 등 규격과 L/R 단자가 같이 나옵니다. 연료를 잊었을 때도 사진만 있으면 대부분 해결됩니다. 사진 확인이 필요하다고 나오면 모달 안내를 따라 주세요.

- thumbnailType: guide
- 원본 파일: src/data/content/articles/grandeur-ig-fuel-battery-guide.json
- 공개 경로: /guides/grandeur-ig-fuel-battery-guide
- 메모: —

---

### blackbox-cutoff
- 제목: 블랙박스 컷오프
- 상태: 게시중
- 카테고리: 점검·관리 팁
- 태그: 블랙박스, 방전
- 관련 차량: sorento-mq4, seltos
- 관련 배터리: —
- 관련 규격: —
- 요약: 12.2V 이상 권장
- 본문:

주차녹화·상시전원 사용 시 컷오프를 12.2V 이상으로 설정하면 방전 반복을 줄일 수 있습니다.

- thumbnailType: guide
- 원본 파일: src/data/content/hub-guides.json
- 공개 경로: /guide/spec?guide=blackbox-cutoff
- 메모: —

---

### sorento-mq4-hybrid-agm60l
- 제목: 쏘렌토 MQ4 하이브리드 배터리, AGM60L 확인이 먼저입니다
- 상태: 게시중
- 카테고리: 차종별 규격
- 태그: 쏘렌토, 쏘렌토 MQ4, 하이브리드, AGM60L, AGM80L
- 관련 차량: sorento-mq4
- 관련 배터리: AGM60L, AGM80L
- 관련 규격: AGM60L, AGM80L
- 요약: 쏘렌토 MQ4는 가솔린·디젤과 하이브리드의 배터리 규격이 다를 수 있어, 하이브리드 차량은 AGM60L 기준으로 먼저 확인하는 것이 좋습니다.
- 본문:

쏘렌토 MQ4는 연료부터 확인해야 합니다
매장에 "쏘렌토 MQ4 배터리 하나만 주세요"라고 오시는 분이 꽤 많습니다. 그런데 MQ4는 가솔린, 디젤, 하이브리드에 따라 12V 보조배터리 규격이 달라질 수 있습니다. 차량등록증이나 연료 표시를 먼저 보고, 하이브리드인지 아닌지부터 구분하는 게 제일 빠릅니다.

하이브리드는 AGM60L 기준으로 먼저 봅니다
쏘렌토 MQ4 하이브리드는 AGM60L로 확인하는 경우가 많습니다. 하이브리드는 시동·전장품 부하 패턴이 가솔린/디젤과 달라서, 용량이 한 단계 작게 잡히는 경우가 있습니다. 사이트에서 하이브리드 탭을 선택하면 AGM60L 카드가 먼저 보이도록 정리해 두었습니다.

가솔린·디젤과 헷갈리면 오주문이 날 수 있습니다
가솔린·디젤 MQ4는 AGM80L 계열로 보는 경우가 많습니다. 하이브리드에 AGM80L을 넣거나, 반대로 가솔린에 AGM60L을 주문하면 단순히 "안 맞는다"로 끝나지 않고, ISG·충전 제어 쪽에서도 문제가 생길 수 있습니다. "쏘렌토 배터리"만으로 검색하지 말고, 연료까지 같이 확인해 주세요.

기존 배터리 사진을 보면 정확도가 올라갑니다
라벨에 AGM60L, AGM80L처럼 용량과 단자 방향(L/R)이 같이 적혀 있습니다. 사진 한 장만 보내주셔도, 매장에서 바로 맞는 규격을 짚어드릴 수 있습니다. 특히 교체 주기가 길어서 연료를 잊어버린 경우, 사진이 제일 확실합니다.

사이트에서는 연료별로 나눠 확인할 수 있게 구성합니다
Battery Manager에서는 쏘렌토 MQ4 상세 페이지에서 연료 탭으로 가솔린·디젤·하이브리드를 나눠 볼 수 있습니…

- thumbnailType: guide
- 원본 파일: src/data/content/articles/sorento-mq4-hybrid-agm60l.json
- 공개 경로: /guides/sorento-mq4-hybrid-agm60l
- 메모: —

---

### manufacture-date
- 제목: 제조일자 확인법
- 상태: 게시중
- 카테고리: 점검·관리 팁
- 태그: 제조일, 교체시기
- 관련 차량: —
- 관련 배터리: —
- 관련 규격: —
- 요약: 각인·라벨
- 본문:

라벨의 제조 주차/월을 확인하고 36개월 이상 경과 시 교체를 검토하세요.

- thumbnailType: guide
- 원본 파일: src/data/content/hub-guides.json
- 공개 경로: /guide/spec?guide=manufacture-date
- 메모: —

---

### porter2-year-battery-guide
- 제목: 포터2 배터리, 2020년 전후로 90R과 100R을 나눠 봐야 합니다
- 상태: 게시중
- 카테고리: 연식·연료별 주의
- 태그: 포터2, 봉고, 90R, 100R, 연식, 상용차
- 관련 차량: porter2-new, porter2-old
- 관련 배터리: 90R, 100R
- 관련 규격: 90R, 100R
- 요약: 포터2는 기본적으로 90R이 많이 쓰이지만, 2020년 이후 연식부터는 100R 기준으로 확인해야 하는 경우가 있습니다.
- 본문:

포터2는 연식을 먼저 봐야 합니다
포터2는 상용차라 배터리 문의가 정말 많습니다. 그런데 "포터2 배터리"만 말하면 90R인지 100R인지 바로 답하기 어렵습니다. 차량등록증 연식, 또는 보험증권·정비 이력에 나온 연식을 먼저 확인해 주세요.

2019년식까지는 90R 기준으로 보는 경우가 많습니다
2004년부터 이어진 포터2 구형(2019년식까지)은 90R(또는 GB90R) 계열로 맞추는 경우가 많습니다. 매장에서도 "몇 년식이세요?"를 제일 먼저 묻는 이유가 여기 있습니다.

2020년 이후는 100R 확인이 필요합니다
2020년형 이후 포터2는 100R(GB100R) 기준으로 확인해야 하는 경우가 있습니다. 90R과 100R은 크기·단자 위치가 비슷해 보여도 호환되지 않는 경우가 있어, 연식만으로 대충 맞추면 반품·재작업이 생깁니다.

상용차는 추가 전장품 여부도 같이 봐야 합니다
냉동탑, 작업등, 인버터, 추가 배터리 등 전장품이 붙어 있으면 방전 패턴이 달라집니다. 규격 자체는 같아도, 용량 여유나 교체 주기 안내가 달라질 수 있습니다. "그냥 똑같은 거"라고 생각하지 말고, 사용 환경도 같이 말씀해 주시면 좋습니다.

애매하면 기존 배터리 사진이 제일 빠릅니다
배터리 윗면 라벨에 90R, 100R, GB90R, GB100R처럼 적혀 있습니다. 사진 한 장이면 연식를 몰라도 대부분 바로 판별됩니다. 사이트에서도 포터2 상세 페이지에 연식별 칩을 두어 2019년 이전/2020년 이후를 나눠 볼 수 있습니다.

- thumbnailType: guide
- 원본 파일: src/data/content/articles/porter2-year-battery-guide.json
- 공개 경로: /guides/porter2-year-battery-guide
- 메모: —

---

### agm-vs-din
- 제목: AGM vs DIN
- 상태: 게시중
- 카테고리: 배터리 규격 이해
- 태그: AGM, DIN, ISG
- 관련 차량: grandeur-ig, seltos
- 관련 배터리: AGM80L, DIN74L
- 관련 규격: AGM80L, DIN74L
- 요약: ISG/IBS 차량은 AGM 유지
- 본문:

ISG·스마트충전 차량은 AGM/EFB 규격을 유지해야 충전 제어와 수명 관리가 안정적입니다. 일반 DIN으로 내리면 CCA·SOH 저하와 경고가 반복될 수 있습니다.

- thumbnailType: guide
- 원본 파일: src/data/content/hub-guides.json
- 공개 경로: /guide/spec?guide=agm-vs-din
- 메모: —

---

### agm-sizes
- 제목: AGM60/70/80/95L 차이
- 상태: 게시중
- 카테고리: 배터리 규격 이해
- 태그: AGM60L, AGM70L, AGM80L, AGM95L
- 관련 차량: seltos, grandeur-ig
- 관련 배터리: AGM60L, AGM70L, AGM80L, AGM95L
- 관련 규격: AGM60L, AGM70L, AGM80L, AGM95L
- 요약: 용량 단계
- 본문:

차량 ISG·용량·공간에 따라 AGM60L~95L 중 선택합니다. 업그레이드는 브라켓·CCA를 확인하세요.

- thumbnailType: guide
- 원본 파일: src/data/content/hub-guides.json
- 공개 경로: /guide/spec?guide=agm-sizes
- 메모: —

---

### bms-register
- 제목: BMS/IBS 등록
- 상태: 게시중
- 카테고리: 점검·관리 팁
- 태그: BMS, IBS
- 관련 차량: bmw-g30
- 관련 배터리: AGM92Ah, AGM80L
- 관련 규격: AGM92Ah, AGM80L
- 요약: 수입차·현대 일부
- 본문:

배터리 교체 후 BMS/IBS 등록을 하지 않으면 충전 제어 오차로 신품 수명이 줄 수 있습니다.

- thumbnailType: guide
- 원본 파일: src/data/content/hub-guides.json
- 공개 경로: /guide/spec?guide=bms-register
- 메모: —

---

### cca-ah
- 제목: CCA/Ah 의미
- 상태: 게시중
- 카테고리: 배터리 규격 이해
- 태그: CCA, Ah
- 관련 차량: —
- 관련 배터리: —
- 관련 규격: —
- 요약: 저온 시동·용량
- 본문:

Ah는 저장 용량, CCA는 저온 시동 전류입니다. 겨울철에는 CCA 여유율이 특히 중요합니다.

- thumbnailType: guide
- 원본 파일: src/data/content/hub-guides.json
- 공개 경로: /guide/spec?guide=cca-ah
- 메모: —

---

### din-sizes
- 제목: DIN60/74/80L 차이
- 상태: 게시중
- 카테고리: 배터리 규격 이해
- 태그: DIN74L, DIN
- 관련 차량: k5-dl3
- 관련 배터리: DIN74L
- 관련 규격: DIN74L
- 요약: 일반 차량
- 본문:

DIN 규격은 H5/H6/H7 등 케이스로 구분됩니다. 순정 Ah와 단자 방향을 맞추세요.

- thumbnailType: guide
- 원본 파일: src/data/content/hub-guides.json
- 공개 경로: /guide/spec?guide=din-sizes
- 메모: —

---

### ev-12v
- 제목: EV 12V 보조배터리
- 상태: 게시중
- 카테고리: 차종별 규격
- 태그: EV, 12V
- 관련 차량: ev6
- 관련 배터리: EV 12V
- 관련 규격: EV 12V
- 요약: EV6·EV9
- 본문:

전기차 12V는 문잠금·통신·시동 준비에 사용됩니다. 반복 방전 시 대기전류와 충전 이벤트를 함께 점검하세요.

- thumbnailType: guide
- 원본 파일: src/data/content/hub-guides.json
- 공개 경로: /guide/spec?guide=ev-12v
- 메모: —

---

### g80-rg3-agm95r-guide
- 제목: G80 RG3 배터리는 AGM95R 기준으로 확인하세요
- 상태: 게시중
- 카테고리: 차종별 규격
- 태그: G80, G80 RG3, 제네시스, GV80, GV70, G90, AGM95R, 단자방향
- 관련 차량: g80-rg3, gv80, gv70, g90
- 관련 배터리: AGM95R, AGM80R, AGM105L, AGM105R
- 관련 규격: AGM95R, AGM80R, AGM105L, AGM105R
- 요약: G80 RG3는 AGM95R 기준으로 확인하는 것이 좋습니다. 제네시스 계열은 단자 방향과 연식에 따라 혼동이 생기기 쉬워 사진 확인도 함께 권장됩니다.
- 본문:

G80 RG3는 AGM95R 기준으로 확인합니다
G80 RG3(3세대)는 AGM95R로 확인하는 경우가 많습니다. 대형 세단이라 용량·CCA 여유가 큰 규격이 들어가고, R단자(플러스 단자 위치)를 맞춰야 케이블 작업이 수월합니다.

제네시스 계열은 단자 방향 혼동이 생기기 쉽습니다
같은 95Ah 계열이라도 L과 R이 있습니다. AGM95L을 R 차량에 주문하면 현장에서 바로 문제가 드러납니다. 교체 전 기존 배터리 사진으로 +/- 위치를 꼭 확인해 주세요.

GV80은 AGM95R, GV70은 AGM80R 기준으로 볼 수 있습니다
SUV 계열도 차급에 따라 95R, 80R로 나뉩니다. "제네시스 배터리"만으로 검색하면 G80, GV80, GV70이 섞여 나옵니다. 모델명까지 같이 검색하거나 사이트에서 차종별 페이지를 이용하세요.

구형 제네시스 계열은 AGM105L이 들어가는 경우가 있습니다
DH, EQ900 등 구형 G80/G90은 AGM105L 계열로 확인해야 하는 경우가 있습니다. RG3와 세대가 다르면 규격도 달라지니, 연식·세대를 먼저 구분하는 게 중요합니다.

G90은 연식별로 AGM105L/R 구분이 필요합니다
G90은 연식·트림에 따라 AGM105L 또는 AGM105R로 갈립니다. 사진 확인이 필요한 차량으로 분류해 두었으며, 라벨 사진을 보내주시면 매장에서도 빠르게 맞출 수 있습니다.

- thumbnailType: guide
- 원본 파일: src/data/content/articles/g80-rg3-agm95r-guide.json
- 공개 경로: /guides/g80-rg3-agm95r-guide
- 메모: —

---


## Q&A

### q-bmw-bms
- 제목: 배터리 교체 후 BMS 등록 꼭 해야 하나요?
- 상태: 게시중
- 카테고리: BMS
- 태그: BMW 520i (G30), BMS, AGM92Ah
- 관련 차량: bmw-g30
- 관련 배터리: AGM92Ah
- 관련 규격: AGM92Ah
- 요약: 수입차·IBS 차량은 교체 후 등록하지 않으면 충전 제어 오차와 경고가 반복될 수 있습니다.
- 짧은 답변: 수입차·IBS 차량은 교체 후 등록하지 않으면 충전 제어 오차와 경고가 반복될 수 있습니다.
- 본문:

충전 제어가 이전 배터리 기준으로 동작해 신품 수명이 줄거나 경고가 반복될 수 있습니다. 교체 직후 등록·충전 전압 확인을 권장합니다.

- 상세 답변: 충전 제어가 이전 배터리 기준으로 동작해 신품 수명이 줄거나 경고가 반복될 수 있습니다. 교체 직후 등록·충전 전압 확인을 권장합니다.
- thumbnailType: qa
- 원본 파일: src/data/qna/questions.json
- 공개 경로: /community?q=%EB%B0%B0%ED%84%B0%EB%A6%AC%20%EA%B5%90%EC%B2%B4%20%ED%9B%84%20BMS%20%EB%93%B1%EB%A1%9D%20%EA%BC%AD%20%ED%95%B4%EC%95%BC%20%ED%95%98%EB%82%98%EC%9A%94%3F
- 메모: —

---

### q-seltos-upgrade
- 제목: 셀토스 AGM60L에서 AGM70L 업그레이드 가능한가요?
- 상태: 게시중
- 카테고리: 호환/규격
- 태그: 셀토스, AGM60L, AGM70L, 업그레이드
- 관련 차량: seltos
- 관련 배터리: AGM60L, AGM70L
- 관련 규격: AGM60L, AGM70L
- 요약: 트레이 공간과 충전 제어 조건을 확인한 뒤 선택하는 것이 좋습니다. ISG 차량은 AGM 규격 유지가 안전합니다.
- 짧은 답변: 트레이 공간과 충전 제어 조건을 확인한 뒤 선택하는 것이 좋습니다. ISG 차량은 AGM 규격 유지가 안전합니다.
- 본문:

ISG 트림은 AGM60L 유지가 안전합니다. AGM70L은 공간·CCA·고정 브라켓을 확인한 뒤 업그레이드할 수 있으며, 교체 후 충전 제어 학습을 권장합니다.

- 상세 답변: ISG 트림은 AGM60L 유지가 안전합니다. AGM70L은 공간·CCA·고정 브라켓을 확인한 뒤 업그레이드할 수 있으며, 교체 후 충전 제어 학습을 권장합니다.
- thumbnailType: qa
- 원본 파일: src/data/qna/questions.json
- 공개 경로: /community?q=%EC%85%80%ED%86%A0%EC%8A%A4%20AGM60L%EC%97%90%EC%84%9C%20AGM70L%20%EC%97%85%EA%B7%B8%EB%A0%88%EC%9D%B4%EB%93%9C%20%EA%B0%80%EB%8A%A5%ED%95%9C%EA%B0%80%EC%9A%94%3F
- 메모: —

---

### q-agm-required
- 제목: AGM 꼭 써야 하나요?
- 상태: 게시중
- 카테고리: 호환
- 태그: AGM, ISG, DIN
- 관련 차량: —
- 관련 배터리: —
- 관련 규격: —
- 요약: ISG·스마트충전·IBS/BMS 차량은 AGM/EFB 유지가 안전합니다.
- 짧은 답변: ISG·스마트충전·IBS/BMS 차량은 AGM/EFB 유지가 안전합니다.
- 본문:

ISG·스마트충전·IBS/BMS 차량은 AGM/EFB 유지가 안전합니다. 일반 DIN은 충전 제어와 맞지 않아 경고·수명 저하가 생길 수 있습니다.

- 상세 답변: ISG·스마트충전·IBS/BMS 차량은 AGM/EFB 유지가 안전합니다. 일반 DIN은 충전 제어와 맞지 않아 경고·수명 저하가 생길 수 있습니다.
- thumbnailType: qa
- 원본 파일: src/data/qna/questions.json
- 공개 경로: /community?q=AGM%20%EA%BC%AD%20%EC%8D%A8%EC%95%BC%20%ED%95%98%EB%82%98%EC%9A%94%3F
- 메모: —

---

### q-din-agm
- 제목: AGM80L 대신 DIN74L 넣어도 되나요?
- 상태: 게시중
- 카테고리: 호환
- 태그: AGM80L, DIN74L, ISG
- 관련 차량: grandeur-ig
- 관련 배터리: AGM80L, DIN74L
- 관련 규격: AGM80L, DIN74L
- 요약: ISG/BMS 차량은 AGM 유지가 안전합니다. DIN은 충방전 특성이 달라 비권장입니다.
- 짧은 답변: ISG/BMS 차량은 AGM 유지가 안전합니다. DIN은 충방전 특성이 달라 비권장입니다.
- 본문:

ISG/BMS 차량이라면 AGM 유지가 안전합니다. DIN74L은 크기·단자가 맞을 수 있어도 충방전 특성이 달라 권장하지 않습니다.

- 상세 답변: ISG/BMS 차량이라면 AGM 유지가 안전합니다. DIN74L은 크기·단자가 맞을 수 있어도 충방전 특성이 달라 권장하지 않습니다.
- thumbnailType: qa
- 원본 파일: src/data/qna/questions.json
- 공개 경로: /community?q=AGM80L%20%EB%8C%80%EC%8B%A0%20DIN74L%20%EB%84%A3%EC%96%B4%EB%8F%84%20%EB%90%98%EB%82%98%EC%9A%94%3F
- 메모: —

---

### q-grandeur-upgrade
- 제목: 그랜저 IG AGM80L에서 AGM95L 업그레이드 가능한가요?
- 상태: 게시중
- 카테고리: 호환/규격
- 태그: 그랜저 IG, AGM80L, AGM95L
- 관련 차량: grandeur-ig
- 관련 배터리: AGM80L, AGM95L
- 관련 규격: AGM80L, AGM95L
- 요약: 가능하지만 트림별 장착 공간과 ISG/BMS 조건 확인이 필요합니다.
- 짧은 답변: 가능하지만 트림별 장착 공간과 ISG/BMS 조건 확인이 필요합니다.
- 본문:

가능합니다. 다만 트림별 장착 공간과 ISG/BMS 조건을 확인해야 하며, AGM95L은 CCA 여유가 커 겨울철 시동에 유리합니다.

- 상세 답변: 가능합니다. 다만 트림별 장착 공간과 ISG/BMS 조건을 확인해야 하며, AGM95L은 CCA 여유가 커 겨울철 시동에 유리합니다.
- thumbnailType: qa
- 원본 파일: src/data/qna/questions.json
- 공개 경로: /community?q=%EA%B7%B8%EB%9E%9C%EC%A0%80%20IG%20AGM80L%EC%97%90%EC%84%9C%20AGM95L%20%EC%97%85%EA%B7%B8%EB%A0%88%EC%9D%B4%EB%93%9C%20%EA%B0%80%EB%8A%A5%ED%95%9C%EA%B0%80%EC%9A%94%3F
- 메모: —

---

### q-ev6-12v
- 제목: EV6 12V 방전이 반복되는데 원인이 뭔가요?
- 상태: 게시중
- 카테고리: EV/방전
- 태그: EV6, 12V, 방전
- 관련 차량: ev6
- 관련 배터리: EV 12V
- 관련 규격: EV 12V
- 요약: 원격 공조·앱 조회·장시간 주차 시 12V 부하가 늘 수 있습니다.
- 짧은 답변: 원격 공조·앱 조회·장시간 주차 시 12V 부하가 늘 수 있습니다.
- 본문:

원격 공조·앱 조회·주차 시간이 길면 12V 부하가 늘 수 있습니다. SOH·대기전류·충전 로그를 함께 확인하고 EV 전용 12V 규격 교체를 검토하세요.

- 상세 답변: 원격 공조·앱 조회·주차 시간이 길면 12V 부하가 늘 수 있습니다. SOH·대기전류·충전 로그를 함께 확인하고 EV 전용 12V 규격 교체를 검토하세요.
- thumbnailType: qa
- 원본 파일: src/data/qna/questions.json
- 공개 경로: /community?q=EV6%2012V%20%EB%B0%A9%EC%A0%84%EC%9D%B4%20%EB%B0%98%EB%B3%B5%EB%90%98%EB%8A%94%EB%8D%B0%20%EC%9B%90%EC%9D%B8%EC%9D%B4%20%EB%AD%94%EA%B0%80%EC%9A%94%3F
- 메모: —

---

### q-sorento-agm
- 제목: 쏘렌토 MQ4 AGM 다운그레이드해도 되나요?
- 상태: 임시저장
- 카테고리: 호환
- 태그: 쏘렌토 MQ4, AGM95L, AGM80L
- 관련 차량: sorento-mq4
- 관련 배터리: AGM95L, AGM80L
- 관련 규격: AGM95L, AGM80L
- 요약: ISG/IBS 트림은 AGM95L 유지가 안전합니다.
- 짧은 답변: ISG/IBS 트림은 AGM95L 유지가 안전합니다.
- 본문:

ISG/IBS 트림은 AGM95L 유지가 안전합니다. AGM80L 다운그레이드는 CCA·충전 제어 리스크가 있습니다.

- 상세 답변: ISG/IBS 트림은 AGM95L 유지가 안전합니다. AGM80L 다운그레이드는 CCA·충전 제어 리스크가 있습니다.
- thumbnailType: qa
- 원본 파일: src/data/qna/questions.json
- 공개 경로: /community?q=%EC%8F%98%EB%A0%8C%ED%86%A0%20MQ4%20AGM%20%EB%8B%A4%EC%9A%B4%EA%B7%B8%EB%A0%88%EC%9D%B4%EB%93%9C%ED%95%B4%EB%8F%84%20%EB%90%98%EB%82%98%EC%9A%94%3F
- 메모: —

---


## 증상

### symptom-winter-discharge
- 제목: 겨울철 방전
- 상태: 게시중
- 카테고리: 증상진단
- 태그: winter-discharge, 점검 권장
- 관련 차량: —
- 관련 배터리: —
- 관련 규격: —
- 요약: 저온 CCA 성능 저하와 교체 시점을 확인합니다.
- 본문:

저온 CCA 성능 저하와 교체 시점을 확인합니다.

- thumbnailType: symptom
- 원본 파일: src/data/diagnosis/symptom-rules.json
- 공개 경로: /diagnosis/winter-discharge
- 메모: —

---

### symptom-battery-warning-light
- 제목: 배터리 경고등
- 상태: 게시중
- 카테고리: 증상진단
- 태그: battery-warning-light, 즉시
- 관련 차량: —
- 관련 배터리: —
- 관련 규격: —
- 요약: 충전계·IBS/BMS·발전기·배터리 상태를 함께 확인합니다.
- 본문:

충전계·IBS/BMS·발전기·배터리 상태를 함께 확인합니다.
경고등 지속 시 주행 중 정차 위험이 있습니다.

- thumbnailType: symptom
- 원본 파일: src/data/diagnosis/symptom-rules.json
- 공개 경로: /diagnosis/battery-warning-light
- 메모: —

---

### symptom-blackbox-drain
- 제목: 블랙박스 방전
- 상태: 게시중
- 카테고리: 증상진단
- 태그: blackbox-drain, 48시간 내
- 관련 차량: —
- 관련 배터리: AGM95L, AGM80L
- 관련 규격: AGM95L, AGM80L
- 요약: 대기전류, 컷오프 전압, 주차녹화 패턴을 점검합니다.
- 본문:

대기전류, 컷오프 전압, 주차녹화 패턴을 점검합니다.

- thumbnailType: symptom
- 원본 파일: src/data/diagnosis/symptom-rules.json
- 공개 경로: /diagnosis/blackbox-drain
- 메모: —

---

### symptom-slow-engine-start
- 제목: 시동 늦게 걸림
- 상태: 게시중
- 카테고리: 증상진단
- 태그: slow-engine-start, 7일 내
- 관련 차량: —
- 관련 배터리: AGM80L, AGM60L
- 관련 규격: AGM80L, AGM60L
- 요약: CCA 저하, SOH 감소, 단거리 충전 부족 가능성을 확인합니다.
- 본문:

CCA 저하, SOH 감소, 단거리 충전 부족 가능성을 확인합니다.
반복 시동 지연은 갑작스런 방전으로 이어질 수 있습니다.

- thumbnailType: symptom
- 원본 파일: src/data/diagnosis/symptom-rules.json
- 공개 경로: /diagnosis/slow-engine-start
- 메모: —

---

### symptom-agm-replacement
- 제목: AGM 교체 필요
- 상태: 게시중
- 카테고리: 증상진단
- 태그: agm-replacement, 7일 내
- 관련 차량: —
- 관련 배터리: —
- 관련 규격: —
- 요약: AGM 호환, ISG 차량, BMS 초기화 필요성을 확인합니다.
- 본문:

AGM 호환, ISG 차량, BMS 초기화 필요성을 확인합니다.

- thumbnailType: symptom
- 원본 파일: src/data/diagnosis/symptom-rules.json
- 공개 경로: /diagnosis/agm-replacement
- 메모: —

---

### symptom-ev12v-discharge
- 제목: EV 12V 배터리 문제
- 상태: 게시중
- 카테고리: 증상진단
- 태그: ev12v-discharge, 48시간 내
- 관련 차량: —
- 관련 배터리: EV 12V
- 관련 규격: EV 12V
- 요약: 전기차 보조배터리 SOH, 대기전류, 충전 이벤트를 확인합니다.
- 본문:

전기차 보조배터리 SOH, 대기전류, 충전 이벤트를 확인합니다.

- thumbnailType: symptom
- 원본 파일: src/data/diagnosis/symptom-rules.json
- 공개 경로: /diagnosis/ev12v-discharge
- 메모: —

---

### symptom-ibs-bms-error
- 제목: IBS/BMS 오류
- 상태: 게시중
- 카테고리: 증상진단
- 태그: ibs-bms-error, 즉시
- 관련 차량: —
- 관련 배터리: —
- 관련 규격: —
- 요약: IBS 센서 오차, BMS 등록 누락, 충전 제어 오류를 확인합니다.
- 본문:

IBS 센서 오차, BMS 등록 누락, 충전 제어 오류를 확인합니다.
경고등·충전 제어 오류는 배터리만 교체해도 해결되지 않을 수 있습니다.

- thumbnailType: symptom
- 원본 파일: src/data/diagnosis/symptom-rules.json
- 공개 경로: /diagnosis/ibs-bms-error
- 메모: —

---


## 사진분석

### photo-analysis-disclaimer
- 제목: 사진 분석 보조 안내
- 상태: 게시중
- 카테고리: 사진분석
- 태그: 사진, 라벨, 단자, 보조안내
- 관련 차량: —
- 관련 배터리: —
- 관련 규격: —
- 요약: 현재 사진 분석 결과는 규격 확인을 돕기 위한 예시/보조 정보입니다. 최종 확인은 차량 정보와 현재 장착 배터리 사진을 함께 보는 것이 가장 정확합니다.
- 본문:

현재 사진 분석 결과는 규격 확인을 돕기 위한 예시/보조 정보입니다. 최종 확인은 차량 정보와 현재 장착 배터리 사진을 함께 보는 것이 가장 정확합니다.

- thumbnailType: photo_analysis
- 원본 파일: src/data/common/fallback.ts
- 공개 경로: /analysis/photo
- 메모: 사진분석 페이지 보조 안내

---

### admin-photo-guide-001
- 제목: 배터리 라벨·단자 사진 촬영 안내
- 상태: 게시중
- 카테고리: 사진분석
- 태그: 사진, 라벨, 단자, L/R
- 관련 차량: —
- 관련 배터리: AGM80L, DIN74L
- 관련 규격: AGM80L, DIN74L
- 요약: 규격 코드와 L/R 단자 방향을 함께 확인하는 촬영 방법입니다.
- 본문:

라벨 전체, 단자 방향, 제조 주·월 각인, 정면 전체 4가지 각도를 촬영합니다. 최종 확인은 차량 정보와 함께 봅니다.

- thumbnailType: photo_analysis
- 원본 파일: src/data/admin/adminContent.sample.json
- 공개 경로: /analysis/photo
- 메모: 사진분석 페이지 안내용

---


## 오주문 방지

### wrong-spec
- 제목: 오주문 많은 규격
- 상태: 게시중
- 카테고리: 오주문 방지
- 태그: AGM80L, DIN74L, 오주문
- 관련 차량: grandeur-ig
- 관련 배터리: AGM80L, DIN74L
- 관련 규격: AGM80L, DIN74L
- 요약: AGM80L↔DIN74L
- 본문:

크기가 비슷해도 AGM과 DIN은 충방전 특성이 다릅니다. ISG 차량에서 DIN 교체는 비권장입니다.

- thumbnailType: caution
- 원본 파일: src/data/content/hub-guides.json
- 공개 경로: /guide/spec?guide=wrong-spec
- 메모: —

---

### terminal-lr
- 제목: L/R 단자 방향
- 상태: 게시중
- 카테고리: 오주문 방지
- 태그: 단자, L/R, 오주문
- 관련 차량: —
- 관련 배터리: AGM80L, AGM60L
- 관련 규격: AGM80L, AGM60L
- 요약: 오주문 최다 항목
- 본문:

플러스/마이너스 단자 위치(L/R)가 다르면 케이블 길이와 터미널 클램프가 맞지 않습니다. 교체 전 사진으로 확인하세요.

- thumbnailType: caution
- 원본 파일: src/data/content/hub-guides.json
- 공개 경로: /guide/spec?guide=terminal-lr
- 메모: —

---

### staria-agm80r-guide
- 제목: 스타리아 배터리는 AGM80R 단자 방향을 먼저 확인하세요
- 상태: 게시중
- 카테고리: 오주문 방지
- 태그: 스타리아, AGM80R, AGM80L, 단자방향, 디젤, LPG
- 관련 차량: staria-us4
- 관련 배터리: AGM80R, AGM80L
- 관련 규격: AGM80R, AGM80L
- 요약: 스타리아는 디젤과 LPG 모두 AGM80R 기준으로 확인하는 것이 안전합니다. 특히 L/R 단자 방향을 헷갈리면 오주문으로 이어질 수 있습니다.
- 본문:

스타리아는 AGM80R 기준으로 확인합니다
스타리아(US4)는 디젤이든 LPG든 12V 보조배터리는 AGM80R으로 확인하는 경우가 많습니다. "스타리아 배터리"라고만 검색하면 AGM80L이 같이 나와 헷갈리기 쉬운데, 스타리아는 R단자 쪽을 먼저 보시면 됩니다.

디젤과 LPG 모두 R단자 기준으로 봅니다
연료가 다르더라도 12V 규격이 같게 잡히는 경우가 많습니다. 다만 트림·옵션에 따라 예외가 있을 수 있으니, 사이트에서 연료 탭을 눌러 디젤/LPG 각각 카드를 확인해 보세요. 둘 다 AGM80R이면 더 확신을 가지셔도 됩니다.

AGM80L과 AGM80R은 같은 용량처럼 보여도 방향이 다릅니다
80이라는 숫자는 용량(Ah) 계열을 뜻하고, 뒤의 L/R은 플러스 단자 위치입니다. AGM80L을 R 차량에 넣으면 케이블 길이·클램프 각도가 안 맞아 작업이 어려워집니다. 매장에서 L/R 오주문은 정말 자주 나오는 실수입니다.

단자 방향이 틀리면 장착이 어려워질 수 있습니다
배터리를 뒤집거나 케이블을 억지로 당기면 단자·퓨즈박스 쪽에 무리가 갑니다. 교체 전에 기존 배터리 사진으로 +/- 위치를 확인하는 게 가장 안전합니다. 사진 확인 안내 기능도 이용해 보세요.

사이트에서는 스타리아 상세페이지에서 바로 AGM80R 카드가 보이게 구성합니다
Battery Manager 스타리아 페이지에서는 로케트·쏠라이트 AGM80R 이미지 카드와 연료별 안내를 함께 보여줍니다. 배터리 상세 페이지에서도 같은 규격으로 연결된 차량 목록을 확인할 수 있습니다.

- thumbnailType: caution
- 원본 파일: src/data/content/articles/staria-agm80r-guide.json
- 공개 경로: /guides/staria-agm80r-guide
- 메모: —

---

### admin-caution-001
- 제목: AGM80L과 DIN74L 오주문 방지
- 상태: 게시중
- 카테고리: 오주문 방지
- 태그: AGM80L, DIN74L, ISG, 오주문
- 관련 차량: grandeur-ig, k5-dl3
- 관련 배터리: AGM80L, DIN74L
- 관련 규격: AGM80L, DIN74L
- 요약: 크기가 비슷해도 ISG 차량은 AGM 규격 유지가 필요합니다.
- 본문:

그랜저 IG 등 ISG 차량에서 DIN74L로 내리면 충전 제어와 시동 성능에 문제가 생길 수 있습니다. 교체 전 연료·트림·현재 장착 배터리 사진을 확인하세요.

- thumbnailType: caution
- 원본 파일: src/data/admin/adminContent.sample.json
- 공개 경로: /guides/wrong-spec
- 메모: —

---


## 규격문의

### admin-spec-inquiry-001
- 제목: 연식·연료별 규격 문의 안내
- 상태: 게시중
- 카테고리: 규격문의
- 태그: 문의, 연식, 연료, 규격
- 관련 차량: —
- 관련 배터리: —
- 관련 규격: —
- 요약: 차량명과 연식, 연료, 현재 배터리 사진을 함께 보내 주세요.
- 본문:

동일 차종이라도 연식·연료·트림에 따라 규격이 달라질 수 있습니다. 문의 시 차량명, 연식, 연료, 현재 장착 배터리 사진을 함께 확인하면 정확도가 높아집니다.

- thumbnailType: spec_inquiry
- 원본 파일: src/data/admin/adminContent.sample.json
- 공개 경로: /ai
- 메모: 규격 문의 허브 연결 예정

---


## 쇼핑안내

### admin-shopping-001
- 제목: 배터리 쇼핑 가격·재고 안내
- 상태: 게시중
- 카테고리: 쇼핑안내
- 태그: 쇼핑, 가격, 재고, 문의
- 관련 차량: —
- 관련 배터리: AGM80L, AGM95L
- 관련 규격: AGM80L
- 요약: 일부 규격은 가격 문의 후 확인됩니다.
- 본문:

표시 가격이 없는 규격은 재고·지역·장착 조건에 따라 달라질 수 있습니다. 교체 전 차량 규격 확인과 작업 가능점 문의를 권장합니다.

- thumbnailType: shopping
- 원본 파일: src/data/admin/adminContent.sample.json
- 공개 경로: /shop
- 메모: —

---


## 브랜드가이드

### admin-brand-001
- 제목: 로케트·쏠라이트 규격 표기 차이
- 상태: 게시중
- 카테고리: 브랜드가이드
- 태그: 로케트, 쏠라이트, GB57820, CMF57412, DIN74L
- 관련 차량: grandeur-ig, k5-dl3
- 관련 배터리: DIN74L
- 관련 규격: DIN74L, GB57820, CMF57412
- 요약: 브랜드별 제품 코드와 표준 규격 매칭표를 확인합니다.
- 본문:

로케트 GB57820과 쏠라이트 CMF57412는 표준 규격 DIN74L에 해당합니다. 라벨 표기가 달라도 표준 규격으로 먼저 확인하세요.

- thumbnailType: brand
- 원본 파일: src/data/admin/adminContent.sample.json
- 공개 경로: /brands
- 메모: —

---


