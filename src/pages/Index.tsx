
import { useState, useEffect } from "react";
import RunwayCalculator from "../components/RunwayCalculator";
import AuthForm from "../components/AuthForm";
import InfoCard from "../components/InfoCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-2">Personal Finance Dashboard</h1>
            <p className="text-xl text-gray-600 mb-6">Track your complete financial picture</p>
            
            <div className="flex justify-center gap-4 mb-8">
              <Button asChild variant="outline" size="lg">
                <Link to="/demo">See Demo</Link>
              </Button>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link to="#auth">Get Started</Link>
              </Button>
            </div>
          </header>

          <div id="auth" className="max-w-md mx-auto">
            <AuthForm />
          </div>

          <div className="max-w-5xl mx-auto mt-12 grid md:grid-cols-3 gap-8">
            <InfoCard 
              title="Net Worth"
              content="Your net worth is the difference between your assets and liabilities. It's a key indicator of your overall financial health."
              icon="Calculator"
            />
            <InfoCard 
              title="Financial Runway"
              content="Your runway shows how long your cash would last at your current expense rate, helping you plan for emergencies."
              icon="Clock"
            />
            <InfoCard 
              title="Save Your Data"
              content="Your financial data is securely saved in the cloud. Access it from anywhere and track your progress over time!"
              icon="Save"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-2">Personal Finance Dashboard</h1>
          <p className="text-xl text-gray-600">Track your complete financial picture</p>
        </header>

        <RunwayCalculator />
      </div>
    </div>
  );
};

export default Index;
