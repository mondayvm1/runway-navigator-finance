import RunwayCalculator from "../components/RunwayCalculator";
import AuthForm from "../components/AuthForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading Pathline...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
                Pathline
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-800 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
              See Your Financial Future Clearly
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Track your net worth, visualize your runway, and build lasting wealth.
            </p>
            
            <div className="flex justify-center gap-4 mb-8">
              <Button asChild variant="outline" size="lg">
                <Link to="/demo">See Demo</Link>
              </Button>
            </div>
          </header>

          {/* Auth Form */}
          <div id="auth" className="max-w-md mx-auto">
            <AuthForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
              Pathline
            </span>
          </div>
          <p className="text-gray-600">Track your complete financial picture</p>
        </header>

        <RunwayCalculator />
      </div>
    </div>
  );
};

export default Index;
