import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { FcGoogle } from 'react-icons/fc';
import { Mail, Lock } from 'lucide-react';

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          console.error('Sign up error:', error);
          toast.error(error.message || 'Failed to create account. Please check your connection and try again.');
        } else {
          toast.success('Check your email for the confirmation link!');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          console.error('Sign in error:', error);
          toast.error(error.message || 'Failed to sign in. Please check your credentials.');
        } else {
          toast.success('Welcome back!');
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async () => {
    setSocialLoading(true);
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        console.error('Google sign in error:', error);
        toast.error(error.message || 'Failed to sign in with Google. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected Google login error:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong with social login');
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-8 bg-white/80 backdrop-blur-sm shadow-none border-0 rounded-xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          {isSignUp ? 'Start your financial journey' : 'Sign in to continue'}
        </p>
      </div>

      {/* Google Sign In - Primary CTA */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 text-base font-medium bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
        onClick={handleSocialLogin}
        disabled={loading || socialLoading}
      >
        <FcGoogle className="w-5 h-5 mr-3" />
        Continue with Google
      </Button>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-slate-200"></div>
        <span className="px-4 text-xs text-slate-400 uppercase tracking-wide">or</span>
        <div className="flex-1 border-t border-slate-200"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white"
          />
        </div>
        
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-11 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white"
          disabled={loading || socialLoading}
        >
          {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </Button>
      </form>
      
      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          {isSignUp ? (
            <>Already have an account? <span className="text-slate-900 font-medium">Sign in</span></>
          ) : (
            <>Don't have an account? <span className="text-slate-900 font-medium">Sign up</span></>
          )}
        </button>
      </div>
    </Card>
  );
};

export default AuthForm;
