
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Shield, 
  Clock, 
  DollarSign,
  PieChart,
  CalendarDays,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Star,
  Users,
  Award
} from "lucide-react";

const Demo = () => {
  const demoData = {
    netWorth: 125000,
    totalAssets: 185000,
    totalLiabilities: 60000,
    runway: 8.5,
    creditUtilization: 23
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex justify-center mb-4">
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
            Join thousands who've transformed their financial lives with our comprehensive dashboard
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3 h-auto shadow-lg">
              <Link to="/#auth">Start Free Today →</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 h-auto border-2">
              <Link to="/#auth">Already Have an Account?</Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex justify-center items-center gap-8 text-sm text-gray-500 mb-12">
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

        {/* How It Works - Enhanced 1-2-3 */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
            Transform Your Finances in 3 Simple Steps
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            Get your complete financial picture in under 5 minutes
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 to-purple-200"></div>
            
            <Card className="p-8 text-center relative bg-gradient-to-br from-blue-50 to-blue-100 border-2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-blue-800">Add Your Accounts</h3>
              <p className="text-gray-700 leading-relaxed">
                Simply enter your cash, investments, credit cards, and loans. 
                Our secure system calculates everything instantly - no external connections required.
              </p>
              <div className="mt-4 text-sm text-blue-600 font-medium">⚡ Takes just 5 minutes</div>
            </Card>

            <Card className="p-8 text-center relative bg-gradient-to-br from-green-50 to-green-100 border-2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-green-800">Track & Plan</h3>
              <p className="text-gray-700 leading-relaxed">
                See your net worth, financial runway, and credit health at a glance. 
                Add future income to plan how it extends your financial security.
              </p>
              <div className="mt-4 text-sm text-green-600 font-medium">📊 Real-time insights</div>
            </Card>

            <Card className="p-8 text-center relative bg-gradient-to-br from-purple-50 to-purple-100 border-2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-purple-800">Save & Grow</h3>
              <p className="text-gray-700 leading-relaxed">
                Create snapshots to track progress over time. 
                Get personalized insights to make smarter financial decisions and build wealth.
              </p>
              <div className="mt-4 text-sm text-purple-600 font-medium">🚀 Watch your wealth grow</div>
            </Card>
          </div>

          {/* CTA after steps */}
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-lg px-10 py-4 h-auto shadow-lg">
              <Link to="/#auth">Start Building Wealth Today →</Link>
            </Button>
          </div>
        </div>

        {/* Demo Dashboard */}
        <div className="max-w-7xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Your Dashboard Will Look Like This
            </h2>
            <p className="text-gray-600 text-lg">
              A complete view of your financial health in one beautiful interface
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Net Worth Summary */}
              <Card className="p-8 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-2 shadow-lg">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <TrendingUp className="mr-3 text-green-600" size={24} />
                  Net Worth Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/70 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                      ${demoData.netWorth.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Net Worth</div>
                    <div className="text-xs text-green-600 mt-1">↗ +12.5% this year</div>
                  </div>
                  <div className="text-center p-4 bg-white/70 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                      ${demoData.totalAssets.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Total Assets</div>
                    <div className="text-xs text-blue-600 mt-1">Growing steadily</div>
                  </div>
                  <div className="text-center p-4 bg-white/70 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                      ${demoData.totalLiabilities.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Total Debt</div>
                    <div className="text-xs text-green-600 mt-1">↘ Decreasing</div>
                  </div>
                </div>
              </Card>

              {/* Financial Runway */}
              <Card className="p-8 shadow-lg">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <Clock className="mr-3 text-blue-600" size={24} />
                  Financial Runway Analysis
                </h3>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl text-center border">
                    <div className="text-3xl font-bold text-orange-700 mb-2">{demoData.runway}</div>
                    <div className="text-sm text-gray-600 font-medium">Months without income</div>
                    <div className="text-xs text-orange-600 mt-1">Emergency fund ready</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center border">
                    <div className="text-3xl font-bold text-green-700 mb-2">15+</div>
                    <div className="text-sm text-gray-600 font-medium">Months with planned income</div>
                    <div className="text-xs text-green-600 mt-1">Excellent planning</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Runway Progress</span>
                    <span className="font-semibold">70% to ideal target</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full shadow-sm" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </Card>

              {/* Account Summary */}
              <Card className="p-8 shadow-lg">
                <h3 className="text-xl font-semibold mb-6">Account Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <Wallet className="text-green-600" size={20} />
                      </div>
                      <div>
                        <span className="font-medium">Cash & Checking</span>
                        <div className="text-xs text-gray-500">3 accounts</div>
                      </div>
                    </div>
                    <span className="font-bold text-green-600 text-lg">$45,000</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <PieChart className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <span className="font-medium">Investments</span>
                        <div className="text-xs text-gray-500">401k, IRA, Stocks</div>
                      </div>
                    </div>
                    <span className="font-bold text-blue-600 text-lg">$140,000</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                        <CreditCard className="text-red-600" size={20} />
                      </div>
                      <div>
                        <span className="font-medium">Credit Cards</span>
                        <div className="text-xs text-gray-500">23% utilization</div>
                      </div>
                    </div>
                    <span className="font-bold text-red-600 text-lg">-$8,500</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Insights */}
            <div className="space-y-6">
              {/* Financial Insights */}
              <Card className="p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Sparkles className="mr-2 text-purple-600" />
                  AI Financial Insights
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border">
                    <CheckCircle className="h-5 w-5 mt-0.5 text-green-600" />
                    <div>
                      <div className="font-medium text-sm">Excellent Health</div>
                      <div className="text-xs text-gray-600">Your net worth is growing steadily</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border">
                    <Clock className="h-5 w-5 mt-0.5 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">Strong Emergency Fund</div>
                      <div className="text-xs text-gray-600">8+ months coverage achieved</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border">
                    <TrendingUp className="h-5 w-5 mt-0.5 text-purple-600" />
                    <div>
                      <div className="font-medium text-sm">Investment Growth</div>
                      <div className="text-xs text-gray-600">Portfolio up 18% this year</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Progress Tracking */}
              <Card className="p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CalendarDays className="mr-2 text-blue-600" />
                  Progress This Year
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Net Worth Growth</span>
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+12.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Debt Reduction</span>
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">-$5,200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Savings Rate</span>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">22%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Investment Return</span>
                    <span className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">+18%</span>
                  </div>
                </div>
              </Card>

              {/* Call to Action */}
              <Card className="p-6 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl">
                <div className="text-center">
                  <Sparkles className="mx-auto mb-3" size={32} />
                  <h3 className="text-xl font-bold mb-2">Ready to Transform Your Finances?</h3>
                  <p className="text-sm mb-6 opacity-90">
                    Join 10,000+ users building wealth with our dashboard
                  </p>
                  <Button asChild size="lg" className="w-full !bg-white !text-blue-700 hover:!bg-gray-100 hover:!text-blue-800 font-bold shadow-lg">
                    <Link to="/#auth" className="flex items-center justify-center">
                      Create Free Account
                      <ArrowRight className="ml-2" size={18} />
                    </Link>
                  </Button>
                  <p className="text-xs mt-3 opacity-75">No credit card required • Setup in 5 minutes</p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Benefits Section - Enhanced */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
            Why 10,000+ Users Choose Our Dashboard
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            The most comprehensive yet simple financial tracking solution
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Enterprise-Grade Security</h3>
                <p className="text-gray-600">
                  Your financial data is encrypted and stored securely. We never connect to your accounts or share your information.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Real-Time Updates</h3>
                <p className="text-gray-600">
                  See how changes to your finances instantly affect your runway, net worth, and financial goals.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Progress Tracking</h3>
                <p className="text-gray-600">
                  Create snapshots to visualize your financial journey and celebrate your wealth-building milestones.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-yellow-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">AI-Powered Insights</h3>
                <p className="text-gray-600">
                  Get personalized recommendations and insights to optimize your financial strategy and build wealth faster.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA - Enhanced */}
        <div className="text-center mb-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-white shadow-2xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Take Control of Your Financial Future
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
              Join thousands who've transformed their financial lives. Start building wealth with complete visibility into your finances.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Button asChild size="lg" className="!bg-white !text-blue-700 hover:!bg-gray-100 hover:!text-blue-800 font-bold text-xl px-12 py-4 h-auto shadow-xl">
                <Link to="/#auth">Start Your Free Account →</Link>
              </Button>
              <Button asChild size="lg" className="!bg-transparent !border-2 !border-white !text-white hover:!bg-white hover:!text-blue-700 font-bold text-xl px-12 py-4 h-auto">
                <Link to="/#auth">Sign In to Existing Account</Link>
              </Button>
            </div>
            
            <div className="flex justify-center items-center gap-8 text-sm opacity-75">
              <span>✓ No credit card required</span>
              <span>✓ Setup in under 5 minutes</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
