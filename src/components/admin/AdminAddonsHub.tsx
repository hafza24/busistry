import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminAddonManagement from "./AdminAddonManagement";
import AdminIntegrations from "./AdminIntegrations";
import AdminWebsiteProducts from "./AdminWebsiteProducts";

export default function AdminAddonsHub() {
  return (
    <Tabs defaultValue="addons" className="space-y-4">
      <TabsList>
        <TabsTrigger value="addons">Add-ons</TabsTrigger>
        <TabsTrigger value="website_products">Website Products</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
      </TabsList>
      <TabsContent value="addons"><AdminAddonManagement /></TabsContent>
      <TabsContent value="website_products"><AdminWebsiteProducts /></TabsContent>
      <TabsContent value="integrations"><AdminIntegrations /></TabsContent>
    </Tabs>
  );
}
