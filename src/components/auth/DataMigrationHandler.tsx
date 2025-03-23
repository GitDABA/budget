'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

/**
 * This component handles associating any existing budget data with the logged-in user.
 * Specifically ensuring that data for the email post@davidbakke.no is preserved.
 */
export default function DataMigrationHandler() {
  const { user } = useAuth();
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const migrateUserData = async () => {
      if (!user) return;

      try {
        // First check if this is the specific user we want to preserve data for
        if (user.email === 'post@davidbakke.no') {
          console.log('Detected primary user account - setting up user association');
          
          // Find any budgets without a user_id and assign them to this user
          const { data: budgetsWithoutUser, error: budgetError } = await supabase
            .from('budgets')
            .select('id')
            .is('user_id', null);
            
          if (budgetError) throw budgetError;
          
          if (budgetsWithoutUser && budgetsWithoutUser.length > 0) {
            console.log(`Found ${budgetsWithoutUser.length} budgets to migrate`);
            
            // Update all the unassigned budgets to belong to this user
            const { error: updateError } = await supabase
              .from('budgets')
              .update({ user_id: user.id })
              .is('user_id', null);
              
            if (updateError) throw updateError;
            
            console.log('Successfully migrated budget data to user');
          } else {
            console.log('No budgets requiring migration found');
          }
        }
        
        setMigrationComplete(true);
      } catch (err: any) {
        console.error('Error during data migration:', err);
        setError(err.message || 'Error during data migration');
      }
    };

    if (user && !migrationComplete) {
      migrateUserData();
    }
  }, [user, migrationComplete]);

  // This is a utility component that doesn't render anything visible
  return null;
}
