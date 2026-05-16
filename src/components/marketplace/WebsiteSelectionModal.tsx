import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, AlertTriangle, ArrowRight } from "lucide-react";
import { useStores } from "@/hooks/useStores";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Called with the chosen store id when user confirms */
  onConfirm: (storeId: string) => void;
  itemName?: string;
}

/**
 * Enforces the rule: every marketplace purchase must be linked to a website.
 * - Case A: user has 1+ active websites → dropdown + "Create new" option
 * - Case B: user has none → blocking screen pushing them to create one
 */
export default function WebsiteSelectionModal({ open, onOpenChange, onConfirm, itemName }: Props) {
  const navigate = useNavigate();
  const { data: stores, isLoading } = useStores();
  const activeStores = (stores ?? []).filter((s: any) => s.status === "activated" || s.status === "approved");
  const hasNone = !isLoading && activeStores.length === 0;

  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    if (open && activeStores.length === 1) setSelected(activeStores[0].id);
  }, [open, activeStores]);

  // CASE B — blocking modal
  if (hasNone) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <DialogTitle className="text-center text-2xl">You Need a Website First</DialogTitle>
            <DialogDescription className="text-center">
              To purchase marketplace products, you must create or own a website project. Every order is linked to a website.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <Button size="lg" onClick={() => { onOpenChange(false); navigate("/templates"); }}>
              <Plus className="h-4 w-4 mr-2" /> Create New Website
            </Button>
            <Button variant="outline" size="lg" onClick={() => { onOpenChange(false); navigate("/pricing"); }}>
              See Website Plans <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // CASE A — selection modal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> Select Website for This Order</DialogTitle>
          <DialogDescription>
            {itemName ? <>"{itemName}" will be installed on the website you pick.</> : "Choose which website this order applies to."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label>Your websites</Label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger><SelectValue placeholder="Choose a website" /></SelectTrigger>
            <SelectContent>
              {activeStores.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex items-center gap-2">
                    <span>{s.name}</span>
                    {s.plans?.name && <Badge variant="secondary" className="text-xs">{s.plans.name}</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => { onOpenChange(false); navigate("/templates"); }}
          >
            <Plus className="h-4 w-4 mr-2" /> Create New Website
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!selected} onClick={() => { onConfirm(selected); onOpenChange(false); }}>
            Continue <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
