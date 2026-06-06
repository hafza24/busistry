import LegalLayout from "./LegalLayout";

const Refund = () => (
  <LegalLayout
    title="Refund Policy"
    description="When and how Busistree issues PKR refunds via JazzCash, Easypaisa, and bank transfer."
    path="/legal/refund"
    updated="June 2026"
  >
    <p>
      We want you to feel confident ordering from Busistree. This Refund Policy outlines when refunds apply,
      and how they are processed in Pakistan.
    </p>

    <h2>1. 7-Day Money-Back Guarantee</h2>
    <p>
      You may request a full refund within 7 days of payment if:
    </p>
    <ul>
      <li>We have not yet started building your website/store, or</li>
      <li>The delivered website does not match the agreed scope and we cannot resolve it.</li>
    </ul>

    <h2>2. Non-Refundable Cases</h2>
    <ul>
      <li>Custom design work that has already been completed and delivered.</li>
      <li>Third-party costs already paid on your behalf (domains, paid plugins, paid integrations).</li>
      <li>Add-ons or services explicitly marked as non-refundable at checkout.</li>
      <li>Refund requests made more than 7 days after payment.</li>
    </ul>

    <h2>3. How to Request a Refund</h2>
    <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
      <li>Email <a className="text-primary underline" href="mailto:hello@busistree.com">hello@busistree.com</a> with your order ID and reason.</li>
      <li>Our team reviews within 2 business days.</li>
      <li>If approved, the refund is processed within 5–7 business days.</li>
    </ol>

    <h2>4. Refund Channels</h2>
    <p>
      Refunds are issued in PKR to the original payment channel where possible (JazzCash, Easypaisa, NayaPay, Raast).
      If the original channel cannot accept incoming transfers, we will refund to a bank account you nominate.
    </p>

    <h2>5. Contact</h2>
    <p>
      Questions? Reach us at <a className="text-primary underline" href="mailto:hello@busistree.com">hello@busistree.com</a>.
    </p>
  </LegalLayout>
);

export default Refund;
