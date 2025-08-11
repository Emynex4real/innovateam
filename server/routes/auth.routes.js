const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const router = express.Router();
const supabase = require('../supabaseClient');

// Log Supabase config for debugging
console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Supabase Key:', process.env.SUPABASE_KEY ? 'Set' : 'Not set');

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  validateRequest,
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest,
];

// Helper function to log detailed error information
const logError = (error, context = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.code && { code: error.code }),
      ...(error.status && { status: error.status }),
      ...(error.details && { details: error.details })
    },
    context
  };
  
  console.error('❌ ERROR DETAILS:', JSON.stringify(errorInfo, null, 2));
  return errorInfo;
};

// Routes
router.post('/register', registerValidation, async (req, res, next) => {
  console.log('\n=== REGISTRATION REQUEST RECEIVED ===');
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  
  const { email, password, name, phoneNumber } = req.body;
  const requestId = Math.random().toString(36).substring(2, 10);
  
  console.log(`[${requestId}] Starting registration for:`, { email, name });
  
  // Log the registration attempt with request ID for tracking
  console.log(`\n🔔 [${requestId}] ===== REGISTRATION ATTEMPT =====`);
  console.log(`📝 [${requestId}] Request details:`, { 
    email, 
    name: name ? 'Provided' : 'Not provided',
    phoneNumber: phoneNumber ? 'Provided' : 'Not provided',
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Log environment variables (masking sensitive data)
  console.log(`🔧 [${requestId}] Environment check:`, {
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Not set',
    SUPABASE_KEY: process.env.SUPABASE_KEY ? '*** (set)' : 'Not set',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '*** (set)' : 'Not set',
    JWT_SECRET: process.env.JWT_SECRET ? '*** (set)' : 'Not set',
    DB_CONNECTION: process.env.DATABASE_URL ? 'Set' : 'Not set'
  });
  
  // Log Supabase client configuration
  console.log(`🔧 [${requestId}] Supabase client configuration:`, {
    supabaseUrl: supabase.supabaseUrl,
    supabaseKey: supabase.supabaseKey ? '*** (set)' : 'Not set',
    auth: supabase.auth ? 'Initialized' : 'Not initialized',
    from: supabase.from ? 'Available' : 'Not available',
    tables: supabase.from ? 'Available' : 'Not available',
    admin: supabase.admin ? 'Available' : 'Not available',
    authAdmin: supabase.auth?.admin ? 'Available' : 'Not available'
  });
  
  try {
    // First check if user already exists in auth.users
    console.log(`🔍 [${requestId}] Checking if user exists in auth.users...`);
    let usersList;
    try {
      // Log the Supabase client configuration for debugging
      console.log(`🔧 [${requestId}] Supabase client config:`, {
        url: supabase.supabaseUrl,
        headers: supabase.headers,
        auth: supabase.auth ? 'Initialized' : 'Not initialized',
        from: supabase.from ? 'Available' : 'Not available',
        tables: supabase.from ? 'Available' : 'Not available'
      });
      
      // Test database connection with a simple query
      console.log(`🔍 [${requestId}] Testing database connection...`);
      try {
        const testQuery = await supabase.from('users').select('*').limit(1);
        console.log(`🔍 [${requestId}] Database connection test result:`, testQuery);
        if (testQuery.error) {
          console.error(`❌ [${requestId}] Database connection test failed:`, testQuery.error);
          console.error(`❌ [${requestId}] Error details:`, {
            code: testQuery.error.code,
            details: testQuery.error.details,
            hint: testQuery.error.hint,
            message: testQuery.error.message
          });
          throw new Error(`Database connection failed: ${testQuery.error.message}`);
        }
        console.log(`✅ [${requestId}] Database connection test successful`);
      } catch (dbError) {
        console.error(`❌ [${requestId}] Exception during database test:`, dbError);
        throw new Error(`Database test failed: ${dbError.message}`);
      }
      
      // Now check for existing users
      console.log(`🔍 [${requestId}] ===== STARTING USER EXISTENCE CHECK =====`);
      try {
        // First, check if the supabase client is properly initialized
        console.log(`🔧 [${requestId}] Verifying Supabase client initialization...`);
        
        // Log environment variables (mask sensitive data)
        console.log(`🔧 [${requestId}] Environment variables:`, {
          NODE_ENV: process.env.NODE_ENV,
          SUPABASE_URL: process.env.SUPABASE_URL ? '*** (set)' : 'NOT SET',
          SUPABASE_KEY: process.env.SUPABASE_KEY ? '*** (set)' : 'NOT SET',
          HAS_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          HAS_JWT_SECRET: !!process.env.SUPABASE_JWT_SECRET,
          NODE_PATH: process.env.NODE_PATH,
          NODE_ENV: process.env.NODE_ENV,
          PATH: process.env.PATH ? '*** (set)' : 'NOT SET'
        });
        
        // Log the raw environment for debugging (excluding sensitive data)
        const envVars = Object.keys(process.env).filter(k => 
          !k.toLowerCase().includes('key') && 
          !k.toLowerCase().includes('secret') && 
          !k.toLowerCase().includes('password')
        );
        console.log(`🔧 [${requestId}] Available environment variables:`, envVars);
        
        // Deep check of Supabase client structure
        const clientStructure = {
          isDefined: !!supabase,
          hasAuth: !!supabase?.auth,
          hasAuthAdmin: !!supabase?.auth?.admin,
          authMethods: supabase?.auth ? Object.keys(supabase.auth) : [],
          adminMethods: supabase?.auth?.admin ? Object.keys(supabase.auth.admin) : [],
          supabaseUrl: supabase?.supabaseUrl ? '*** (set)' : 'NOT SET',
          supabaseKey: supabase?.supabaseKey ? '*** (set)' : 'NOT SET',
          functions: Object.keys(supabase || {}).filter(k => typeof supabase[k] === 'function')
        };
        
        console.log(`🔍 [${requestId}] Supabase client structure:`, clientStructure);
        
        if (!supabase) {
          console.error(`❌ [${requestId}] Supabase client is not defined.`);
          console.error(`   - Check if the Supabase client is properly imported`);
          console.error(`   - Verify the Supabase client initialization in supabaseClient.js`);
          throw new Error('Supabase client is not defined. Check your Supabase client initialization.');
        }
        
        if (!supabase.auth) {
          console.error(`❌ [${requestId}] Supabase auth module is not available.`);
          console.error(`  1. Check if the Supabase URL and key in .env are correct`);
          console.error(`  2. Verify network connectivity to ${process.env.SUPABASE_URL}`);
          console.error(`  3. Check if Supabase service is running and accessible`);
          console.error(`  4. Verify the Supabase client version is compatible with the server`);
          
          // Try to get more details about the client
          try {
            console.log(`🔧 [${requestId}] Supabase client URL:`, supabase?.supabaseUrl);
            console.log(`🔧 [${requestId}] Supabase client headers:`, supabase?.headers);
            console.log(`🔧 [${requestId}] Supabase client functions:`, Object.keys(supabase).filter(k => typeof supabase[k] === 'function'));
          } catch (e) {
            console.error(`⚠️ [${requestId}] Error getting client details:`, e.message);
          }
          
          throw new Error('Supabase auth module is not available. The Supabase client may not be properly initialized.');
        }
        
        if (!supabase.auth.admin) {
          console.error(`❌ [${requestId}] ===== SERVICE ROLE KEY ISSUE DETECTED =====`);
          console.error(`❌ [${requestId}] Supabase auth admin module is not available. This is typically due to:`);
          console.error(`  1. Missing or invalid SUPABASE_SERVICE_ROLE_KEY in .env file`);
          console.error(`  2. Service role key doesn't have the correct permissions in Supabase`);
          console.error(`  3. Service role key is not properly passed to the Supabase client`);
          console.error(`  4. Version mismatch between @supabase/supabase-js and @supabase/auth-helpers`);
          
          console.error(`🔧 [${requestId}] Current configuration:`);
          console.error(`   - NODE_ENV: ${process.env.NODE_ENV}`);
          console.error(`   - SUPABASE_URL: ${process.env.SUPABASE_URL ? '*** (set)' : 'NOT SET'}`);
          console.error(`   - SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '*** (set)' : 'NOT SET'}`);
          console.error(`   - SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '*** (set)' : 'NOT SET'}`);
          
          // Try to get more details about the client
          try {
            console.log(`🔧 [${requestId}] Supabase client URL:`, supabase?.supabaseUrl);
            console.log(`🔧 [${requestId}] Supabase client headers:`, supabase?.headers);
            console.log(`🔧 [${requestId}] Supabase client version:`, supabase?.supabaseJsVersion);
            
            // Try to list available methods on the client
            if (supabase) {
              const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(supabase));
              console.log(`🔧 [${requestId}] Available methods on supabase client:`, methods);
            }
            
            if (supabase.auth) {
              const authMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(supabase.auth));
              console.log(`🔧 [${requestId}] Available methods on supabase.auth:`, authMethods);
            }
          } catch (e) {
            console.error(`⚠️ [${requestId}] Error getting client details:`, e.message);
          }
          
          throw new Error('Supabase auth admin module is not available. The service role key may be missing or invalid.');
        }
        
        // Log the available methods on the admin object for debugging
        console.log(`🔧 [${requestId}] Supabase client structure:`, {
          hasAuth: !!supabase.auth,
          hasAuthAdmin: !!supabase.auth.admin,
          authMethods: supabase.auth ? Object.keys(supabase.auth) : [],
          adminMethods: supabase.auth?.admin ? Object.keys(supabase.auth.admin) : []
        });
        
        // Log the current user session to verify authentication
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          console.log(`🔧 [${requestId}] Current session:`, {
            hasSession: !!sessionData?.session,
            sessionError: sessionError?.message,
            sessionUser: sessionData?.session?.user
          });
        } catch (sessionCheckError) {
          console.error(`⚠️ [${requestId}] Error checking session:`, sessionCheckError.message);
        }
        
        // Try to list users with a timeout to prevent hanging
        console.log(`🔍 [${requestId}] Attempting to list users...`);
        const listUsersPromise = supabase.auth.admin.listUsers();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('List users operation timed out after 10 seconds')), 10000)
        );
        
        console.time(`[${requestId}] listUsers`);
        const result = await Promise.race([listUsersPromise, timeoutPromise]);
        console.timeEnd(`[${requestId}] listUsers`);
        
        // Destructure after the Promise.race to handle potential timeouts
        const { data, error } = result || {};
        
        if (error) {
          console.error(`❌ [${requestId}] Error querying auth.users:`, {
            code: error.code,
            message: error.message,
            status: error.status,
            details: error.details,
            hint: error.hint,
            stack: error.stack
          });
          
          // Check for common error patterns
          if (error.message.includes('JWT')) {
            console.error(`❌ [${requestId}] JWT Error: Check your JWT_SECRET and service_role_key`);
          }
          
          if (error.message.includes('permission') || error.message.includes('role')) {
            console.error(`❌ [${requestId}] Permission Error: Check if the service_role_key has admin privileges`);
          }
          
          const errorInfo = logError(error, { 
            requestId,
            context: 'Error checking existing users',
            operation: 'auth.admin.listUsers',
            details: { 
              email,
              errorCode: error.code,
              errorMessage: error.message,
              errorStatus: error.status,
              errorDetails: error.details,
              errorHint: error.hint
            }
          });
          
          return res.status(500).json({ 
            success: false, 
            error: 'Error checking existing users',
            requestId,
            errorId: errorInfo.errorId,
            debug: process.env.NODE_ENV === 'development' ? {
              code: error.code,
              message: error.message,
              status: error.status,
              details: error.details,
              hint: error.hint
            } : undefined
          });
        }
        usersList = data.users;
      } catch (listUsersError) {
        const errorInfo = logError(listUsersError, {
          requestId,
          email,
          context: 'Exception when listing users from auth',
          operation: 'auth.admin.listUsers'
        });
        
        return res.status(500).json({
          success: false,
          error: 'Server error',
          details: 'Failed to check existing users',
          code: 'AUTH_LIST_USERS_EXCEPTION',
          requestId,
          debug: process.env.NODE_ENV === 'development' ? errorInfo : undefined
        });
      }
    } catch (listUsersError) {
      const errorInfo = logError(listUsersError, {
        context: 'Exception when listing users from auth',
        requestId,
        email,
        operation: 'auth.listUsers'
      });
      
      return res.status(500).json({
        success: false,
        error: 'Server error',
        details: 'Failed to check existing users',
        code: 'AUTH_LIST_USERS_EXCEPTION',
        requestId,
        debug: process.env.NODE_ENV === 'development' ? errorInfo : undefined
      });
    // Check public.users table as well
    console.log(`🔍 [${requestId}] Checking public.users table...`);
    let existingUser;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email, id, created_at')
        .eq('email', email)
        .maybeSingle();
        
      if (error) {
        const errorInfo = logError(error, {
          context: 'Failed to query public.users table',
          requestId,
          email,
          operation: 'public.users.select'
        });
        
        return res.status(500).json({
          success: false,
          error: 'Database error',
          details: 'Failed to check existing users',
          code: 'DB_CHECK_ERROR',
          requestId,
          debug: process.env.NODE_ENV === 'development' ? errorInfo : undefined
        });
      }
      
      existingUser = data;
    } catch (dbError) {
      const errorInfo = logError(dbError, {
        context: 'Exception when querying public.users table',
        requestId,
        email,
        operation: 'public.users.select'
      });
      
      return res.status(500).json({
        success: false,
        error: 'Database error',
        details: 'Failed to check existing users',
        code: 'DB_QUERY_EXCEPTION',
        requestId,
        debug: process.env.NODE_ENV === 'development' ? errorInfo : undefined
      });
    }
    
    if (existingUser) {
      const errorMessage = `Data inconsistency: Email ${email} exists in public.users but not in auth.users`;
      console.error(`❌ [${requestId}] ${errorMessage}`, { userId: existingUser.id });
      
      // Log the full user data in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('🔍 Inconsistent user data:', JSON.stringify(existingUser, null, 2));
      }
      
      return res.status(500).json({
        success: false,
        error: 'Account error',
        details: 'There was an issue with your account. Please contact support.',
        code: 'ACCOUNT_INCONSISTENCY',
        requestId,
        debug: process.env.NODE_ENV === 'development' ? {
          message: errorMessage,
          userId: existingUser.id,
          createdAt: existingUser.created_at
        } : undefined
      });
    }

    // Create auth user with detailed error handling and logging
    console.log(`🚀 [${requestId}] Creating auth user in Supabase Auth...`);
    let authResponse;
    try {
      console.log(`🔑 [${requestId}] Attempting to create user in Supabase Auth...`);
      
      const signUpPayload = { 
        email, 
        password,
        options: {
          data: {
            full_name: name,
            name: name,
            phone_number: phoneNumber || null,
            email_confirm: true // Bypass email confirmation for now
          },
          emailRedirectTo: process.env.SITE_URL || 'http://localhost:3000/auth/confirm'
        }
      };
      
      console.log(`🔑 [${requestId}] Attempting signup with payload:`, {
        email,
        hasName: !!name,
        hasPhone: !!phoneNumber,
        passwordLength: password ? '••••••••' : 'Not provided'
      });
      
      authResponse = await supabase.auth.signUp(signUpPayload);
      
      // Log the response (without sensitive data)
      console.log(`🔑 [${requestId}] Auth signup response received:`, {
        hasUser: !!authResponse.data?.user,
        hasSession: !!authResponse.data?.session,
        hasError: !!authResponse.error,
        errorMessage: authResponse.error?.message || 'No error'
      });
      
      if (authResponse.error) {
        const errorContext = {
          requestId,
          email,
          errorType: authResponse.error.name,
          status: authResponse.error.status,
          errorCode: authResponse.error.code
        };
        
        const errorInfo = logError(authResponse.error, {
          ...errorContext,
          context: 'Auth signup failed',
          operation: 'auth.signUp'
        });
        
        // Handle specific error cases with appropriate responses
        if (authResponse.error.message.toLowerCase().includes('already registered') || 
            authResponse.error.message.toLowerCase().includes('already in use')) {
          return res.status(400).json({ 
            success: false, 
            error: 'Email already registered',
            details: 'This email is already registered. Please use a different email or try logging in.',
            code: 'EMAIL_ALREADY_EXISTS',
            requestId
          });
        }
        
        if (authResponse.error.message.toLowerCase().includes('password')) {
          return res.status(400).json({
            success: false,
            error: 'Invalid password',
            details: 'The password does not meet the requirements. It must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.',
            code: 'INVALID_PASSWORD',
            requestId
          });
        }
        
        // Generic error response for auth failures
        return res.status(400).json({ 
          success: false, 
          error: 'Authentication failed',
          details: authResponse.error.message || 'Failed to create user account',
          code: authResponse.error.status || 'AUTH_ERROR',
          requestId,
          debug: process.env.NODE_ENV === 'development' ? errorInfo : undefined
        });
      }
    } catch (authError) {
      const errorInfo = logError(authError, {
        requestId,
        email,
        context: 'Critical error during auth signup',
        operation: 'auth.signUp',
        errorType: authError.name,
        code: authError.code
      });
      
      return res.status(500).json({
        success: false,
        error: 'Authentication service unavailable',
        details: 'We encountered an issue while creating your account. Please try again later.',
        code: 'AUTH_SERVICE_ERROR',
        requestId,
        debug: process.env.NODE_ENV === 'development' ? errorInfo : undefined
      });
    }
    
    const { data, error } = authResponse;

    console.log(`✅ [${requestId}] Auth user created successfully:`, { 
      userId: data.user?.id,
      email: data.user?.email,
      isEmailConfirmed: data.user?.email_confirmed_at ? true : false
    });
    
    // Create user profile in the database
    if (data.user) {
      const userId = data.user.id;
      const userProfile = { 
        id: userId, 
        email, 
        name, 
        phone_number: phoneNumber, 
        role: 'user', 
        status: 'active',
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString()
      };
      
      console.log(`📝 [${requestId}] Creating user profile in database...`, { 
        userId, 
        email,
        hasName: !!name,
        hasPhone: !!phoneNumber
      });
      
      let profileData;
      try {
        const { data: insertedData, error: profileError } = await supabase
          .from('users')
          .insert([userProfile])
          .select()
          .single();
          
        if (profileError) {
          // Log the detailed error
          const errorInfo = logError(profileError, {
            requestId,
            userId,
            email,
            context: 'Failed to create user profile',
            operation: 'public.users.insert',
            errorType: profileError.code || 'PROFILE_CREATION_ERROR'
          });
          
          // Attempt to clean up the auth user if profile creation fails
          console.log(`🔄 [${requestId}] Attempting to clean up auth user due to profile creation failure...`);
          try {
            await supabase.auth.admin.deleteUser(userId);
            console.log(`✅ [${requestId}] Successfully cleaned up auth user after profile creation failure`);
          } catch (cleanupError) {
            console.error(`❌ [${requestId}] Failed to clean up auth user after profile creation failure:`, cleanupError);
            errorInfo.cleanupError = {
              message: cleanupError.message,
              code: cleanupError.code
            };
          }
          
          return res.status(500).json({ 
            success: false, 
            error: 'Profile creation failed',
            details: 'We encountered an issue while setting up your account. Please try again or contact support.',
            code: 'PROFILE_CREATION_ERROR',
            requestId,
            debug: process.env.NODE_ENV === 'development' ? errorInfo : undefined
          });
        }
        
        profileData = insertedData;
        console.log(`✅ [${requestId}] User profile created successfully:`, { 
          userId: profileData.id,
          email: profileData.email
        });
        
      } catch (dbError) {
        const errorInfo = logError(dbError, {
          requestId,
          userId,
          email,
          context: 'Exception during profile creation',
          operation: 'public.users.insert',
          errorType: 'DB_PROFILE_CREATION_EXCEPTION'
        });
        
        // Attempt to clean up the auth user
        console.log(`🔄 [${requestId}] Attempting to clean up auth user after unhandled exception...`);
        try {
          await supabase.auth.admin.deleteUser(userId);
          console.log(`✅ [${requestId}] Successfully cleaned up auth user after exception`);
        } catch (cleanupError) {
          console.error(`❌ [${requestId}] Failed to clean up auth user after exception:`, cleanupError);
          errorInfo.cleanupError = {
            message: cleanupError.message,
            code: cleanupError.code
          };
        }
        
        return res.status(500).json({
          success: false,
          error: 'Account setup failed',
          details: 'We encountered an unexpected issue while setting up your account. Please try again later.',
          code: 'ACCOUNT_SETUP_ERROR',
          requestId,
          debug: process.env.NODE_ENV === 'development' ? errorInfo : undefined
        });
      }
      
      // If we have a session (email confirmations might be off), return tokens
      if (data.session) {
        console.log(`🔑 [${requestId}] Registration successful, returning session`);
        return res.json({ 
          success: true, 
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name,
            phoneNumber: data.user.user_metadata?.phone_number
          },
          token: data.session.access_token, 
          refreshToken: data.session.refresh_token,
          requestId
        });
      }
      
      // If no session (email confirmation required)
      console.log(`📧 [${requestId}] Registration successful, email confirmation required`);
      return res.json({ 
        success: true, 
        message: 'Registration successful! Please check your email to confirm your account.',
        requiresConfirmation: true,
        requestId
      });
    }

    // If we get here, something unexpected went wrong with user creation
    const unexpectedError = error || new Error('Unknown error during registration');
    const errorId = `err_${Math.random().toString(36).substring(2, 10)}`;

    // Log the error with detailed context
    logError(unexpectedError, {
      requestId,
      errorId,
      context: 'Unexpected error during registration',
      operation: 'auth.registration',
      errorType: unexpectedError.name || 'UNKNOWN_ERROR',
      stack: unexpectedError.stack,
      errorDetails: unexpectedError.details || {},
      email: email || 'unknown',
      hasAuthUser: !!userData?.user,
      hasSession: !!userData?.session
    });

    // Send error response
    return res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: 'We encountered an unexpected error while processing your registration. Please try again later.',
      code: 'REGISTRATION_FAILED',
      requestId,
      errorId,
      debug: process.env.NODE_ENV === 'development' ? {
        message: unexpectedError.message,
        code: unexpectedError.code,
        name: unexpectedError.name
      } : undefined
    });
  }
} catch (error) {
  console.error('Unexpected registration error:', error);
  res.status(500).json({
    success: false,
    error: 'Server error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
  });
}
});

router.post('/login', loginValidation, async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ success: false, error: error.message });
    }
    res.json({ success: true, user: data.user, token: data.session.access_token, refreshToken: data.session.refresh_token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    await supabase.auth.signOut();
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/validate', async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      return res.status(401).json({ success: false, error: error.message });
    }
    res.json({ success: true, valid: true, user: data.user });
  } catch (error) {
    console.error('Validate token error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, error: 'No refresh token provided' });
  }
  try {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error) {
      return res.status(401).json({ success: false, error: error.message });
    }
    res.json({ success: true, token: data.session.access_token, refreshToken: data.session.refresh_token, user: data.user });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/api/profile/me', async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  try {
    const { data: user, error: authError } = await supabase.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ success: false, error: authError.message });
    }
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.user.id)
      .single();
    if (profileError || !profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/api/profile', async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  const { name, phone_number } = req.body;
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  try {
    const { data: user, error: authError } = await supabase.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ success: false, error: authError.message });
    }
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([{ id: user.user.id, email: user.user.email, name, phone_number, role: 'user', status: 'active' }])
      .select()
      .single();
    if (profileError) {
      return res.status(400).json({ success: false, error: profileError.message });
    }
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;