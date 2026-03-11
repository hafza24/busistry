import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Plus } from "lucide-react";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="border-b border-border bg-background">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold font-display text-primary">🌳 Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>Home</Button>
            <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </header>
      <div className="container py-8">
        <h2 className="text-2xl font-bold font-display mb-6 text-foreground">Welcome, {user.user_metadata?.full_name || "there"}!</h2>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" /> My Stores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You don't have any stores yet. Get started by launching one!</p>
            <Button onClick={() => navigate("/templates")}>
              <Plus className="h-4 w-4 mr-2" /> Launch a Store
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
