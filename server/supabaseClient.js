const { createClient } = require('@supabase/supabase-js');

// Validate required environment variables
const validateEnvVars = () => {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_JWT_SECRET'
  ];
  
  console.log('🔍 Validating Supabase environment variables...');
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    const error = new Error(`Missing required Supabase environment variables: ${missingVars.join(', ')}`);
    error.code = 'MISSING_ENV_VARS';
    error.missingVars = missingVars;
    throw error;
  }
  
  console.log('✅ All required Supabase environment variables are present');
  
  // Log non-sensitive configuration
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📋 Supabase Configuration:');
    console.log(`   - SUPABASE_URL: ${process.env.SUPABASE_URL}`);
    console.log(`   - SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '*** (present)' : 'missing'}`);
    console.log(`   - SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '*** (present)' : 'missing'}`);
    console.log(`   - SUPABASE_JWT_SECRET: ${process.env.SUPABASE_JWT_SECRET ? '*** (present)' : 'missing'}\n`);
  }
};

// Validate environment variables before proceeding
try {
  validateEnvVars();
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:');
  console.error('   Error:', error.message);
  if (error.code === 'MISSING_ENV_VARS') {
    console.error('   Missing variables:', error.missingVars.join(', '));
    console.log('   Available environment variables:', 
      Object.keys(process.env).filter(k => k.startsWith('SUPABASE_'))
    );
  }
  throw error; // Re-throw to prevent further execution
}

// Create Supabase client with enhanced error handling and logging
let supabase;
const initializeSupabase = () => {
  try {
    console.log('🚀 Initializing Supabase client...');
    
    // Basic configuration
    const options = {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        storageKey: 'sb-auth-token',
        storage: {
          getItem: (key) => {
            console.log(`🔑 Storage get: ${key}`);
            return null; // Don't persist sessions
          },
          setItem: (key, value) => {
            console.log(`🔑 Storage set: ${key} = ${value ? '***' : 'null'}`);
          },
          removeItem: (key) => {
            console.log(`🔑 Storage remove: ${key}`);
          }
        }
      },
      global: {
        headers: { 
          'x-application-name': 'innovateam-backend',
          'x-client-info': 'innovateam/1.0.0'
        }
      },
      db: {
        schema: 'public'
      },
      realtime: {
        eventsPerSecond: 10
      }
    };
    
    // Create the main client with anon key for regular operations
    console.log('🔑 Initializing Supabase client with anon key...');
    const anonClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      {
        ...options,
        auth: {
          ...options.auth,
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );
    
    // Create an admin client with service role key for admin operations
    console.log('🔑 Initializing Supabase admin client with service role key...');
    
    // Verify service role key is different from anon key
    if (process.env.SUPABASE_KEY === process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ WARNING: SUPABASE_KEY and SUPABASE_SERVICE_ROLE_KEY are the same. This is not recommended for production.');
    }
    
    const adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        ...options,
        auth: {
          ...options.auth,
          // Disable auto token refresh for admin client
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
          // Use a different storage key to avoid conflicts
          storageKey: 'sb-admin-token',
          storage: {
            ...options.auth.storage,
            // Override storage key for admin client
            getItem: (key) => null,
            setItem: (key, value) => {},
            removeItem: (key) => {}
          }
        },
        // Add global headers for admin operations
        global: {
          ...options.global,
          'x-application-name': 'innovateam-backend-admin',
          'x-client-info': 'innovateam/1.0.0-admin',
          'x-request-origin': 'server-side'
        }
      }
    );
    
    // Use the admin client as the main client since we need admin operations
    supabase = adminClient;
    
    // Add admin methods
    supabase.admin = {
      auth: adminClient.auth.admin
    };
    
    console.log('✅ Supabase client initialized with admin capabilities');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    process.exit(1);
  }
};

// Test the database connection
const testDatabaseConnection = async () => {
  console.log('🔌 Testing database connection...');
  
  try {
    // Test a simple query
    const { data, error, status } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection test failed:');
      console.error('   - Status:', status);
      console.error('   - Error:', error);
      console.error('   - Hint: Check if the database tables exist and are accessible');
      return false;
    }
    
    console.log('✅ Successfully connected to the database');
    console.log(`   - Users table: ${data ? 'Exists' : 'Not found'}`);
    console.log(`   - User count: ${data ? data.length : 0}`);
    return true;
    
  } catch (error) {
    console.error('❌ Exception while testing database connection:', error);
    return false;
  }
};

// Initialize Supabase and test connection
const initialize = async () => {
  try {
    initializeSupabase();
    
    // Run connection tests
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to establish database connection. Please check your configuration.');
      console.log('\nTroubleshooting tips:');
      console.log('1. Verify your Supabase project is running and accessible');
      console.log('2. Check that the database tables exist and are properly configured');
      console.log('3. Ensure your IP is whitelisted in Supabase if using IP restrictions');
      console.log('4. Check the network connection to Supabase');
      console.log('5. Verify the service role key has the correct permissions\n');
      
      // Don't exit in development to allow for debugging
      if (process.env.NODE_ENV !== 'development') {
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Error initializing Supabase client:', error);
    console.error('Please check your Supabase URL and key in the .env file');
    process.exit(1);
  }
};

// Run the initialization
initialize();

// Simple logging for database operations
const originalFrom = supabase.from;
supabase.from = function(table) {
  console.log(`🔍 Executing query on ${table}`);
  return originalFrom.apply(this, [table]);
};

module.exports = supabase;
