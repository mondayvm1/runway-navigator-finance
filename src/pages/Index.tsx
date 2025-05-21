
import { useState, useEffect } from "react";
import RunwayCalculator from "../components/RunwayCalculator";
import InfoCard from "../components/InfoCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-2">Personal Finance Dashboard</h1>
          <p className="text-xl text-gray-600">Track your complete financial picture</p>
        </header>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <RunwayCalculator />
            </div>
            <div className="space-y-4">
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
                content="Your financial data is automatically saved in your browser. No need to re-enter it when you come back!"
                icon="Save"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
