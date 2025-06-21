
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
  Sparkles
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
            See Your Financial Future Clearly
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Here's how your complete financial dashboard would look
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/">Sign In</Link>
            </Button>
          </div>
        </header>

        {/* How It Works - 1-2-3 */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            How It Works in 3 Simple Steps
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Add Your Accounts</h3>
              <p className="text-gray-600">
                Simply enter your cash, investments, credit cards, and loans. 
                Takes just 5 minutes to get your complete financial picture.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Track & Plan</h3>
              <p className="text-gray-600">
                See your net worth, financial runway, and credit utilization. 
                Add future income to see how it extends your runway.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Save & Grow</h3>
              <p className="text-gray-600">
                Create snapshots to track progress over time. 
                Get insights to make better financial decisions.
              </p>
            </Card>
          </div>
        </div>

        {/* Demo Dashboard */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            Your Dashboard Would Look Like This
          </h2>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Net Worth Summary */}
              <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="mr-2 text-green-600" />
                  Net Worth Overview
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${demoData.netWorth.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Net Worth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${demoData.totalAssets.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Assets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      ${demoData.totalLiabilities.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Debt</div>
                  </div>
                </div>
              </Card>

              {/* Financial Runway */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="mr-2 text-blue-600" />
                  Financial Runway
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-700">{demoData.runway}</div>
                    <div className="text-sm text-gray-600">Months without income</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700">15+</div>
                    <div className="text-sm text-gray-600">Months with planned income</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Your savings runway visualization</p>
              </Card>

              {/* Account Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Account Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Wallet className="mr-2 text-green-600" size={16} />
                      <span>Cash & Checking</span>
                    </div>
                    <span className="font-semibold text-green-600">$45,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <PieChart className="mr-2 text-blue-600" size={16} />
                      <span>Investments</span>
                    </div>
                    <span className="font-semibold text-blue-600">$140,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 text-red-600" size={16} />
                      <span>Credit Cards</span>
                    </div>
                    <span className="font-semibold text-red-600">-$8,500</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Insights */}
            <div className="space-y-6">
              {/* Financial Insights */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Sparkles className="mr-2 text-purple-600" />
                  Financial Insights
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 mt-0.5 text-green-600" />
                    <div>
                      <div className="font-medium text-sm">Net Worth Status</div>
                      <div className="text-xs text-gray-600">Excellent financial health</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 mt-0.5 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">Financial Runway</div>
                      <div className="text-xs text-gray-600">Good emergency fund coverage</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CreditCard className="h-5 w-5 mt-0.5 text-green-600" />
                    <div>
                      <div className="font-medium text-sm">Credit Health</div>
                      <div className="text-xs text-gray-600">{demoData.creditUtilization}% utilization - Excellent!</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Progress Tracking */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CalendarDays className="mr-2 text-blue-600" />
                  Progress Tracking
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Net Worth Growth</span>
                    <span className="text-sm font-semibold text-green-600">+12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Debt Reduction</span>
                    <span className="text-sm font-semibold text-green-600">-$5,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Savings Rate</span>
                    <span className="text-sm font-semibold text-blue-600">22%</span>
                  </div>
                </div>
              </Card>

              {/* Call to Action */}
              <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <h3 className="text-lg font-semibold mb-2">Ready to Start?</h3>
                <p className="text-sm mb-4 opacity-90">
                  Create your account and see your real financial picture in minutes.
                </p>
                <Button asChild className="w-full bg-white text-blue-600 hover:bg-gray-100">
                  <Link to="/" className="flex items-center justify-center">
                    Get Started Free
                    <ArrowRight className="ml-2" size={16} />
                  </Link>
                </Button>
              </Card>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Why Choose Our Financial Dashboard?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <Shield className="text-blue-600 mt-1" size={24} />
              <div>
                <h3 className="font-semibold mb-2">Secure & Private</h3>
                <p className="text-gray-600 text-sm">
                  Your financial data is encrypted and stored securely. We never share your information.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="text-green-600 mt-1" size={24} />
              <div>
                <h3 className="font-semibold mb-2">Real-Time Updates</h3>
                <p className="text-gray-600 text-sm">
                  See how changes to your finances affect your runway and goals instantly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <TrendingUp className="text-purple-600 mt-1" size={24} />
              <div>
                <h3 className="font-semibold mb-2">Progress Tracking</h3>
                <p className="text-gray-600 text-sm">
                  Create snapshots to track your financial progress over time.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Sparkles className="text-yellow-600 mt-1" size={24} />
              <div>
                <h3 className="font-semibold mb-2">Smart Insights</h3>
                <p className="text-gray-600 text-sm">
                  Get personalized insights to help you make better financial decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Take Control of Your Financial Future Today
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already tracking their finances and building wealth with our dashboard.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/">Create Free Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/">Already have an account? Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
