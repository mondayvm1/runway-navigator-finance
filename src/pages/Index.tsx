
import { useState, useEffect } from "react";
import RunwayCalculator from "../components/RunwayCalculator";
import InfoCard from "../components/InfoCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-2">Finance Runway Calculator</h1>
          <p className="text-xl text-gray-600">Track how long your savings will last</p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <RunwayCalculator />
            </div>
            <div className="space-y-4">
              <InfoCard 
                title="What is a runway?"
                content="Your financial runway is how long your savings will last given your current expenses. It's a critical metric for understanding your financial health."
                icon="Clock"
              />
              <InfoCard 
                title="How it works"
                content="Enter your current savings and monthly expenses. We'll calculate how long your money will last if you don't add any income."
                icon="Calculator"
              />
              <InfoCard 
                title="Save your data"
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
