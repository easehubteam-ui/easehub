import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AuthCallbackPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setIsProcessing(true);
        const params = new URLSearchParams(location.search);
        const oauthError = params.get('error') || params.get('error_code');
        const oauthErrorDescription = params.get('error_description');
        if (oauthError) {
          throw new Error(oauthErrorDescription || `Google sign-in was not completed (${oauthError}).`);
        }
        await refreshUser();
        
        // Get stored redirect destination
        let redirectPath = '/dashboard';
        if (typeof window !== 'undefined') {
          const stored = window.sessionStorage.getItem('easehub_oauth_redirect');
          if (stored) {
            redirectPath = stored;
            window.sessionStorage.removeItem('easehub_oauth_redirect');
          }
        }
        
        navigate(redirectPath, { replace: true });
      } catch (err: any) {
        setError(err?.message || 'Authentication failed. Please try again.');
        navigate('/login', { replace: true, state: { error: err?.message } });
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate, refreshUser]);

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-[#F8FAF6] text-[#191C1A] font-sans antialiased flex flex-col justify-center p-3 sm:p-6 selection:bg-[#EECA3A] selection:text-[#171A18]">
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-[#E5E1D6] text-center">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}
        
        <div className="flex flex-col items-center gap-4">
          {isProcessing && (
            <>
              <div className="w-12 h-12 border-4 border-[#225944] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-[#225944]">Completing Google sign-in...</p>
            </>
          )}
          
          {!isProcessing && !error && (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xs font-bold text-[#225944]">Sign-in successful!</p>
              <p className="text-xs text-[#6B6B63]">Redirecting to your dashboard...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;