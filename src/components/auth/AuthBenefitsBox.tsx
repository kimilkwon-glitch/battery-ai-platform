type Props = {
  variant?: "login" | "signup";
};

export function AuthBenefitsBox({ variant = "login" }: Props) {
  return (
    <div className="bm-auth-benefits" role="note">
      <p className="bm-auth-benefits__title">회원 혜택</p>
      <ul className="bm-auth-benefits__list">
        <li>첫 주문 3% 혜택 자동 적용</li>
        <li>
          {variant === "signup"
            ? "차량 정보 저장 시 다음 주문·상담이 더 빨라집니다"
            : "차량 정보 저장 시 다음 주문이 더 빨라집니다"}
        </li>
        {variant === "signup" ? (
          <li>주문 내역과 배터리 교체 이력을 한곳에서 확인</li>
        ) : null}
      </ul>
    </div>
  );
}
