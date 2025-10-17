import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import BanNotification from './auth/BanNotification';
import NatureBackground from './auth/NatureBackground';
import NatureAnimationStyles from './auth/NatureAnimationStyles';
import AuthForms from './auth/AuthForms';
import ForgotPasswordForm from './auth/ForgotPasswordForm';
import AdminCodeVerification from './auth/AdminCodeVerification';

interface BanInfo {
  banned: boolean;
  ban_reason?: string;
  ban_until?: string;
}

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, action: 'login' | 'register') => void;
  banInfo?: BanInfo | null;
  requiresAdminCode?: boolean;
  pendingAdminUser?: { id: number; full_name: string };
  onAdminCodeVerify?: (code: string) => void;
  adminCodeError?: string;
  onBanExpired?: () => void;
}

const AuthDialog = ({ open, onOpenChange, onSubmit, banInfo, requiresAdminCode, pendingAdminUser, onAdminCodeVerify, adminCodeError, onBanExpired }: AuthDialogProps) => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const formatPhoneInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = '+7';
    
    if (cleaned.length > 1) {
      formatted += ' (' + cleaned.substring(1, 4);
    }
    if (cleaned.length >= 5) {
      formatted += ') ' + cleaned.substring(4, 7);
    }
    if (cleaned.length >= 8) {
      formatted += '-' + cleaned.substring(7, 9);
    }
    if (cleaned.length >= 10) {
      formatted += '-' + cleaned.substring(9, 11);
    }
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursorPosition = input.selectionStart || 0;
    const oldValue = input.value;
    const newValue = formatPhoneInput(input.value);
    
    input.value = newValue;
    
    if (oldValue.length > newValue.length) {
      input.setSelectionRange(cursorPosition, cursorPosition);
    } else {
      const newCursor = cursorPosition + (newValue.length - oldValue.length);
      input.setSelectionRange(newCursor, newCursor);
    }
  };

  if (banInfo?.banned) {
    return <BanNotification open={open} onOpenChange={onOpenChange} banInfo={banInfo} onBanExpired={onBanExpired} />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 max-w-4xl sm:max-w-[90vw]">
        <div className="relative flex flex-col md:flex-row min-h-[600px]">
          <NatureBackground />
          <div className="w-full md:w-1/2 p-8 bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle>
                {requiresAdminCode ? 'Вход в админку' : showForgotPassword ? 'Восстановление пароля' : 'Вход и регистрация'}
              </DialogTitle>
              <DialogDescription>
                {requiresAdminCode ? 'Подтверждение доступа' : showForgotPassword ? 'Запросите код для сброса пароля' : 'Войдите или создайте новый аккаунт'}
              </DialogDescription>
            </DialogHeader>
            {requiresAdminCode && pendingAdminUser && onAdminCodeVerify ? (
              <AdminCodeVerification
                userId={pendingAdminUser.id}
                userName={pendingAdminUser.full_name}
                onVerify={onAdminCodeVerify}
                onBack={() => onOpenChange(false)}
                error={adminCodeError}
              />
            ) : showForgotPassword ? (
              <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
            ) : (
              <AuthForms 
                onSubmit={onSubmit} 
                handlePhoneChange={handlePhoneChange}
                onForgotPassword={() => setShowForgotPassword(true)}
              />
            )}
          </div>
        </div>
        <NatureAnimationStyles />
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;