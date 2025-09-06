-- Insert sample challenges
INSERT INTO challenges (title, description, difficulty, tags, language, starter_code, solution, test_cases) VALUES
(
  'Two Sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  'Easy',
  ARRAY['Array', 'Hash Table'],
  'javascript',
  'function twoSum(nums, target) {
    // Your code here
}',
  'function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}',
  '[
    {"input": {"nums": [2,7,11,15], "target": 9}, "expected": [0,1]},
    {"input": {"nums": [3,2,4], "target": 6}, "expected": [1,2]},
    {"input": {"nums": [3,3], "target": 6}, "expected": [0,1]}
  ]'::jsonb
),
(
  'Reverse String',
  'Write a function that reverses a string. The input string is given as an array of characters s.',
  'Easy',
  ARRAY['Two Pointers', 'String'],
  'javascript',
  'function reverseString(s) {
    // Your code here
}',
  'function reverseString(s) {
    let left = 0;
    let right = s.length - 1;
    while (left < right) {
        [s[left], s[right]] = [s[right], s[left]];
        left++;
        right--;
    }
}',
  '[
    {"input": {"s": ["h","e","l","l","o"]}, "expected": ["o","l","l","e","h"]},
    {"input": {"s": ["H","a","n","n","a","h"]}, "expected": ["h","a","n","n","a","H"]}
  ]'::jsonb
),
(
  'Valid Parentheses',
  'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.',
  'Easy',
  ARRAY['String', 'Stack'],
  'javascript',
  'function isValid(s) {
    // Your code here
}',
  'function isValid(s) {
    const stack = [];
    const map = {")": "(", "}": "{", "]": "["};
    
    for (let char of s) {
        if (char in map) {
            if (stack.length === 0 || stack.pop() !== map[char]) {
                return false;
            }
        } else {
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}',
  '[
    {"input": {"s": "()"}, "expected": true},
    {"input": {"s": "()[]{}"}, "expected": true},
    {"input": {"s": "(]"}, "expected": false}
  ]'::jsonb
),
(
  'Maximum Subarray',
  'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
  'Medium',
  ARRAY['Array', 'Dynamic Programming'],
  'javascript',
  'function maxSubArray(nums) {
    // Your code here
}',
  'function maxSubArray(nums) {
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}',
  '[
    {"input": {"nums": [-2,1,-3,4,-1,2,1,-5,4]}, "expected": 6},
    {"input": {"nums": [1]}, "expected": 1},
    {"input": {"nums": [5,4,-1,7,8]}, "expected": 23}
  ]'::jsonb
),
(
  'Climbing Stairs',
  'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
  'Easy',
  ARRAY['Math', 'Dynamic Programming'],
  'javascript',
  'function climbStairs(n) {
    // Your code here
}',
  'function climbStairs(n) {
    if (n <= 2) return n;
    
    let prev2 = 1;
    let prev1 = 2;
    
    for (let i = 3; i <= n; i++) {
        let current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}',
  '[
    {"input": {"n": 2}, "expected": 2},
    {"input": {"n": 3}, "expected": 3},
    {"input": {"n": 5}, "expected": 8}
  ]'::jsonb
);
