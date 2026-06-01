import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X, Lock } from "lucide-react";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";
import { usePlan } from "@/hooks/usePlan";
import LockedTile from "./LockedTile";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}

const ROLE_OPTIONS = ["Admin", "Manager", "Support", "Editor", "Marketing"];

const Step3Team = ({ data, update }: Props) => {
  const { data: plan } = usePlan(data.plan_id);
  const seatLimit = plan?.team_users ?? 1;
  const roles = data.team_roles ?? [];
  const members = data.team_members ?? [];

  const toggleRole = (role: string) => {
    update({
      team_roles: roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role],
    });
  };

  const addMember = () => {
    if (members.length >= seatLimit - 1) return; // first seat is the owner
    update({ team_members: [...members, { name: "", role: "" }] });
  };
  const updateMember = (i: number, patch: Partial<{ name: string; role: string }>) => {
    const next = [...members];
    next[i] = { ...next[i], ...patch };
    update({ team_members: next });
  };
  const removeMember = (i: number) => update({ team_members: members.filter((_, idx) => idx !== i) });

  const soloPlan = seatLimit <= 1;

  return (
    <StepShell title="Your team" subtitle="Add the people who'll manage the store.">
      <div className="grid grid-cols-2 gap-2">
        <LockedTile
          label="Team seats"
          value={`${seatLimit}`}
          hint={soloPlan ? "Single-user plan" : `${plan?.name ?? "Plan"} included`}
        />
        <LockedTile label="Used" value={`${members.length + 1} / ${seatLimit}`} hint="You count as 1 seat" />
      </div>

      {soloPlan ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground flex items-start gap-2">
          <Lock className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            Your plan includes <strong>1 admin seat</strong>. Upgrade your plan or buy additional seats from the
            marketplace to add team members.
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Team roles needed</Label>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => {
                const active = roles.includes(role);
                return (
                  <button
                    type="button"
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Team member details (optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMember}
                disabled={members.length >= seatLimit - 1}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {members.length === 0 && (
              <p className="text-sm text-muted-foreground">No members added yet.</p>
            )}
            {members.map((m, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Input
                  placeholder="Full name"
                  value={m.name}
                  onChange={(e) => updateMember(i, { name: e.target.value })}
                />
                <Input
                  placeholder="Role"
                  value={m.role}
                  onChange={(e) => updateMember(i, { role: e.target.value })}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(i)} aria-label="Remove team member">
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </StepShell>
  );
};

export default Step3Team;
