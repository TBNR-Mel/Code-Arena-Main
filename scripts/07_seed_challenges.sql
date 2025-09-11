-- Seed the challenges table with initial data
INSERT INTO challenges (title, description, difficulty, language, tags, concept, starter_code, solution) VALUES
-- JavaScript challenges
('Return the Sum of Two Numbers', 'Create a function that takes two numbers as arguments and returns their sum.', 'very easy', 'javascript', ARRAY['geometry', 'maths', 'numbers'], 'Basic Functions', 'function sum(a, b) {\n  // Your code here\n}', 'function sum(a, b) {\n  return a + b;\n}'),

('Area of a Triangle', 'Write a function that takes the base and height of a triangle and return its area.', 'very easy', 'javascript', ARRAY['geometry', 'maths', 'numbers'], 'Basic Functions', 'function triangleArea(base, height) {\n  // Your code here\n}', 'function triangleArea(base, height) {\n  return (base * height) / 2;\n}'),

('Convert Minutes into Seconds', 'Write a function that takes an integer minutes and converts it to seconds.', 'very easy', 'javascript', ARRAY['maths', 'numbers'], 'Basic Functions', 'function convert(minutes) {\n  // Your code here\n}', 'function convert(minutes) {\n  return minutes * 60;\n}'),

('Find the Maximum Number in an Array', 'Create a function that finds and returns the maximum number in a given array.', 'easy', 'javascript', ARRAY['arrays', 'maths'], 'Arrays', 'function findMax(arr) {\n  // Your code here\n}', 'function findMax(arr) {\n  return Math.max(...arr);\n}'),

('Count Vowels in a String', 'Count the number of vowels in a given string.', 'very easy', 'javascript', ARRAY['strings'], 'Strings', 'function countVowels(str) {\n  // Your code here\n}', 'function countVowels(str) {\n  const vowels = "aeiouAEIOU";\n  return str.split("").filter(char => vowels.includes(char)).length;\n}'),

('Reverse a String', 'Write a function that takes a string and returns it reversed.', 'easy', 'javascript', ARRAY['strings'], 'Strings', 'function reverseString(str) {\n  // Your code here\n}', 'function reverseString(str) {\n  return str.split("").reverse().join("");\n}'),

('Check for Prime Number', 'Write a function that checks if a given number is prime.', 'medium', 'javascript', ARRAY['maths', 'numbers'], 'Logic', 'function isPrime(num) {\n  // Your code here\n}', 'function isPrime(num) {\n  if (num < 2) return false;\n  for (let i = 2; i <= Math.sqrt(num); i++) {\n    if (num % i === 0) return false;\n  }\n  return true;\n}'),

('Sum of Array Elements', 'Write a function that returns the sum of all numbers in an array.', 'easy', 'javascript', ARRAY['arrays', 'maths'], 'Arrays', 'function sumArray(arr) {\n  // Your code here\n}', 'function sumArray(arr) {\n  return arr.reduce((sum, num) => sum + num, 0);\n}'),

('Fibonacci Sequence', 'Generate the Fibonacci sequence up to a given number.', 'medium', 'javascript', ARRAY['maths', 'sequences'], 'Recursion', 'function fibonacci(n) {\n  // Your code here\n}', 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}'),

-- Python challenges
('Check if a String is a Palindrome', 'Write a function that checks if a given string is a palindrome.', 'medium', 'python', ARRAY['strings', 'logic'], 'Strings', 'def is_palindrome(s):\n    # Your code here\n    pass', 'def is_palindrome(s):\n    s = s.lower().replace(" ", "")\n    return s == s[::-1]'),

('Sort an Array', 'Implement a function to sort an array in ascending order.', 'medium', 'python', ARRAY['arrays', 'sorting'], 'Sorting', 'def sort_array(arr):\n    # Your code here\n    pass', 'def sort_array(arr):\n    return sorted(arr)'),

('Check for Anagram', 'Write a function that checks if two strings are anagrams of each other.', 'medium', 'python', ARRAY['strings', 'logic'], 'Strings', 'def is_anagram(str1, str2):\n    # Your code here\n    pass', 'def is_anagram(str1, str2):\n    return sorted(str1.lower()) == sorted(str2.lower())'),

('Find First Non-Repeated Character', 'Write a function that returns the first non-repeated character in a string.', 'medium', 'python', ARRAY['strings', 'logic'], 'Strings', 'def first_non_repeated(s):\n    # Your code here\n    pass', 'def first_non_repeated(s):\n    char_count = {}\n    for char in s:\n        char_count[char] = char_count.get(char, 0) + 1\n    for char in s:\n        if char_count[char] == 1:\n            return char\n    return None'),

('Power of a Number', 'Write a function that calculates the power of a number (base raised to exponent).', 'easy', 'python', ARRAY['maths', 'numbers'], 'Basic Functions', 'def power(base, exponent):\n    # Your code here\n    pass', 'def power(base, exponent):\n    return base ** exponent'),

-- Java challenges
('Factorial of a Number', 'Compute the factorial of a given number.', 'easy', 'java', ARRAY['maths', 'recursion'], 'Recursion', 'public static int factorial(int n) {\n    // Your code here\n}', 'public static int factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}'),

('Binary Search', 'Implement binary search on a sorted array.', 'hard', 'java', ARRAY['arrays', 'searching'], 'Searching', 'public static int binarySearch(int[] arr, int target) {\n    // Your code here\n}', 'public static int binarySearch(int[] arr, int target) {\n    int left = 0, right = arr.length - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}'),

-- C++ challenges
('Hello World', 'Write a program that outputs ''Hello, World!'' to the console.', 'very easy', 'c++', ARRAY['basics', 'output'], 'Basic I/O', '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}', '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}'),

('Simple Calculator', 'Create a basic calculator that can perform addition, subtraction, multiplication, and division.', 'easy', 'c++', ARRAY['maths', 'input'], 'Basic I/O', '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}', '#include <iostream>\nusing namespace std;\n\nint main() {\n    double a, b;\n    char op;\n    cout << "Enter two numbers and an operator: ";\n    cin >> a >> b >> op;\n    switch(op) {\n        case ''+'':\n            cout << a + b << endl;\n            break;\n        case ''-'':\n            cout << a - b << endl;\n            break;\n        case ''*'':\n            cout << a * b << endl;\n            break;\n        case ''/'':\n            cout << a / b << endl;\n            break;\n    }\n    return 0;\n}'),

('Array Manipulation', 'Write a program that finds the largest and smallest elements in an array.', 'medium', 'c++', ARRAY['arrays', 'logic'], 'Arrays', '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}', '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<int> arr = {3, 1, 4, 1, 5, 9, 2, 6};\n    int minVal = *min_element(arr.begin(), arr.end());\n    int maxVal = *max_element(arr.begin(), arr.end());\n    cout << "Min: " << minVal << ", Max: " << maxVal << endl;\n    return 0;\n}');
