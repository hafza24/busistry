import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PublicLayout = () => (
  <div className="min-h-screen flex flex-col relative">
    {/* Soft blurred ambient background (matches hero) */}
    <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)/0.4))]" />
    <div className="fixed -top-24 -left-32 -z-10 h-[560px] w-[560px] rounded-full bg-primary/25 blur-[120px]" />
    <div className="fixed top-32 -right-24 -z-10 h-[480px] w-[480px] rounded-full bg-accent/25 blur-[120px]" />
    <div className="fixed bottom-0 left-1/3 -z-10 h-[380px] w-[380px] rounded-full bg-primary-glow/20 blur-[120px]" />

    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default PublicLayout;
