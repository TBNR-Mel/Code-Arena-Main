-- Create challenges table (static reference data)
CREATE TABLE IF NOT EXISTS public.challenges (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('very easy', 'easy', 'medium', 'hard', 'expert')),
  language TEXT NOT NULL CHECK (language IN ('javascript', 'python', 'java', 'c++')),
  tags TEXT[] DEFAULT '{}',
  examples TEXT[] DEFAULT '{}',
  notes TEXT[] DEFAULT '{}',
  xp_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- No RLS needed - this is public read-only data
-- Insert the challenge data
INSERT INTO public.challenges (id, title, description, difficulty, language, tags, examples, notes, xp_reward) VALUES
(1, 'Return the Sum of Two Numbers', 'Create a function that takes two numbers as arguments and returns their sum.', 'very easy', 'javascript', 
 ARRAY['geometry', 'maths', 'numbers'], 
 ARRAY['addition(3, 2) → 5', 'addition(-3, -6) → -9', 'addition(7, 3) → 10'],
 ARRAY['Don''t forget to return the result.', 'If you get stuck on a challenge, find help by tapping the help button.'], 10),

(2, 'Area of a Triangle', 'Write a function that takes the base and height of a triangle and return its area.', 'very easy', 'javascript',
 ARRAY['geometry', 'maths', 'numbers'],
 ARRAY['triArea(2, 3) → 3', 'triArea(7, 4) → 14', 'triArea(10, 10) → 50'],
 ARRAY['The area of a triangle is: (base * height) / 2', 'Don''t forget to return the result.'], 10),

(3, 'Convert Minutes into Seconds', 'Write a function that takes an integer minutes and converts it to seconds.', 'very easy', 'javascript',
 ARRAY['maths', 'numbers'],
 ARRAY['convert(5) → 300', 'convert(3) → 180', 'convert(2) → 120'],
 ARRAY['There are 60 seconds in a minute.', 'Don''t forget to return the result.'], 10),

(4, 'Find the Maximum Number in an Array', 'Create a function that finds and returns the maximum number in a given array.', 'easy', 'javascript',
 ARRAY['arrays', 'maths'],
 ARRAY['findMax([1, 2, 3]) → 3', 'findMax([-1, 0, 5]) → 5', 'findMax([10]) → 10'],
 ARRAY['You can use Math.max or iterate through the array.', 'Handle empty arrays if needed, but assume non-empty for simplicity.'], 15),

(5, 'Check if a String is a Palindrome', 'Write a function that checks if a given string is a palindrome.', 'medium', 'python',
 ARRAY['strings', 'logic'],
 ARRAY['is_palindrome(''racecar'') → True', 'is_palindrome(''hello'') → False', 'is_palindrome(''a'') → True'],
 ARRAY['A palindrome reads the same forwards and backwards.', 'Ignore case and non-alphanumeric characters if advanced, but keep simple.'], 25),

(6, 'Factorial of a Number', 'Compute the factorial of a given number.', 'easy', 'java',
 ARRAY['maths', 'recursion'],
 ARRAY['factorial(5) → 120', 'factorial(0) → 1', 'factorial(3) → 6'],
 ARRAY['Factorial of n is n * (n-1) * ... * 1.', 'Use recursion or a loop.'], 15),

(7, 'Fibonacci Sequence', 'Generate the Fibonacci sequence up to a given number.', 'medium', 'javascript',
 ARRAY['maths', 'sequences'],
 ARRAY['fib(5) → [0, 1, 1, 2, 3, 5]', 'fib(3) → [0, 1, 1, 2]', 'fib(0) → []'],
 ARRAY['Fibonacci: each number is the sum of the two preceding ones.', 'Start with 0 and 1.'], 25),

(8, 'Sort an Array', 'Implement a function to sort an array in ascending order.', 'medium', 'python',
 ARRAY['arrays', 'sorting'],
 ARRAY['sort_array([3, 1, 2]) → [1, 2, 3]', 'sort_array([5]) → [5]', 'sort_array([]) → []'],
 ARRAY['You can use built-in sort or implement bubble/insertion sort.', 'Handle numbers or strings as needed.'], 25),

(9, 'Binary Search', 'Implement binary search on a sorted array.', 'hard', 'java',
 ARRAY['arrays', 'searching'],
 ARRAY['binarySearch([1,2,3,4], 3) → 2', 'binarySearch([1,2], 5) → -1', 'binarySearch([], 1) → -1'],
 ARRAY['Binary search halves the search interval each time.', 'Assume the array is sorted.'], 40),

(10, 'Count Vowels in a String', 'Count the number of vowels in a given string.', 'very easy', 'javascript',
 ARRAY['strings'],
 ARRAY['countVowels(''hello'') → 2', 'countVowels(''why'') → 0', 'countVowels(''aeiou'') → 5'],
 ARRAY['Vowels are a, e, i, o, u (lowercase and uppercase).', 'Iterate through the string and count.'], 10),

(11, 'Reverse a String', 'Write a function that takes a string and returns it reversed.', 'easy', 'javascript',
 ARRAY['strings'],
 ARRAY['reverseString(''hello'') → ''olleh''', 'reverseString(''world'') → ''dlrow''', 'reverseString('''') → '''''],
 ARRAY['Iterate through the string or use built-in methods.', 'Handle empty strings.'], 15),

(12, 'Check for Prime Number', 'Write a function that checks if a given number is prime.', 'medium', 'javascript',
 ARRAY['maths', 'numbers'],
 ARRAY['isPrime(11) → true', 'isPrime(4) → false', 'isPrime(1) → false'],
 ARRAY['A prime number is only divisible by 1 and itself.', 'Numbers less than 2 are not prime.'], 25),

(13, 'Sum of Array Elements', 'Write a function that returns the sum of all numbers in an array.', 'easy', 'javascript',
 ARRAY['arrays', 'maths'],
 ARRAY['arraySum([1, 2, 3]) → 6', 'arraySum([]) → 0', 'arraySum([-1, 1]) → 0'],
 ARRAY['Use a loop or array methods like reduce.', 'Handle empty arrays.'], 15),

(14, 'Check for Anagram', 'Write a function that checks if two strings are anagrams of each other.', 'medium', 'python',
 ARRAY['strings', 'logic'],
 ARRAY['isAnagram(''listen'', ''silent'') → True', 'isAnagram(''hello'', ''world'') → False', 'isAnagram(''rat'', ''tar'') → True'],
 ARRAY['Anagrams are words with the same characters and frequency, ignoring order.', 'Ignore case for simplicity.'], 25),

(15, 'Find First Non-Repeated Character', 'Write a function that returns the first non-repeated character in a string.', 'medium', 'python',
 ARRAY['strings', 'logic'],
 ARRAY['firstNonRepeated(''swiss'') → ''w''', 'firstNonRepeated(''hello'') → ''h''', 'firstNonRepeated(''aabb'') → None'],
 ARRAY['Use a dictionary or counter to track character frequencies.', 'Return None if no non-repeated character exists.'], 25),

(16, 'Power of a Number', 'Write a function that calculates the power of a number (base raised to exponent).', 'easy', 'python',
 ARRAY['maths', 'numbers'],
 ARRAY['power(2, 3) → 8', 'power(5, 0) → 1', 'power(3, 2) → 9'],
 ARRAY['Use a loop or recursion for calculation.', 'Handle zero exponent (returns 1).'], 15),

(17, 'Hello World', 'Write a program that outputs ''Hello, World!'' to the console.', 'very easy', 'c++',
 ARRAY['basics', 'output'],
 ARRAY['cout << "Hello, World!" << endl;'],
 ARRAY['This is your first C++ program.', 'Use cout for output.'], 10),

(18, 'Simple Calculator', 'Create a basic calculator that can perform addition, subtraction, multiplication, and division.', 'easy', 'c++',
 ARRAY['maths', 'input'],
 ARRAY['calculator(5, 3, ''+'') → 8', 'calculator(10, 2, ''/'') → 5'],
 ARRAY['Handle basic arithmetic operations.', 'Consider division by zero.'], 15),

(19, 'Array Manipulation', 'Write a program that finds the largest and smallest elements in an array.', 'medium', 'c++',
 ARRAY['arrays', 'logic'],
 ARRAY['findMinMax([1, 5, 3, 9, 2]) → {min: 1, max: 9}'],
 ARRAY['Iterate through the array to find min and max.', 'Handle empty arrays appropriately.'], 25)

ON CONFLICT (id) DO NOTHING;
