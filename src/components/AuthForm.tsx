import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { FcGoogle } from 'react-icons/fc';
import { FaXTwitter } from 'react-icons/fa6';

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, signInWithTwitter } = useAuth();

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

  const handleSocialLogin = async (provider: 'google' | 'twitter') => {
    setSocialLoading(true);
    try {
      const { error } = provider === 'google' 
        ? await signInWithGoogle() 
        : await signInWithTwitter();
      
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
    <Card className="w-full max-w-md mx-auto p-6 bg-card shadow-lg border border-border">
      <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-input border border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-input border border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={loading || socialLoading}
        >
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </Button>
      </form>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-border"></div>
        <span className="px-3 text-sm text-muted-foreground">or continue with</span>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin('google')}
          disabled={loading || socialLoading}
        >
          <FcGoogle className="w-5 h-5 mr-2" />
          Continue with Google
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin('twitter')}
          disabled={loading || socialLoading}
        >
          <FaXTwitter className="w-5 h-5 mr-2" />
          Continue with X
        </Button>
      </div>
      
      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-primary hover:underline"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </Card>
  );
};

export default AuthForm;
