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
import { Plus, Pencil, Trash2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type PlanType = Database["public"]["Enums"]["plan_type"];

interface PlanForm {
  id?: string;
  name: string;
  type: PlanType;
  price_pkr: number;
  max_products: number;
  max_categories: number;
  max_pages: number;
  domain_type: string;
  platform_type: string;
  email_accounts: number;
  team_users: number;
  duration_days: number | null;
  features: string[];
  is_active: boolean;
}

const emptyForm: PlanForm = {
  name: "", type: "free", price_pkr: 0, max_products: 10, max_categories: 5,
  max_pages: 5, domain_type: "subdomain", platform_type: "wordpress",
  email_accounts: 0, team_users: 1,
  duration_days: null, features: [], is_active: true,
};

const AdminPlanManagement = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [featureInput, setFeatureInput] = useState("");

  const { data: plans, isLoading } = useQuery({
    queryKey: ["admin_plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("*").order("type").order("price_pkr");
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async (p: PlanForm) => {
      const payload = {
        name: p.name,
        type: p.type,
        price_pkr: p.price_pkr,
        max_products: p.max_products,
        max_categories: p.max_categories,
        max_pages: p.max_pages,
        domain_type: p.domain_type,
        platform_type: p.platform_type,
        email_accounts: p.email_accounts,
        team_users: p.team_users,
        duration_days: p.duration_days,
        features: p.features,
        is_active: p.is_active,
      };
      if (p.id) {
        const { error } = await supabase.from("plans").update(payload).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("plans").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_plans"] });
      toast.success(form.id ? "Plan updated" : "Plan created");
      closeDialog();
    },
    onError: () => toast.error("Failed to save plan"),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_plans"] });
      toast.success("Plan deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const closeDialog = () => { setOpen(false); setForm(emptyForm); setFeatureInput(""); };

  const openEdit = (p: any) => {
    setForm({
      id: p.id, name: p.name, type: p.type, price_pkr: p.price_pkr,
      max_products: p.max_products, max_categories: p.max_categories,
      duration_days: p.duration_days, features: Array.isArray(p.features) ? p.features : [],
      is_active: p.is_active,
    });
    setOpen(true);
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setForm((f) => ({ ...f, features: [...f.features, featureInput.trim()] }));
      setFeatureInput("");
    }
  };

  const removeFeature = (idx: number) => {
    setForm((f) => ({ ...f, features: f.features.filter((_, i) => i !== idx) }));
  };

  if (isLoading) return <div className="text-muted-foreground p-4">Loading plans...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">{plans?.length ?? 0} Plans</span>
        </div>
        <Button onClick={() => { setForm(emptyForm); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Plan
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price (PKR)</TableHead>
                <TableHead>Limits</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant="secondary">{p.type}</Badge></TableCell>
                  <TableCell>{p.price_pkr.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.max_products} products · {p.max_categories} categories
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.duration_days ? `${p.duration_days} days` : "Lifetime"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? "default" : "outline"}>
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMut.mutate(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!plans || plans.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No plans yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Plan" : "Add Plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as PlanType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="buy">Buy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Price (PKR)</Label>
                <Input type="number" value={form.price_pkr} onChange={(e) => setForm((f) => ({ ...f, price_pkr: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>Max Products</Label>
                <Input type="number" value={form.max_products} onChange={(e) => setForm((f) => ({ ...f, max_products: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>Max Categories</Label>
                <Input type="number" value={form.max_categories} onChange={(e) => setForm((f) => ({ ...f, max_categories: Number(e.target.value) }))} />
              </div>
            </div>

            <div>
              <Label>Duration (days, leave empty for lifetime)</Label>
              <Input type="number" value={form.duration_days ?? ""} onChange={(e) => setForm((f) => ({ ...f, duration_days: e.target.value ? Number(e.target.value) : null }))} />
            </div>

            <div>
              <Label>Features</Label>
              <div className="flex gap-2 mt-1">
                <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="Add feature"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }} />
                <Button type="button" size="sm" variant="outline" onClick={addFeature}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {form.features.map((f, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeFeature(i)}>
                    {f} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button disabled={!form.name || upsert.isPending} onClick={() => upsert.mutate(form)}>
              {upsert.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPlanManagement;
