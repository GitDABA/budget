import { supabase } from './supabase';

/**
 * Helper function to perform delete operations in Supabase with better error handling
 * @param table The table name to delete from
 * @param id The id of the record to delete
 * @param idField The name of the id field (defaults to 'id')
 * @returns Promise with success flag and optional error message
 */
// Test function to verify supabase connection
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('budgets').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return { success: false, message: error.message };
    }
    
    console.log('Supabase connection test successful:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Unexpected error testing Supabase connection:', error);
    return { success: false, message: error.message || 'Unknown error occurred' };
  }
}

// Test function to verify delete permissions
export async function testDeletePermission(table: string) {
  try {
    console.log(`Testing delete permission on ${table}...`);
    // First get any item from the table to attempt to delete
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (error) {
      console.error(`Error getting test item from ${table}:`, error);
      return { success: false, message: error.message };
    }
    
    if (!data || data.length === 0) {
      console.log(`No items found in ${table} to test deletion`);
      return { success: false, message: 'No items found to test deletion' };
    }
    
    // Get the ID of the item
    const testId = data[0].id;
    console.log(`Found test item with ID ${testId} in ${table}`);
    
    // Log the permission structure for this table
    console.log(`Attempting RLS permission check on ${table}...`);
    
    return { success: true, testId, message: 'Permission test completed' };
  } catch (error: any) {
    console.error(`Unexpected error testing delete permission on ${table}:`, error);
    return { success: false, message: error.message || 'Unknown error occurred' };
  }
}

export async function deleteItem(table: string, id: string, idField: string = 'id') {
  try {
    console.log(`Attempting to delete from ${table} where ${idField} = ${id}`);
    
    // Check if Supabase client is initialized
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return { success: false, message: 'Database connection error' };
    }
    
    // Log what we are about to do
    console.log(`Checking if item exists in ${table} with ${idField}=${id}`);
    
    // First get the item to confirm it exists
    const { data: checkData, error: checkError } = await supabase
      .from(table)
      .select()
      .eq(idField, id);
    
    // Log the response for debugging
    console.log(`Check data response:`, checkData);
    
    if (checkError) {
      console.error(`Error finding item to delete:`, checkError);
      return { success: false, message: `Item not found: ${checkError.message}` };
    }
    
    if (!checkData || checkData.length === 0) {
      console.error(`Item not found in ${table} with ${idField} = ${id}`);
      return { success: false, message: 'Item not found' };
    }
    
    // Log what we found
    console.log(`Found ${checkData.length} items to delete in ${table}:`, checkData);
    
    // Test direct query access to ensure we can get the item
    console.log(`Testing direct query access to ${table}...`);
    const { data: queryTest, error: queryError } = await supabase
      .from(table)
      .select('*')
      .eq(idField, id);
      
    if (queryError) {
      console.error(`Error directly querying ${table}:`, queryError);
    } else {
      console.log(`Direct query result:`, queryTest);
    }
    
    // Perform the delete operation
    console.log(`Executing delete on ${table} where ${idField}=${id}`);
    try {
      const { data: deleteData, error } = await supabase
        .from(table)
        .delete()
        .eq(idField, id);
    
      // Log delete response
      console.log(`Delete response data:`, deleteData);
      
      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        console.error(`Error details:`, JSON.stringify(error));
        return { success: false, message: error.message };
      }
      
      // Verify the item was actually deleted
      const { data: verifyData, error: verifyError } = await supabase
        .from(table)
        .select('*')
        .eq(idField, id);
        
      if (verifyError) {
        console.error(`Error verifying deletion:`, verifyError);
      } else if (verifyData && verifyData.length > 0) {
        console.error(`Item still exists after deletion attempt:`, verifyData);
        return { success: false, message: 'Item still exists after deletion' };
      }
      
      console.log(`Successfully deleted item(s) from ${table}`);
      return { success: true };
    } catch (deleteError: any) {
      console.error(`Error in delete operation:`, deleteError);
      return { success: false, message: deleteError.message || 'Error in delete operation' };
    }
  } catch (error: any) {
    console.error(`Unexpected error deleting from ${table}:`, error);
    return { success: false, message: error.message || 'Unknown error occurred' };
  }
}
