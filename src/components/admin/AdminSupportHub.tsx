import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdminHelpCenter from "./AdminHelpCenter";
import AdminSupportChat from "./AdminSupportChat";
import AdminContactMessages from "./AdminContactMessages";

const AdminSupportHub = () => {
  const [tab, setTab] = useState("chat");
  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="chat">Live Chat</TabsTrigger>
        <TabsTrigger value="inbox">Contact Inbox</TabsTrigger>
        <TabsTrigger value="kb">Knowledge Base</TabsTrigger>
      </TabsList>
      <TabsContent value="chat" className="mt-0"><AdminSupportChat /></TabsContent>
      <TabsContent value="inbox" className="mt-0"><AdminContactMessages /></TabsContent>
      <TabsContent value="kb" className="mt-0"><AdminHelpCenter /></TabsContent>
    </Tabs>
  );
};

export default AdminSupportHub;
