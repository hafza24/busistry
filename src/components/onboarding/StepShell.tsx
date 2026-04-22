import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const StepShell = ({ title, subtitle, children }: Props) => (
  <div className="space-y-6">
    <div className="space-y-1.5">
      <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-tight">{title}</h2>
      {subtitle && <p className="text-muted-foreground text-sm md:text-base">{subtitle}</p>}
    </div>
    <div className="space-y-5">{children}</div>
  </div>
);

export default StepShell;
