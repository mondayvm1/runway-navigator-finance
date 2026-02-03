import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, ArrowLeft, Handshake, Users, DollarSign, Megaphone, BarChart3, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Partners = () => {
  const programs = [
    {
      title: 'Affiliate Program',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
      commission: '30%',
      description: 'Earn recurring commissions by referring users to Pathline',
      features: [
        '30% recurring commission',
        '90-day cookie duration',
        'Real-time tracking dashboard',
        'Monthly payouts via PayPal/Stripe'
      ]
    },
    {
      title: 'Influencer Partnership',
      icon: Megaphone,
      color: 'from-blue-500 to-indigo-500',
      commission: 'Custom',
      description: 'Special rates and benefits for content creators',
      features: [
        'Custom commission rates',
        'Sponsored content opportunities',
        'Early access to features',
        'Co-marketing campaigns'
      ]
    },
    {
      title: 'Brand Sponsorship',
      icon: BarChart3,
      color: 'from-purple-500 to-violet-500',
      commission: 'Varies',
      description: 'Put your brand in front of financially-minded users',
      features: [
        'In-app placement opportunities',
        'Newsletter sponsorships',
        'Exclusive webinar hosting',
        'Custom integration options'
      ]
    }
  ];

  const stats = [
    { value: '50K+', label: 'Monthly Active Users' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '$2M+', label: 'Assets Tracked' },
    { value: '12%', label: 'Conversion Rate' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 right-[15%] w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-float-delayed" />
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-6 shadow-lg shadow-emerald-500/25">
            <Handshake className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Partner With Us</h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Join our network of affiliates, influencers, and sponsors. Grow your income while helping others achieve financial clarity.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4 bg-white/70 backdrop-blur border-white/50 text-center">
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Programs */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {programs.map((program) => (
            <Card key={program.title} className="p-6 bg-white/70 backdrop-blur border-white/50 flex flex-col">
              <div className={`w-12 h-12 bg-gradient-to-br ${program.color} rounded-xl flex items-center justify-center mb-4`}>
                <program.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-1">{program.title}</h3>
              <div className="text-2xl font-bold text-emerald-600 mb-3">{program.commission}</div>
              <p className="text-sm text-slate-600 mb-4">{program.description}</p>
              
              <ul className="space-y-2 mb-6 flex-1">
                {program.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                    <Zap className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => toast.success(`Applying for ${program.title}...`)}
                className={`w-full bg-gradient-to-r ${program.color} hover:opacity-90`}
              >
                Apply Now
              </Button>
            </Card>
          ))}
        </div>

        {/* How it works */}
        <Card className="p-8 bg-white/70 backdrop-blur border-white/50 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-emerald-600">1</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Apply</h3>
              <p className="text-sm text-slate-600">Fill out a quick application form</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-teal-600">2</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Get Approved</h3>
              <p className="text-sm text-slate-600">We review and approve within 48 hours</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Start Earning</h3>
              <p className="text-sm text-slate-600">Share your link and track earnings</p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <Card className="p-8 bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-center">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">Ready to Partner?</h2>
          <p className="text-emerald-100 mb-6">Join our growing community of partners and start earning today.</p>
          <Link to="/contact">
            <Button variant="secondary" className="bg-white text-emerald-700 hover:bg-emerald-50">
              Get Started
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Partners;
