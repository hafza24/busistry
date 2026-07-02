import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminAddonManagement from "./AdminAddonManagement";
import AdminIntegrations from "./AdminIntegrations";

export default function AdminAddonsHub() {
  return (
    <Tabs defaultValue="addons" className="space-y-4">
      <TabsList>
        <TabsTrigger value="addons">Add-ons</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
      </TabsList>
      <TabsContent value="addons"><AdminAddonManagement /></TabsContent>
      <TabsContent value="integrations"><AdminIntegrations /></TabsContent>
    </Tabs>
  );
}
