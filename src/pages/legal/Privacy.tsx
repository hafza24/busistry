import LegalLayout from "./LegalLayout";

const Privacy = () => (
  <LegalLayout
    title="Privacy Policy"
    description="How Busistree collects, uses, and protects your personal information in Pakistan."
    path="/legal/privacy"
    updated="June 2026"
  >
    <p>
      Busistree ("we", "us", "our") respects your privacy. This Privacy Policy explains how we collect,
      use, store, and share information when you use our website-building and store management platform
      in Pakistan.
    </p>

    <h2>1. Information We Collect</h2>
    <ul>
      <li><strong>Account information:</strong> name, email, phone (WhatsApp), business name.</li>
      <li><strong>Order &amp; payment information:</strong> selected plan, billing details, transaction ID, screenshot of mobile-wallet payment (JazzCash, Easypaisa, NayaPay, Raast, bank transfer).</li>
      <li><strong>Store content:</strong> products, categories, images, branding assets you upload.</li>
      <li><strong>Technical data:</strong> IP address, browser, device, pages visited.</li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <ul>
      <li>To deliver and verify your website/store order.</li>
      <li>To communicate about your order, support tickets, and product updates.</li>
      <li>To prevent fraud and comply with Pakistani law.</li>
      <li>To improve our platform and services.</li>
    </ul>

    <h2>3. Sharing Your Information</h2>
    <p>We do not sell your personal data. We share it only with:</p>
    <ul>
      <li>Service providers (hosting, email, storage) bound by confidentiality.</li>
      <li>Payment verification staff at Busistree.</li>
      <li>Law enforcement when required by a lawful Pakistani court order.</li>
    </ul>

    <h2>4. Data Storage &amp; Security</h2>
    <p>
      Data is stored on secure cloud infrastructure with industry-standard encryption in transit and at rest.
      Payment screenshots are stored in a private, access-controlled bucket and viewable only by authorized staff.
    </p>

    <h2>5. Your Rights</h2>
    <ul>
      <li>Request a copy of your personal data.</li>
      <li>Request correction or deletion of your data.</li>
      <li>Withdraw consent at any time (may affect service delivery).</li>
    </ul>

    <h2>6. Contact</h2>
    <p>
      For any privacy question, contact us at <a className="text-primary underline" href="mailto:hello@busistree.com">hello@busistree.com</a>.
    </p>
  </LegalLayout>
);

export default Privacy;
