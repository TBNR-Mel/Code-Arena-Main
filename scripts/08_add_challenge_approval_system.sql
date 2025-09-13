-- Add approval status and submission tracking to challenges table
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_submitted_by ON challenges(submitted_by);

-- Update RLS policies to handle pending challenges
DROP POLICY IF EXISTS "Users can view approved challenges" ON challenges;
CREATE POLICY "Users can view approved challenges" ON challenges
    FOR SELECT USING (status = 'approved');

-- Allow users to insert their own challenge submissions
CREATE POLICY "Users can submit challenges" ON challenges
    FOR INSERT WITH CHECK (auth.uid() = submitted_by AND status = 'pending');

-- Allow users to view their own submitted challenges
CREATE POLICY "Users can view their own submissions" ON challenges
    FOR SELECT USING (auth.uid() = submitted_by);

-- Update existing challenges to have approved status
UPDATE challenges SET status = 'approved' WHERE status IS NULL;
