import { TableSkeleton } from "@/components/ui/loading-skeletons";
import { useState } from "react";
import { useAllIntegrations, useUpsertIntegration, useDeleteIntegration } from "@/hooks/useMarketplace";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Plug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from "./ImageUploader";

const empty = { name: "", slug: "", description: "", icon: "", category: "", price_pkr: 0, pricing_type: "one_time", credential_schema: "[]", is_enabled: true, is_popular: false, sort_order: 0 };

export default function AdminIntegrations() {
  const { data = [], isLoading } = useAllIntegrations();
  const upsert = useUpsertIntegration();
  const del = useDeleteIntegration();
  const { toast } = useToast();
  const [editing, setEditing] = useState<any | null>(null);

  const save = async () => {
    try {
      const payload = { ...editing };
      if (typeof payload.credential_schema === "string") {
        try { payload.credential_schema = JSON.parse(payload.credential_schema || "[]"); }
        catch { toast({ title: "Invalid credential schema JSON", variant: "destructive" }); return; }
      }
      await upsert.mutateAsync(payload);
      toast({ title: "Saved" });
      setEditing(null);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display">Integrations</h2>
          <p className="text-sm text-muted-foreground">WhatsApp button, mailbox forms, analytics, etc.</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4 mr-2" /> New</Button>
      </div>

      {isLoading ? <TableSkeleton columns={4} rows={5} /> : (
        <div className="grid gap-3">
          {data.map((i: any) => (
            <Card key={i.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {i.icon ? <img src={i.icon} alt="" className="w-10 h-10 rounded" /> : <Plug className="w-8 h-8 text-muted-foreground" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{i.name}</p>
                      {i.is_popular && <Badge className="text-xs">Popular</Badge>}
                      {!i.is_enabled && <Badge variant="secondary" className="text-xs">Disabled</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">PKR {i.price_pkr.toLocaleString()} • {i.pricing_type === "monthly" ? "monthly" : "one-time"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing({ ...i, credential_schema: JSON.stringify(i.credential_schema, null, 2) })}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Delete this integration?")) del.mutate(i.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} Integration</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="space-y-1"><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-1"><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
              <div className="space-y-1">
                <Label>Icon</Label>
                <ImageUploader
                  value={editing.icon ?? ""}
                  onChange={(url) => setEditing({ ...editing, icon: url })}
                  folder="integrations"
                  aspect="square"
                  label="Icon"
                />
              </div>
              <div className="space-y-1"><Label>Description</Label><Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Price (PKR)</Label><Input type="number" value={editing.price_pkr} onChange={(e) => setEditing({ ...editing, price_pkr: +e.target.value })} /></div>
                <div className="space-y-1">
                  <Label>Pricing Type</Label>
                  <Select value={editing.pricing_type} onValueChange={(v) => setEditing({ ...editing, pricing_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One-time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Credential Schema (JSON array)</Label>
                <Textarea rows={5} className="font-mono text-xs" value={editing.credential_schema} onChange={(e) => setEditing({ ...editing, credential_schema: e.target.value })} placeholder='[{"key":"phone","label":"WhatsApp number","placeholder":"+923..."}]' />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2"><Switch checked={editing.is_enabled} onCheckedChange={(v) => setEditing({ ...editing, is_enabled: v })} /> Enabled</label>
                <label className="flex items-center gap-2"><Switch checked={editing.is_popular} onCheckedChange={(v) => setEditing({ ...editing, is_popular: v })} /> Popular</label>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
