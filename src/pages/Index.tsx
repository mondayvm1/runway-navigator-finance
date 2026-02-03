import RunwayCalculator from "../components/RunwayCalculator";
import AuthForm from "../components/AuthForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, Shield, BarChart3 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading Pathline...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <header className="text-center mb-12 pt-8">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Pathline
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Your Financial Journey,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Track your net worth, visualize your runway, and build lasting wealth with clarity and confidence.
            </p>
            
            <div className="flex justify-center gap-4 mb-12">
              <Button asChild variant="outline" size="lg">
                <Link to="/demo">See Demo</Link>
              </Button>
            </div>
          </header>

          {/* Auth Form */}
          <div id="auth" className="max-w-md mx-auto mb-16">
            <AuthForm />
          </div>

          {/* Features Grid */}
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Net Worth Tracking</h3>
              <p className="text-sm text-muted-foreground">
                See your complete financial picture with real-time net worth calculations.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Financial Runway</h3>
              <p className="text-sm text-muted-foreground">
                Know exactly how long your savings will last at your current spending rate.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">
                Your data is encrypted and securely stored. Access it from anywhere.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Pathline
            </span>
          </div>
          <p className="text-muted-foreground">Track your complete financial picture</p>
        </header>

        <RunwayCalculator />
      </div>
    </div>
  );
};

export default Index;
