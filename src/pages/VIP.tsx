import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, ArrowLeft, Crown, Check, Sparkles, Shield, Zap, BarChart3, Clock, HeadphonesIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const VIP = () => {
  const features = [
    { icon: BarChart3, title: 'Advanced Analytics', description: 'Deep insights into your financial patterns and projections' },
    { icon: Clock, title: 'Unlimited History', description: 'Access your complete financial history without limits' },
    { icon: Shield, title: 'Priority Support', description: '24/7 priority support with dedicated account manager' },
    { icon: Zap, title: 'Early Access', description: 'Be the first to try new features before anyone else' },
    { icon: Sparkles, title: 'AI Insights', description: 'Personalized AI-powered financial recommendations' },
    { icon: HeadphonesIcon, title: '1-on-1 Coaching', description: 'Monthly session with a financial wellness coach' }
  ];

  const plans = [
    {
      name: 'VIP Monthly',
      price: '$9.99',
      period: '/month',
      description: 'Perfect for trying out VIP features',
      popular: false
    },
    {
      name: 'VIP Annual',
      price: '$79.99',
      period: '/year',
      description: 'Save 33% with annual billing',
      popular: true,
      savings: 'Save $40'
    },
    {
      name: 'VIP Lifetime',
      price: '$199',
      period: 'one-time',
      description: 'Pay once, VIP forever',
      popular: false
    }
  ];

  const handleSubscribe = (plan: string) => {
    toast.success(`Subscribing to ${plan}...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 right-[15%] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-20 left-[30%] w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl animate-float" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-white">Pathline VIP</span>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Unlock Your Full Potential</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Go
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"> VIP</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto">
            Supercharge your financial journey with exclusive tools, insights, and personalized support.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {features.map((feature) => (
            <Card key={feature.title} className="p-5 bg-white/5 backdrop-blur border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mb-3">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Pricing */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`p-6 relative ${plan.popular 
                ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/50' 
                : 'bg-white/5 border-white/10'} backdrop-blur`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Best Value
                </div>
              )}
              
              <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-400">{plan.period}</span>
              </div>
              {plan.savings && (
                <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded mb-3">
                  {plan.savings}
                </span>
              )}
              <p className="text-sm text-slate-400 mb-6">{plan.description}</p>
              
              <ul className="space-y-2 mb-6">
                {features.slice(0, 4).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-amber-400" />
                    {feature.title}
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handleSubscribe(plan.name)}
                className={`w-full ${plan.popular 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white' 
                  : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                Get {plan.name}
              </Button>
            </Card>
          ))}
        </div>

        {/* Guarantee */}
        <Card className="p-6 bg-white/5 backdrop-blur border-white/10 text-center">
          <Shield className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">30-Day Money-Back Guarantee</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Not satisfied? Get a full refund within 30 days, no questions asked.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default VIP;
