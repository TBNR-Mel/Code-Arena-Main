-- Fix the challenges table ID column to be auto-incrementing
-- This will resolve the null ID constraint violation

-- First, let's check if there are any existing records and get the max ID
-- Then set up the ID column as a proper auto-incrementing primary key

-- Create a sequence for the challenges ID if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS challenges_id_seq;

-- Set the ID column to use the sequence and be NOT NULL
ALTER TABLE challenges 
ALTER COLUMN id SET DEFAULT nextval('challenges_id_seq');

-- Make sure the sequence starts from the right number
-- (in case there are existing records)
SELECT setval('challenges_id_seq', COALESCE((SELECT MAX(id) FROM challenges), 0) + 1, false);

-- Ensure the ID column is the primary key
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_pkey;
ALTER TABLE challenges ADD CONSTRAINT challenges_pkey PRIMARY KEY (id);

-- Update the sequence ownership
ALTER SEQUENCE challenges_id_seq OWNED BY challenges.id;
