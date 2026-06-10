type Props = {
  title: string;
  description: string;
};

export function CheckoutAddressPurposeBanner({ title, description }: Props) {
  return (
    <div className="checkout-address-purpose-banner" role="note">
      <p className="checkout-address-purpose-banner__title">{title}</p>
      <p className="checkout-address-purpose-banner__desc">{description}</p>
    </div>
  );
}
