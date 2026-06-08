type Props = {
  variant?: "login" | "signup";
};

export function AuthBenefitsBox({ variant = "login" }: Props) {
  return (
    <div className="bm-auth-benefits" role="note">
      <p className="bm-auth-benefits__title">
        {variant === "login" ? "로그인 혜택" : "회원 혜택"}
      </p>
      <ul className="bm-auth-benefits__list">
        <li>주문서에 이름·연락처·주소 자동 입력</li>
        <li>저장한 차량정보로 배터리 확인</li>
        <li>주문내역과 배송·장착 진행상태 확인</li>
        <li>다음 주문 시 더 빠르게 주문 가능</li>
      </ul>
    </div>
  );
}
