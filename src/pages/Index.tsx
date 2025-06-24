
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-xl text-gray-800">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-800 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">Personal Finance Dashboard</h1>
            <p className="text-xl text-gray-600 mb-6">Track your complete financial picture</p>
            
            <div className="flex justify-center gap-4 mb-8">
              <Button asChild variant="outline" size="lg" className="border-2">
                <Link to="/demo">See Demo</Link>
              </Button>
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-800 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">Personal Finance Dashboard</h1>
          <p className="text-xl text-gray-600">Track your complete financial picture</p>
        </header>

        <RunwayCalculator />
      </div>
    </div>
  );
};

export default Index;
