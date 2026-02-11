const { createClient } = require('@supabase/supabase-js');

// Validate required environment variables
const validateEnvVars = () => {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_JWT_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    const error = new Error(`Missing required Supabase environment variables: ${missingVars.join(', ')}`);
    error.code = 'MISSING_ENV_VARS';
    error.missingVars = missingVars;
    throw error;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Supabase Configuration:');
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
  console.error('Failed to initialize Supabase client:', error.message);
  if (error.code === 'MISSING_ENV_VARS') {
    console.error('   Missing variables:', error.missingVars.join(', '));
  }
  throw error;
}

// Shared client options
const baseOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
    storage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    }
  },
  global: {
    headers: {
      'x-application-name': 'innovateam-backend',
      'x-client-info': 'innovateam/1.0.0',
      'Connection': 'keep-alive'
    },
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000)
      });
    }
  },
  db: { schema: 'public' },
  realtime: { eventsPerSecond: 10 }
};

let anonClient;
let adminClient;

const initializeSupabase = () => {
  try {
    // Anon client - respects RLS, used for user-facing queries
    anonClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      baseOptions
    );

    if (process.env.SUPABASE_KEY === process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('WARNING: SUPABASE_KEY and SUPABASE_SERVICE_ROLE_KEY are the same. This is not recommended for production.');
    }

    // Admin client - bypasses RLS, used ONLY for admin operations
    adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        ...baseOptions,
        auth: {
          ...baseOptions.auth,
          storageKey: 'sb-admin-token',
        },
        global: {
          ...baseOptions.global,
          headers: {
            ...baseOptions.global.headers,
            'x-application-name': 'innovateam-backend-admin',
            'x-client-info': 'innovateam/1.0.0-admin',
            'x-request-origin': 'server-side'
          }
        }
      }
    );

    console.log('Supabase clients initialized (anon + admin)');
    return true;

  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    process.exit(1);
  }
};

// Test the database connection
const testDatabaseConnection = async () => {
  try {
    const { data, error, status } = await adminClient
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Database connection test failed:', { status, error });
      return false;
    }

    console.log('Database connected successfully');
    return true;

  } catch (error) {
    console.error('Exception while testing database connection:', error);
    return false;
  }
};

// Initialize
const initialize = async () => {
  try {
    initializeSupabase();
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
      console.error('Failed to establish database connection. Check your configuration.');
      if (process.env.NODE_ENV !== 'development') {
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    process.exit(1);
  }
};

initialize();

// Retry wrapper for queries - applies to admin client only
// (admin client is used by existing code via default export for backward compat)
const wrapWithRetry = (client) => {
  const originalFrom = client.from.bind(client);
  client.from = function(table) {
    const builder = originalFrom(table);
    const originalMethods = {};

    ['select', 'insert', 'update', 'delete', 'upsert'].forEach(method => {
      if (!builder[method]) return;
      originalMethods[method] = builder[method];
      builder[method] = function(...args) {
        const query = originalMethods[method].apply(this, args);
        const originalThen = query.then;

        query.then = async function(resolve, reject) {
          let retries = 2;
          while (retries >= 0) {
            try {
              return await originalThen.call(this, resolve, reject);
            } catch (error) {
              if (retries === 0 || !error.message?.includes('fetch failed')) throw error;
              retries--;
              // Exponential backoff: 300ms, 600ms
              await new Promise(r => setTimeout(r, 300 * Math.pow(2, 2 - retries)));
            }
          }
        };
        return query;
      };
    });

    return builder;
  };
};

wrapWithRetry(adminClient);

// Default export: admin client (backward compatible with all 60+ existing imports)
// MIGRATION NOTE: New code should use supabaseAdmin only for admin operations
// and use createUserClient(jwt) for user-facing queries with RLS.
module.exports = adminClient;
module.exports.supabaseAdmin = adminClient;
module.exports.supabaseAnon = anonClient;

// Helper: create a per-request client that enforces RLS for the given user JWT.
// Usage: const userDb = createUserClient(req.headers.authorization.split(' ')[1]);
module.exports.createUserClient = (jwt) => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      ...baseOptions,
      global: {
        ...baseOptions.global,
        headers: {
          ...baseOptions.global.headers,
          Authorization: `Bearer ${jwt}`
        }
      }
    }
  );
};
