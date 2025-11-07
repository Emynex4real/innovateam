-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    status TEXT NOT NULL DEFAULT 'successful' CHECK (status IN ('pending', 'successful', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_email ON public.transactions(user_email);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to access all data
CREATE POLICY IF NOT EXISTS "Service role can access all transactions" ON public.transactions
    FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow authenticated users to see their own transactions
CREATE POLICY IF NOT EXISTS "Users can view own transactions" ON public.transactions
    FOR SELECT USING (user_email = auth.jwt() ->> 'email');

-- Insert some test data
INSERT INTO public.transactions (user_email, description, amount, type, status) VALUES
('admin@example.com', 'Initial wallet funding', 1000.00, 'credit', 'successful'),
('user@example.com', 'Course purchase', 50.00, 'debit', 'successful'),
('test@example.com', 'Wallet top-up', 500.00, 'credit', 'successful')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON public.transactions TO service_role;
GRANT SELECT ON public.transactions TO authenticated;