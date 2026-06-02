import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Sparkles, GripVertical } from "lucide-react";
import { toast } from "sonner";

type PlanScope = "free" | "rent" | "buy";
type PricingType = "one_time" | "monthly";

interface AddonForm {
  id?: string;
  name: string;
  description: string;
  price_pkr: number;
  pricing_type: PricingType;
  is_enabled: boolean;
  is_recommended: boolean;
  is_popular: boolean;
  sort_order: number;
  icon: string;
  applicable_plans: PlanScope[];
  per_unit_label: string;
}

const emptyForm: AddonForm = {
  name: "",
  description: "",
  price_pkr: 0,
  pricing_type: "one_time",
  is_enabled: true,
  is_recommended: false,
  is_popular: false,
  sort_order: 0,
  icon: "Sparkles",
  applicable_plans: ["free", "rent", "buy"],
  per_unit_label: "",
};

const ALL_PLANS: PlanScope[] = ["free", "rent", "buy"];

const AdminAddonManagement = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AddonForm>(emptyForm);

  const { data: addons, isLoading } = useQuery({
    queryKey: ["admin_addons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addons")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async (p: AddonForm) => {
      const payload = {
        name: p.name,
        description: p.description || null,
        price_pkr: p.price_pkr,
        pricing_type: p.pricing_type,
        is_enabled: p.is_enabled,
        is_recommended: p.is_recommended,
        is_popular: p.is_popular,
        sort_order: p.sort_order,
        icon: p.icon || null,
        applicable_plans: p.applicable_plans,
        per_unit_label: p.per_unit_label || null,
      };
      if (p.id) {
        const { error } = await supabase.from("addons").update(payload).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("addons").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_addons"] });
      qc.invalidateQueries({ queryKey: ["public_addons"] });
      toast.success(form.id ? "Add-on updated" : "Add-on created");
      closeDialog();
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to save add-on"),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_addons"] });
      qc.invalidateQueries({ queryKey: ["public_addons"] });
      toast.success("Add-on deleted");
    },
    onError: () => toast.error("Failed to delete (it may be in use by an order)"),
  });

  const togglePlan = (plan: PlanScope) => {
    setForm((f) => ({
      ...f,
      applicable_plans: f.applicable_plans.includes(plan)
        ? f.applicable_plans.filter((p) => p !== plan)
        : [...f.applicable_plans, plan],
    }));
  };

  const closeDialog = () => {
    setOpen(false);
    setForm(emptyForm);
  };

  const openEdit = (a: any) => {
    setForm({
      id: a.id,
      name: a.name,
      description: a.description ?? "",
      price_pkr: a.price_pkr,
      pricing_type: a.pricing_type,
      is_enabled: a.is_enabled,
      is_recommended: a.is_recommended,
      is_popular: a.is_popular,
      sort_order: a.sort_order,
      icon: a.icon ?? "Sparkles",
      applicable_plans: Array.isArray(a.applicable_plans) ? (a.applicable_plans as PlanScope[]) : ["free", "rent", "buy"],
      per_unit_label: a.per_unit_label ?? "",
    });
    setOpen(true);
  };

  if (isLoading) return <TableSkeleton columns={6} rows={6} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">{addons?.length ?? 0} Add-ons</span>
        </div>
        <Button onClick={() => { setForm(emptyForm); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Add-on
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Plans</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addons?.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{a.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 max-w-sm">{a.description}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    PKR {a.price_pkr.toLocaleString()}
                    {a.per_unit_label && <span className="text-muted-foreground"> / {a.per_unit_label}</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {a.pricing_type === "monthly" ? "Monthly" : "One-time"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(a.applicable_plans as string[]).map((p) => (
                        <Badge key={p} variant="secondary" className="text-[10px] capitalize">{p}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {a.is_recommended && <Badge className="text-[10px] bg-primary/15 text-primary hover:bg-primary/15">Recommended</Badge>}
                      {a.is_popular && <Badge className="text-[10px] bg-accent text-accent-foreground hover:bg-accent">Popular</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.is_enabled ? "default" : "outline"}>
                      {a.is_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(a)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm(`Delete "${a.name}"?`)) deleteMut.mutate(a.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!addons || addons.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No add-ons yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Add-on" : "Add Add-on"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>

            <div>
              <Label>Short benefit description</Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Boost your Google ranking with on-page SEO tuning."
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Price (PKR) *</Label>
                <Input
                  type="number"
                  value={form.price_pkr}
                  onChange={(e) => setForm((f) => ({ ...f, price_pkr: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Pricing</Label>
                <Select
                  value={form.pricing_type}
                  onValueChange={(v) => setForm((f) => ({ ...f, pricing_type: v as PricingType }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One-time</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label>Per-unit label (optional)</Label>
              <Input
                value={form.per_unit_label}
                placeholder="e.g. per page, per language"
                onChange={(e) => setForm((f) => ({ ...f, per_unit_label: e.target.value }))}
              />
              <p className="text-[11px] text-muted-foreground mt-1">If set, users can choose a quantity.</p>
            </div>

            <div>
              <Label>Available on plans</Label>
              <div className="flex gap-2 mt-1">
                {ALL_PLANS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlan(p)}
                    className={`px-3 py-1.5 rounded-md text-sm capitalize border transition-colors ${
                      form.applicable_plans.includes(p)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-foreground/30"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Lucide icon name</Label>
              <Input
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="e.g. Sparkles, Star, Zap"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch
                  checked={form.is_enabled}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_enabled: v }))}
                />
                Enabled
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch
                  checked={form.is_recommended}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_recommended: v }))}
                />
                Recommended
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch
                  checked={form.is_popular}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_popular: v }))}
                />
                Popular
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button disabled={!form.name || upsert.isPending} onClick={() => upsert.mutate(form)}>
              {upsert.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAddonManagement;
