import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ReferralStats {
  total_referrals: number;
  completed_referrals: number;
  total_earned: number;
  referrals: Array<{
    full_name: string;
    phone: string;
    created_at: string;
    first_order_made: boolean;
    reward_given: boolean;
    reward_amount: number;
  }>;
}

export const useReferralSystem = (userId: number | null) => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReferralCode = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const getReferralCode = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: existingCode } = await supabase
        .from('referral_codes')
        .select('referral_code')
        .eq('user_id', userId)
        .single();

      if (existingCode) {
        setReferralCode(existingCode.referral_code);
      } else {
        let newCode = generateReferralCode();
        let isUnique = false;

        while (!isUnique) {
          const { data: existing } = await supabase
            .from('referral_codes')
            .select('id')
            .eq('referral_code', newCode)
            .single();

          if (!existing) {
            isUnique = true;
          } else {
            newCode = generateReferralCode();
          }
        }

        const { error: insertError } = await supabase
          .from('referral_codes')
          .insert({ user_id: userId, referral_code: newCode });

        if (insertError) throw insertError;
        setReferralCode(newCode);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get referral code');
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: referrals, error: refError } = await supabase
        .from('referrals')
        .select(`
          created_at,
          first_order_made,
          reward_given,
          reward_amount,
          referred:users!referrals_referred_id_fkey(full_name, phone)
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (refError) throw refError;

      const total_referrals = referrals?.length || 0;
      const completed_referrals = referrals?.filter(r => r.first_order_made).length || 0;
      const total_earned = referrals
        ?.filter(r => r.reward_given)
        .reduce((sum, r) => sum + parseFloat(r.reward_amount.toString()), 0) || 0;

      setStats({
        total_referrals,
        completed_referrals,
        total_earned,
        referrals: referrals?.map(r => ({
          full_name: (r.referred as any)?.full_name || 'Неизвестно',
          phone: (r.referred as any)?.phone || '',
          created_at: r.created_at,
          first_order_made: r.first_order_made,
          reward_given: r.reward_given,
          reward_amount: parseFloat(r.reward_amount.toString())
        })) || []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get stats');
    } finally {
      setLoading(false);
    }
  };

  const validateCode = async (code: string): Promise<{ valid: boolean; referrerId: number | null }> => {
    try {
      const { data } = await supabase
        .from('referral_codes')
        .select('user_id')
        .eq('referral_code', code)
        .single();

      return {
        valid: !!data,
        referrerId: data?.user_id || null
      };
    } catch {
      return { valid: false, referrerId: null };
    }
  };

  const registerReferral = async (referredId: number, code: string): Promise<boolean> => {
    try {
      const validation = await validateCode(code);
      if (!validation.valid || !validation.referrerId) return false;

      if (validation.referrerId === referredId) return false;

      const { data: existing } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_id', referredId)
        .single();

      if (existing) return false;

      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: validation.referrerId,
          referred_id: referredId,
          referral_code: code,
          reward_amount: 500
        });

      if (insertError) return false;

      await supabase
        .from('users')
        .update({ referred_by_code: code })
        .eq('id', referredId);

      return true;
    } catch {
      return false;
    }
  };

  const completeFirstOrder = async (referredUserId: number): Promise<boolean> => {
    try {
      const { data: referral } = await supabase
        .from('referrals')
        .select('referrer_id, reward_amount, first_order_made')
        .eq('referred_id', referredUserId)
        .single();

      if (!referral || referral.first_order_made) return false;

      await supabase
        .from('referrals')
        .update({ first_order_made: true, reward_given: true })
        .eq('referred_id', referredUserId);

      await supabase.rpc('increment_balance', {
        user_id: referral.referrer_id,
        amount: referral.reward_amount
      });

      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (userId) {
      getReferralCode();
      getStats();
    }
  }, [userId]);

  return {
    referralCode,
    stats,
    loading,
    error,
    getReferralCode,
    getStats,
    validateCode,
    registerReferral,
    completeFirstOrder
  };
};
