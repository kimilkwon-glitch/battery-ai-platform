/** 고객센터 공지 초기 seed — store 최초 생성 시 사용 */

export type SupportNoticeSeedItem = {
  id: string;
  title: string;
  date: string;
  important?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  bodyHtml: string;
};

export const SUPPORT_NOTICES_SEED: SupportNoticeSeedItem[] = [
  {
    id: "card-installment-202605",
    title: "2026년 5월 신용카드 무이자 할부 안내",
    date: "2026.05.28",
    important: true,
    imageSrc: "/assets/notices/card-installment-202605.png",
    imageAlt: "2026년 5월 신용카드 무이자 할부 안내",
    bodyHtml: `
      <p>2026년 5월 신용카드 무이자 할부 혜택을 안내드립니다. 카드사·조건별 적용 여부는 결제 전 확인해 주세요.</p>
      <table>
        <thead><tr><th>카드사</th><th>할부</th><th>비고</th></tr></thead>
        <tbody>
          <tr><td>예시 카드</td><td>2~3개월</td><td>조건 확인 필요</td></tr>
        </tbody>
      </table>
      <p class="text-sm text-slate-500">※ 실제 무이자 조건은 카드사 정책에 따르며, 주문 상담 시 최종 안내드립니다.</p>
    `,
  },
  {
    id: "holiday-20260525",
    title: "5월 25일 석가탄신일 대체공휴일 휴무 안내",
    date: "2026.05.22",
    important: true,
    bodyHtml: `<p>5월 25일(일) 석가탄신일 대체공휴일에는 덕천점·학장점 모두 휴무입니다. 긴급 문의는 다음 영업일에 순차 안내드립니다.</p>`,
  },
  {
    id: "holiday-20260505",
    title: "5월 5일 어린이날 휴무 안내",
    date: "2026.05.05",
    bodyHtml: `<p>5월 5일 어린이날 휴무입니다. 택배 발송·출장 일정은 전후 영업일 기준으로 조정될 수 있습니다.</p>`,
  },
  {
    id: "delivery-check",
    title: "배터리 택배 주문 전 확인 안내",
    date: "2026.05.02",
    bodyHtml: `<p>택배 주문 전 차종·연식·규격명·L/R 단자·ISG 여부를 확인해 주세요. <a href="/order-checklist">주문 전 체크리스트</a>를 참고하시면 오주문을 줄일 수 있습니다.</p>`,
  },
  {
    id: "battery-return",
    title: "폐배터리 반납/미반납 안내",
    date: "2026.04.30",
    bodyHtml: `<p>택배 주문 시 폐배터리 반납·미반납 옵션을 선택할 수 있습니다. 반납 선택 시 회수 일정을 별도 안내드립니다. 가격 정책은 상담 시 안내드립니다.</p>`,
  },
  {
    id: "store-regions",
    title: "덕천점·학장점 출장 권역 안내",
    date: "2026.04.28",
    bodyHtml: `<p>북구·금정·연제권은 덕천점, 사상·사하·강서·명지권은 학장점 기준으로 출장·내방을 안내합니다. <a href="/service-center">매장·출장 안내</a>에서 권역 지도를 확인하세요.</p>`,
  },
];
