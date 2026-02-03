import RunwayCalculator from "../components/RunwayCalculator";
import AuthForm from "../components/AuthForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Star, 
  Users, 
  Award,
  Sparkles,
  Clock,
  PieChart
} from "lucide-react";

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
          {/* Hero Section */}
          <header className="text-center mb-12 pt-8">
            {/* Logo */}
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
                Pathline
              </span>
            </div>

            {/* Social Proof Stars */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
                <span className="ml-2 text-gray-600 font-medium">Trusted by 10,000+ users</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-800 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
              See Your Financial Future Clearly
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Track your net worth, visualize your runway, and build lasting wealth with clarity and confidence.
            </p>
            
            {/* Social Proof Badges */}
            <div className="flex justify-center items-center gap-6 md:gap-8 text-sm text-gray-500 mb-10 flex-wrap">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>10,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span>Secure & Private</span>
              </div>
            </div>
          </header>

          {/* Auth Form */}
          <div id="auth" className="max-w-md mx-auto mb-16">
            <AuthForm />
            <p className="text-center text-sm text-gray-500 mt-4">
              No credit card required • Setup in 5 minutes
            </p>
          </div>

          {/* How It Works - 3 Steps */}
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
              Transform Your Finances in 3 Simple Steps
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              Get your complete financial picture in under 5 minutes
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200"></div>
              
              <Card className="p-6 text-center relative bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-blue-800">Add Your Accounts</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Enter your cash, investments, credit cards, and loans. Secure and instant calculations.
                </p>
                <div className="mt-3 text-xs text-blue-600 font-medium">⚡ Takes just 5 minutes</div>
              </Card>

              <Card className="p-6 text-center relative bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-indigo-800">Track & Plan</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  See your net worth, runway, and credit health. Add income to plan your security.
                </p>
                <div className="mt-3 text-xs text-indigo-600 font-medium">📊 Real-time insights</div>
              </Card>

              <Card className="p-6 text-center relative bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-purple-800">Save & Grow</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Create snapshots to track progress. Get insights to build wealth over time.
                </p>
                <div className="mt-3 text-xs text-purple-600 font-medium">🚀 Watch your wealth grow</div>
              </Card>
            </div>
          </div>

          {/* Features Grid */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Net Worth Tracking</h3>
                <p className="text-sm text-gray-600">
                  See your complete financial picture with real-time calculations.
                </p>
              </div>
              
              <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Financial Runway</h3>
                <p className="text-sm text-gray-600">
                  Know exactly how long your savings will last at your current rate.
                </p>
              </div>
              
              <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Secure & Private</h3>
                <p className="text-sm text-gray-600">
                  Your data is encrypted and securely stored. Access it from anywhere.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="max-w-3xl mx-auto mb-12">
            <Card className="p-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl text-center">
              <Sparkles className="mx-auto mb-4" size={36} />
              <h3 className="text-2xl font-bold mb-2">Ready to Transform Your Finances?</h3>
              <p className="text-white/90 mb-6">
                Join 10,000+ users building wealth with Pathline
              </p>
              <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-gray-100 font-bold text-lg px-8 py-3 h-auto shadow-lg">
                <a href="#auth">Get Started Free →</a>
              </Button>
            </Card>
          </div>

          {/* Demo Link */}
          <div className="text-center pb-8">
            <Button asChild variant="outline" size="lg" className="border-2">
              <Link to="/demo">See Full Demo Dashboard →</Link>
            </Button>
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
