-- Insert sample challenges
INSERT INTO public.challenges (title, description, difficulty, category, starter_code, solution, test_cases, points) VALUES
(
  'Two Sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  'easy',
  'Arrays',
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
    {"input": [[2,7,11,15], 9], "expected": [0,1]},
    {"input": [[3,2,4], 6], "expected": [1,2]},
    {"input": [[3,3], 6], "expected": [0,1]}
  ]',
  10
),
(
  'Reverse String',
  'Write a function that reverses a string. The input string is given as an array of characters s.',
  'easy',
  'Strings',
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
    return s;
}',
  '[
    {"input": [["h","e","l","l","o"]], "expected": ["o","l","l","e","h"]},
    {"input": [["H","a","n","n","a","h"]], "expected": ["h","a","n","n","a","H"]}
  ]',
  10
),
(
  'Valid Parentheses',
  'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.',
  'medium',
  'Stack',
  'function isValid(s) {
    // Your code here
}',
  'function isValid(s) {
    const stack = [];
    const map = { ")": "(", "}": "{", "]": "[" };
    
    for (let char of s) {
        if (char in map) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}',
  '[
    {"input": ["()"], "expected": true},
    {"input": ["()[]{}"], "expected": true},
    {"input": ["(]"], "expected": false},
    {"input": ["([)]"], "expected": false}
  ]',
  20
);
