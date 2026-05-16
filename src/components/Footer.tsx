import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-secondary/30">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground mb-3">Busistree<span className="text-primary">.</span></h3>
          <p className="text-sm text-muted-foreground">
            A digital studio building brands, websites, and growth systems for ambitious businesses.
          </p>
        </div>
        <div>
          <h4 className="font-semibold font-display mb-3 text-foreground">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/templates" className="hover:text-foreground transition-colors">Templates</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            <li><Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold font-display mb-3 text-foreground">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold font-display mb-3 text-foreground">Payment Methods</h4>
          <p className="text-sm text-muted-foreground">Easypaisa • JazzCash • NayaPay • Raast • Bank Transfer</p>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Busistree. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
