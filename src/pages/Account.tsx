import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import Layout from "@/components/Layout";
import ProfileSettings from "@/components/profile/ProfileSettings";
import { SecuritySettings } from "@/components/profile/SecuritySettings";
import { UserCircle } from "lucide-react";

const Account = () => {
  const { currentUser, isFirstRun } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && !isFirstRun) {
      navigate("/");
    }
  }, [currentUser, isFirstRun, navigate]);

  if (currentUser) {
    return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <UserCircle className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome, {currentUser.name}</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <Card className="p-6">
              <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="space-y-4">
                  <ProfileSettings />
                </TabsContent>
                <TabsContent value="security" className="space-y-4">
                  <SecuritySettings />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <img
            src="/lovable-uploads/5b365417-f2a4-4acf-9b1c-9fdcb92cc02e.png"
            alt="Logo"
            className="h-12 w-auto mb-4"
          />
          <h2 className="text-2xl font-bold tracking-tight">
            {isFirstRun ? "Welcome to UpSnap" : "Welcome back"}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {isFirstRun
              ? "Create an admin account to get started"
              : "Sign in to your account"}
          </p>
        </div>

        <Card className="p-6">
          {isFirstRun ? (
            <RegisterForm />
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Account;
