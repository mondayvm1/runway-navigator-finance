import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, ArrowLeft, Heart, Coffee, Star, Zap, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Donate = () => {
  const tiers = [
    {
      name: 'Coffee',
      price: '$5',
      icon: Coffee,
      color: 'from-amber-500 to-orange-500',
      description: 'Buy me a coffee to fuel late-night coding sessions',
      features: ['Our eternal gratitude', 'Name in supporters list']
    },
    {
      name: 'Supporter',
      price: '$15',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      description: 'Help cover hosting and development costs',
      features: ['Everything in Coffee', 'Priority feature requests', 'Early access to new features'],
      popular: true
    },
    {
      name: 'Champion',
      price: '$50',
      icon: Star,
      color: 'from-purple-500 to-violet-500',
      description: 'Become a champion of financial wellness',
      features: ['Everything in Supporter', '1-on-1 feedback session', 'Custom feature consideration', 'Lifetime VIP status']
    }
  ];

  const handleDonate = (tier: string) => {
    toast.success(`Thank you for choosing ${tier}! Redirecting to payment...`);
    // In production, this would redirect to Stripe or similar
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-pink-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 right-[15%] w-96 h-96 bg-rose-400/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-800">Pathline</span>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl mb-6 shadow-lg shadow-pink-500/25">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Support Development</h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Pathline is built with love by independent developers. Your support helps keep the lights on and new features coming.
          </p>
        </div>

        {/* Donation Tiers */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier) => (
            <Card 
              key={tier.name}
              className={`p-6 bg-white/70 backdrop-blur border-white/50 relative ${tier.popular ? 'ring-2 ring-pink-500 shadow-xl' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className={`w-12 h-12 bg-gradient-to-br ${tier.color} rounded-xl flex items-center justify-center mb-4`}>
                <tier.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-1">{tier.name}</h3>
              <p className="text-3xl font-bold text-slate-900 mb-3">{tier.price}</p>
              <p className="text-sm text-slate-600 mb-4">{tier.description}</p>
              
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                    <Zap className="w-4 h-4 text-pink-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handleDonate(tier.name)}
                className={`w-full ${tier.popular 
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600' 
                  : 'bg-slate-900 hover:bg-slate-800'}`}
              >
                <Gift className="w-4 h-4 mr-2" />
                Support with {tier.price}
              </Button>
            </Card>
          ))}
        </div>

        {/* Custom Amount */}
        <Card className="p-8 bg-white/70 backdrop-blur border-white/50 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Custom Amount</h3>
          <p className="text-slate-600 mb-4">Want to contribute a different amount? Every bit helps!</p>
          <Button 
            variant="outline" 
            onClick={() => toast.info('Custom donation coming soon!')}
            className="border-pink-300 text-pink-700 hover:bg-pink-50"
          >
            Choose Your Own Amount
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Donate;
