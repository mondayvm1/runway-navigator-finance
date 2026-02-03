import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { FcGoogle } from 'react-icons/fc';
import { TrendingUp, Mail, Lock } from 'lucide-react';

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
          toast.error(error.message);
        } else {
          toast.success('Check your email for the confirmation link!');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Welcome back!');
        }
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async () => {
    setSocialLoading(true);
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('Something went wrong with social login');
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-8 bg-card shadow-xl border border-border rounded-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {isSignUp ? 'Start Your Journey' : 'Welcome Back'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isSignUp ? 'Create your Pathline account' : 'Sign in to continue'}
        </p>
      </div>

      {/* Google Sign In - Primary CTA */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 text-base font-medium border-2 hover:bg-muted/50 mb-6"
        onClick={handleSocialLogin}
        disabled={loading || socialLoading}
      >
        <FcGoogle className="w-5 h-5 mr-3" />
        Continue with Google
      </Button>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-border"></div>
        <span className="px-4 text-sm text-muted-foreground">or use email</span>
        <div className="flex-1 border-t border-border"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-11 h-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-11 h-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-medium"
          disabled={loading || socialLoading}
        >
          {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </Button>
      </form>
      
      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isSignUp ? (
            <>Already have an account? <span className="text-primary font-medium">Sign In</span></>
          ) : (
            <>Don't have an account? <span className="text-primary font-medium">Sign Up</span></>
          )}
        </button>
      </div>
    </Card>
  );
};

export default AuthForm;
