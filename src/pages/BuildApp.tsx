import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, ArrowLeft, Rocket, Smartphone, Globe, Zap, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const BuildApp = () => {
  const services = [
    {
      title: 'Mobile Apps',
      description: 'Native iOS & Android apps with seamless cross-platform experiences',
      icon: Smartphone,
      features: ['React Native / Flutter', 'App Store submission', 'Push notifications', 'Offline support']
    },
    {
      title: 'Web Applications',
      description: 'Modern, responsive web apps that work on any device',
      icon: Globe,
      features: ['React / Next.js', 'Progressive Web Apps', 'SEO optimized', 'Lightning fast']
    },
    {
      title: 'Full-Stack Solutions',
      description: 'Complete end-to-end development from idea to launch',
      icon: Zap,
      features: ['Backend API development', 'Database design', 'Authentication', 'Cloud deployment']
    }
  ];

  const process = [
    { step: '01', title: 'Discovery', description: 'We learn about your vision, goals, and requirements' },
    { step: '02', title: 'Design', description: 'Create beautiful mockups and user experience flows' },
    { step: '03', title: 'Develop', description: 'Build your app with modern, scalable technology' },
    { step: '04', title: 'Deploy', description: 'Launch your app and provide ongoing support' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-purple-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 right-[15%] w-96 h-96 bg-violet-400/10 rounded-full blur-3xl animate-float-delayed" />
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl mb-6 shadow-lg shadow-purple-500/25">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Bring Your Vision
            <span className="block bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              To Life
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            From concept to cross-platform reality. We build beautiful, high-performance apps that your users will love.
          </p>
          <Button 
            onClick={() => toast.success('Redirecting to consultation booking...')}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-lg px-8 py-6"
          >
            Book Free Consultation
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Services */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {services.map((service) => (
            <Card key={service.title} className="p-6 bg-white/70 backdrop-blur border-white/50 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mb-4">
                <service.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-sm text-slate-600 mb-4">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-purple-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Process */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Our Process</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {process.map((item, idx) => (
              <Card key={item.step} className="p-6 bg-white/70 backdrop-blur border-white/50 text-center relative">
                <div className="text-4xl font-bold text-purple-200 mb-2">{item.step}</div>
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
                {idx < process.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                    <ArrowRight className="w-5 h-5 text-purple-300" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="p-8 bg-gradient-to-br from-purple-600 to-violet-600 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to Start?</h2>
          <p className="text-purple-100 mb-6">Let's discuss your project and create something amazing together.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary"
              onClick={() => toast.success('Opening calendar...')}
              className="bg-white text-purple-700 hover:bg-purple-50"
            >
              Schedule a Call
            </Button>
            <Link to="/contact">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full">
                Send a Message
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BuildApp;
