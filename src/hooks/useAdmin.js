import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './useAuth';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      console.log('Checking admin status for user:', user.id);
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

      console.log('Admin check result:', { data, error });

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
        console.log('User is admin:', !!data);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading };
};