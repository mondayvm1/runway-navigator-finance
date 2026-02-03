import RunwayCalculator from "../components/RunwayCalculator";
import AuthForm from "../components/AuthForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, BarChart3, Shield, Zap } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-48 sm:w-72 h-48 sm:h-72 bg-blue-400/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-[15%] w-64 sm:w-96 h-64 sm:h-96 bg-purple-400/10 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute bottom-20 left-[20%] w-56 sm:w-80 h-56 sm:h-80 bg-indigo-400/10 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 relative z-10">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-8 sm:mb-16 animate-fade-up">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-semibold text-slate-800">Pathline</span>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 text-sm">
              <Link to="/demo">See Demo</Link>
            </Button>
          </nav>

          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12 px-1">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs sm:text-sm text-blue-700 mb-6 sm:mb-8">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Trusted by 10,000+ users</span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-4 sm:mb-6 tracking-tight animate-fade-up-delayed leading-tight">
              Financial clarity,
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                beautifully simple.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed animate-fade-up-delayed-2 px-2">
              Track your net worth, visualize your runway, and make smarter financial decisions—all in one elegant dashboard.
            </p>
          </div>

          {/* Auth Form with glass effect */}
          <div id="auth" className="max-w-md mx-auto mb-12 sm:mb-20 animate-fade-up-delayed-2 px-2 sm:px-0">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-white/80 p-1">
              <AuthForm />
            </div>
          </div>

          {/* Features - minimal style */}
          <div className="max-w-4xl mx-auto px-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="group p-4 sm:p-6 rounded-2xl bg-white/50 backdrop-blur border border-slate-100 hover:bg-white/80 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1.5 sm:mb-2 text-sm sm:text-base">Net Worth Tracking</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  See your complete financial picture with real-time calculations across all accounts.
                </p>
              </div>
              
              <div className="group p-4 sm:p-6 rounded-2xl bg-white/50 backdrop-blur border border-slate-100 hover:bg-white/80 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1.5 sm:mb-2 text-sm sm:text-base">Financial Runway</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Know exactly how long your savings will last at your current spending rate.
                </p>
              </div>
              
              <div className="group p-4 sm:p-6 rounded-2xl bg-white/50 backdrop-blur border border-slate-100 hover:bg-white/80 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 sm:col-span-2 md:col-span-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1.5 sm:mb-2 text-sm sm:text-base">Secure & Private</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Your data is encrypted end-to-end. Access it from anywhere, anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 relative overflow-hidden">
      {/* Floating background elements - smaller on mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[5%] w-48 sm:w-96 h-48 sm:h-96 bg-blue-400/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 right-[10%] w-64 sm:w-[500px] h-64 sm:h-[500px] bg-indigo-400/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-40 left-[15%] w-48 sm:w-80 h-48 sm:h-80 bg-purple-400/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-20 right-[25%] w-40 sm:w-72 h-40 sm:h-72 bg-blue-400/5 rounded-full blur-3xl animate-float" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 relative z-10">
        <header className="text-center mb-4 sm:mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-semibold text-slate-800">Pathline</span>
          </div>
          <p className="text-sm sm:text-base text-slate-500">See your financial future clearly</p>
        </header>

        <RunwayCalculator />
      </div>
    </div>
  );
};

export default Index;
