-- Clean setup script that handles existing objects
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing objects if they exist (in correct order)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_transaction_completed ON public.transactions;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_wallet_balance();
DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TABLE IF EXISTS public.activity_logs;
DROP TABLE IF EXISTS public.course_recommendations;
DROP TABLE IF EXISTS public.purchased_services;
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.services;
DROP TABLE IF EXISTS public.users;

DROP TYPE IF EXISTS service_type;
DROP TYPE IF EXISTS transaction_status;
DROP TYPE IF EXISTS transaction_type;
DROP TYPE IF EXISTS user_role;

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE transaction_type AS ENUM ('credit', 'debit');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE service_type AS ENUM ('result_checker', 'jamb_service', 'course_advisor', 'ai_examiner');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  state_of_origin TEXT,
  role user_role DEFAULT 'student',
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type service_type NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type transaction_type NOT NULL,
  status transaction_status DEFAULT 'pending',
  service_type service_type,
  service_name TEXT,
  description TEXT,
  reference TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchased services table
CREATE TABLE public.purchased_services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  serial_number TEXT,
  pin_number TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course recommendations table
CREATE TABLE public.course_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  jamb_score INTEGER,
  olevel_grades JSONB,
  interests TEXT[],
  recommended_courses JSONB,
  match_percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_purchased_services_user_id ON public.purchased_services(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchased_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own purchased services" ON public.purchased_services FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own purchased services" ON public.purchased_services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own recommendations" ON public.course_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own recommendations" ON public.course_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own activity" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true);

-- Insert default services
INSERT INTO public.services (name, type, price, description) VALUES
('WAEC Result Checker', 'result_checker', 3400.00, 'Check your WAEC results instantly'),
('NECO Result Checker', 'result_checker', 1300.00, 'Check your NECO results instantly'),
('NABTEB Result Checker', 'result_checker', 900.00, 'Check your NABTEB results instantly'),
('NBAIS Result Checker', 'result_checker', 1100.00, 'Check your NBAIS results instantly'),
('WAEC GCE', 'result_checker', 28000.00, 'WAEC GCE registration and results'),
('O-Level Upload', 'jamb_service', 5000.00, 'Upload your O-Level results to JAMB'),
('Admission Letter', 'jamb_service', 3000.00, 'Generate JAMB admission letter'),
('Original Result', 'jamb_service', 2500.00, 'Get original JAMB result'),
('Pin Vending', 'jamb_service', 4000.00, 'Purchase JAMB PIN'),
('CAPS Printing', 'jamb_service', 2000.00, 'Print JAMB CAPS'),
('Course Advisor', 'course_advisor', 0.00, 'AI-powered course recommendations'),
('AI Examiner', 'ai_examiner', 1000.00, 'AI-powered exam preparation');

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update wallet balance
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF NEW.type = 'credit' THEN
      UPDATE public.users 
      SET wallet_balance = wallet_balance + NEW.amount 
      WHERE id = NEW.user_id;
    ELSIF NEW.type = 'debit' THEN
      UPDATE public.users 
      SET wallet_balance = wallet_balance - NEW.amount 
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for wallet balance updates
CREATE TRIGGER on_transaction_completed
  AFTER UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance();