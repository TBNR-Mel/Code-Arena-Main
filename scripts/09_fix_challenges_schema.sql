-- Add missing columns to challenges table
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS concept TEXT,
ADD COLUMN IF NOT EXISTS starter_code TEXT,
ADD COLUMN IF NOT EXISTS solution TEXT,
ADD COLUMN IF NOT EXISTS test_cases JSONB DEFAULT '[]'::jsonb;

-- Update existing challenges to have default values
UPDATE challenges 
SET 
  concept = COALESCE(concept, 'Basic Programming'),
  starter_code = COALESCE(starter_code, '// Write your solution here'),
  solution = COALESCE(solution, '// Solution not provided'),
  test_cases = COALESCE(test_cases, '[]'::jsonb)
WHERE concept IS NULL OR starter_code IS NULL OR solution IS NULL OR test_cases IS NULL;

-- Make sure the columns are not null going forward
ALTER TABLE challenges 
ALTER COLUMN concept SET NOT NULL,
ALTER COLUMN starter_code SET NOT NULL,
ALTER COLUMN solution SET NOT NULL,
ALTER COLUMN test_cases SET NOT NULL;
