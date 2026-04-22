import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}

const ROLE_OPTIONS = ["Admin", "Manager", "Support", "Editor", "Marketing"];

const Step3Team = ({ data, update }: Props) => {
  const roles = data.team_roles ?? [];
  const members = data.team_members ?? [];

  const toggleRole = (role: string) => {
    update({
      team_roles: roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role],
    });
  };

  const addMember = () => update({ team_members: [...members, { name: "", role: "" }] });
  const updateMember = (i: number, patch: Partial<{ name: string; role: string }>) => {
    const next = [...members];
    next[i] = { ...next[i], ...patch };
    update({ team_members: next });
  };
  const removeMember = (i: number) => update({ team_members: members.filter((_, idx) => idx !== i) });

  return (
    <StepShell title="Your team" subtitle="Optional — helps us configure roles and access correctly.">
      <div className="space-y-2">
        <Label htmlFor="team_size">Number of team members</Label>
        <Input
          id="team_size"
          type="number"
          min={0}
          value={data.team_size ?? ""}
          onChange={(e) => update({ team_size: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="e.g. 4"
        />
      </div>

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
          <Button type="button" variant="outline" size="sm" onClick={addMember}>
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
            <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(i)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </StepShell>
  );
};

export default Step3Team;
