"use client"

import { CompletionModal } from "@/components/completion-modal"
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, HelpCircle, Play, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { XPDisplay } from "@/components/xp-display";
import { isChallengeCompleted, markChallengeComplete } from "@/lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useMediaQuery } from 'react-responsive'
import dynamic from "next/dynamic";
import { getNextChallenge } from "@/lib/storage";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-80 md:h-96 bg-muted rounded-md flex items-center justify-center">
      <div className="text-muted-foreground">Loading editor...</div>
    </div>
  ),
})

// ---------- Types ----------
type Language = "javascript" | "python" | "java"

type Challenge = {
  id: number
  title: string
  description: string
  tags: string[]
  examples: string[]
  notes: string[]
  language: Language
}

type TestCase = {
  functionName: string
  tests: { inputs: any[]; expected: any }[]
}

// Updated interface to match Next.js 15 requirements
interface ChallengePageProps {
  params: Promise<{ id: string }>
}

// ---------- Mock challenge data ----------
const challengeData: Record<string, any> = {

  "1": {
    id: 1,
    title: "Return the Sum of Two Numbers",
    description: "Create a function that takes two numbers as arguments and returns their sum.",
    tags: ["geometry", "maths", "numbers"],
    examples: ["addition(3, 2) → 5", "addition(-3, -6) → -9", "addition(7, 3) → 10"],
    notes: [
      "Don't forget to return the result.",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "javascript",
    help: {
      quickTips: [
        "Ensure your function accepts two parameters (e.g., `a` and `b`).",
        "Use the `+` operator to add the numbers.",
        "Return the result using the `return` statement.",
        "Handle both positive and negative numbers as shown in the examples."
      ],
      resources: [
        {
          title: "JavaScript Functions",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
          description: "Learn how to define and use functions in JavaScript."
        },
        {
          title: "JavaScript Operators",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators",
          description: "Understand arithmetic operators like `+` for addition."
        }
      ],
      furtherAssistance: "If you're still stuck, consider reviewing the examples in the Instructions tab or ask a question in the community forum on X."
    }
  },
  "2": {
    id: 2,
    title: "Area of a Triangle",
    description: "Write a function that takes the base and height of a triangle and return its area.",
    tags: ["geometry", "maths", "numbers"],
    examples: ["triArea(2, 3) → 3", "triArea(7, 4) → 14", "triArea(10, 10) → 50"],
    notes: [
      "The area of a triangle is: (base * height) / 2",
      "Don't forget to return the result.",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "javascript",
    help: {
      quickTips: [
        "Use the formula `(base * height) / 2` to calculate the area.",
        "Ensure your function accepts two parameters: `base` and `height`.",
        "Return the result using the `return` statement.",
        "Handle positive numbers as inputs."
      ],
      resources: [
        {
          title: "JavaScript Arithmetic",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators#arithmetic_operators",
          description: "Learn about arithmetic operators for multiplication and division."
        },
        {
          title: "JavaScript Functions",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
          description: "Understand how to create functions in JavaScript."
        }
      ],
      furtherAssistance: "If you're still stuck, review the formula in the notes or ask for help in the community forum on X."
    }
  },
  "3": {
    id: 3,
    title: "Convert Minutes into Seconds",
    description: "Write a function that takes an integer minutes and converts it to seconds.",
    tags: ["maths", "numbers"],
    examples: ["convert(5) → 300", "convert(3) → 180", "convert(2) → 120"],
    notes: [
      "There are 60 seconds in a minute.",
      "Don't forget to return the result.",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "javascript",
    help: {
      quickTips: [
        "Multiply the input minutes by 60 to convert to seconds.",
        "Ensure your function accepts one parameter for minutes.",
        "Return the result using the `return` statement.",
        "Handle positive integers as inputs."
      ],
      resources: [
        {
          title: "JavaScript Arithmetic",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators#arithmetic_operators",
          description: "Learn about multiplication in JavaScript."
        },
        {
          title: "JavaScript Functions",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
          description: "Understand how to define functions in JavaScript."
        }
      ],
      furtherAssistance: "If you're still stuck, check the examples or ask a question in the community forum on X."
    }
  },
  "4": {
    id: 4,
    title: "Find the Maximum Number in an Array",
    description: "Create a function that finds and returns the maximum number in a given array.",
    tags: ["arrays", "maths"],
    examples: ["findMax([1, 2, 3]) → 3", "findMax([-1, 0, 5]) → 5", "findMax([10]) → 10"],
    notes: [
      "You can use Math.max or iterate through the array.",
      "Handle empty arrays if needed, but assume non-empty for simplicity.",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "javascript",
    help: {
      quickTips: [
        "Use `Math.max(...array)` or loop through the array to find the largest number.",
        "Ensure your function accepts an array as a parameter.",
        "Return the maximum value using the `return` statement.",
        "Handle arrays with positive and negative numbers."
      ],
      resources: [
        {
          title: "JavaScript Math Object",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max",
          description: "Learn how to use Math.max to find the maximum value."
        },
        {
          title: "JavaScript Arrays",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
          description: "Understand how to work with arrays in JavaScript."
        }
      ],
      furtherAssistance: "If you're still stuck, try the examples or ask for help in the community forum on X."
    }
  },
  "5": {
    id: 5,
    title: "Check if a String is a Palindrome",
    description: "Write a function that checks if a given string is a palindrome.",
    tags: ["strings", "logic"],
    examples: ["is_palindrome('racecar') → True", "is_palindrome('hello') → False", "is_palindrome('a') → True"],
    notes: [
      "A palindrome reads the same forwards and backwards.",
      "Ignore case and non-alphanumeric characters if advanced, but keep simple.",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "python",
    help: {
      quickTips: [
        "Compare the string with its reverse using slicing (`string[::-1]`).",
        "Return `True` if they match, `False` otherwise.",
        "Handle single-character strings, which are always palindromes.",
        "Consider converting the string to lowercase for simplicity."
      ],
      resources: [
        {
          title: "Python String Methods",
          url: "https://docs.python.org/3/library/stdtypes.html#string-methods",
          description: "Learn about string manipulation in Python."
        },
        {
          title: "Python Slicing",
          url: "https://docs.python.org/3/tutorial/introduction.html#strings",
          description: "Understand how to use slicing to reverse a string."
        }
      ],
      furtherAssistance: "If you're still stuck, review the examples or ask for help in the community forum on X."
    }
  },
  "6": {
    id: 6,
    title: "Factorial of a Number",
    description: "Compute the factorial of a given number.",
    tags: ["maths", "recursion"],
    examples: ["factorial(5) → 120", "factorial(0) → 1", "factorial(3) → 6"],
    notes: [
      "Factorial of n is n * (n-1) * ... * 1.",
      "Use recursion or a loop.",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "java",
    help: {
      quickTips: [
        "Use a loop or recursion to multiply numbers from 1 to n.",
        "Handle the base case of 0, which returns 1.",
        "Ensure your function returns an integer or long for larger factorials.",
        "Test with the provided examples to verify correctness."
      ],
      resources: [
        {
          title: "Java Methods",
          url: "https://docs.oracle.com/javase/tutorial/java/javaOO/methods.html",
          description: "Learn how to define methods in Java."
        },
        {
          title: "Java Recursion",
          url: "https://www.w3schools.com/java/java_recursion.asp",
          description: "Understand how to implement recursion in Java."
        }
      ],
      furtherAssistance: "If you're still stuck, try the examples or ask for help in the community forum on X."
    }
  },
  "7": {
    id: 7,
    title: "Fibonacci Sequence",
    description: "Generate the Fibonacci sequence up to a given number.",
    tags: ["maths", "sequences"],
    examples: ["fib(5) → [0, 1, 1, 2, 3, 5]", "fib(3) → [0, 1, 1, 2]", "fib(0) → []"],
    notes: [
      "Fibonacci: each number is the sum of the two preceding ones.",
      "Start with 0 and 1.",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "javascript",
    help: {
      quickTips: [
        "Use a loop to generate numbers, starting with 0 and 1.",
        "Add the last two numbers to get the next one.",
        "Return an array containing the sequence.",
        "Handle edge cases like n = 0, which returns an empty array."
      ],
      resources: [
        {
          title: "JavaScript Arrays",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
          description: "Learn how to work with arrays in JavaScript."
        },
        {
          title: "JavaScript Loops",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration",
          description: "Understand how to use loops to generate sequences."
        }
      ],
      furtherAssistance: "If you're still stuck, check the examples or ask for help in the community forum on X."
    }
  },
  "8": {
    id: 8,
    title: "Sort an Array",
    description: "Implement a function to sort an array in ascending order.",
    tags: ["arrays", "sorting"],
    examples: ["sort_array([3, 1, 2]) → [1, 2, 3]", "sort_array([5]) → [5]", "sort_array([]) → []"],
    notes: [
      "You can use built-in sort or implement bubble/insertion sort.",
      "Handle numbers or strings as needed.",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "python",
    help: {
      quickTips: [
        "Use Python's `sorted()` function or `list.sort()` for simplicity.",
        "If implementing manually, try bubble sort or insertion sort.",
        "Return the sorted array.",
        "Handle empty arrays and single-element arrays as shown in examples."
      ],
      resources: [
        {
          title: "Python Sorting",
          url: "https://docs.python.org/3/howto/sorting.html",
          description: "Learn about sorting lists in Python."
        },
        {
          title: "Python Lists",
          url: "https://docs.python.org/3/tutorial/introduction.html#lists",
          description: "Understand how to work with lists in Python."
        }
      ],
      furtherAssistance: "If you're still stuck, review the examples or ask for help in the community forum on X."
    }
  },
  "9": {
    id: 9,
    title: "Binary Search",
    description: "Implement binary search on a sorted array.",
    tags: ["arrays", "searching"],
    examples: ["binarySearch([1,2,3,4], 3) → 2", "binarySearch([1,2], 5) → -1", "binarySearch([], 1) → -1"],
    notes: [
      "Binary search halves the search interval each time.",
      "Assume the array is sorted.",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "java",
    help: {
      quickTips: [
        "Use two pointers (low, high) to track the search range.",
        "Calculate the middle index and compare with the target.",
        "Return the index if found, or -1 if not found.",
        "Ensure the array is sorted before applying binary search."
      ],
      resources: [
        {
          title: "Java Arrays",
          url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/arrays.html",
          description: "Learn how to work with arrays in Java."
        },
        {
          title: "Binary Search in Java",
          url: "https://www.geeksforgeeks.org/binary-search-in-java/",
          description: "Understand how to implement binary search in Java."
        }
      ],
      furtherAssistance: "If you're still stuck, try the examples or ask for help in the community forum on X."
    }
  },
  "10": {
    id: 10,
    title: "Count Vowels in a String",
    description: "Count the number of vowels in a given string.",
    tags: ["strings"],
    examples: ["countVowels('hello') → 2", "countVowels('why') → 0", "countVowels('aeiou') → 5"],
    notes: [
      "Vowels are a, e, i, o, u (lowercase and uppercase).",
      "Iterate through the string and count.",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "javascript",
    help: {
      quickTips: [
        "Loop through each character in the string.",
        "Check if the character is in a list of vowels (e.g., ['a', 'e', 'i', 'o', 'u']).",
        "Increment a counter for each vowel found.",
        "Consider converting the string to lowercase to handle both cases."
      ],
      resources: [
        {
          title: "JavaScript String Methods",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String",
          description: "Learn how to manipulate strings in JavaScript."
        },
        {
          title: "JavaScript Loops",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration",
          description: "Understand how to iterate through strings."
        }
      ],
      furtherAssistance: "If you're still stuck, review the examples or ask for help in the community forum on X."
    }
  },
  "11": {
    id: 11,
    title: "Reverse a String",
    description: "Write a function that takes a string and returns it reversed.",
    tags: ["strings"],
    examples: ["reverseString('hello') → 'olleh'", "reverseString('world') → 'dlrow'", "reverseString('') → ''"],
    notes: [
      "Iterate through the string or use built-in methods.",
      "Handle empty strings.",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "javascript",
    help: {
      quickTips: [
        "Use `split('')`, `reverse()`, and `join('')` for a simple solution.",
        "Alternatively, loop through the string from end to start.",
        "Return the reversed string.",
        "Handle empty strings as shown in the examples."
      ],
      resources: [
        {
          title: "JavaScript String Methods",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String",
          description: "Learn how to manipulate strings in JavaScript."
        },
        {
          title: "JavaScript Array Methods",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
          description: "Understand array methods like reverse and join."
        }
      ],
      furtherAssistance: "If you're still stuck, review the examples or ask for help in the community forum on X."
    }
  },
  "12": {
    id: 12,
    title: "Check for Prime Number",
    description: "Write a function that checks if a given number is prime.",
    tags: ["maths", "numbers"],
    examples: ["isPrime(11) → true", "isPrime(4) → false", "isPrime(1) → false"],
    notes: [
      "A prime number is only divisible by 1 and itself.",
      "Numbers less than 2 are not prime.",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "javascript",
    help: {
      quickTips: [
        "Check divisibility from 2 to the square root of the number.",
        "Return `true` if no divisors are found, `false` otherwise.",
        "Handle edge cases like 1, 0, and negative numbers.",
        "Use a loop to test divisibility."
      ],
      resources: [
        {
          title: "JavaScript Math Object",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math",
          description: "Learn about Math functions like sqrt."
        },
        {
          title: "JavaScript Loops",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration",
          description: "Understand how to use loops for iteration."
        }
      ],
      furtherAssistance: "If you're still stuck, review the examples or ask for help in the community forum on X."
    }
  },
  "13": {
    id: 13,
    title: "Sum of Array Elements",
    description: "Write a function that returns the sum of all numbers in an array.",
    tags: ["arrays", "maths"],
    examples: ["arraySum([1, 2, 3]) → 6", "arraySum([]) → 0", "arraySum([-1, 1]) → 0"],
    notes: [
      "Use a loop or array methods like reduce.",
      "Handle empty arrays.",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "javascript",
    help: {
      quickTips: [
        "Use `reduce()` or a for loop to sum the array elements.",
        "Return 0 for an empty array.",
        "Handle both positive and negative numbers.",
        "Ensure the function accepts an array as input."
      ],
      resources: [
        {
          title: "JavaScript Array Reduce",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce",
          description: "Learn how to use reduce to sum array elements."
        },
        {
          title: "JavaScript Arrays",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
          description: "Understand how to work with arrays in JavaScript."
        }
      ],
      furtherAssistance: "If you're still stuck, review the examples or ask for help in the community forum on X."
    }
  },
  "14": {
    id: 14,
    title: "Check for Anagram",
    description: "Write a function that checks if two strings are anagrams of each other.",
    tags: ["strings", "logic"],
    examples: ["isAnagram('listen', 'silent') → True", "isAnagram('hello', 'world') → False", "isAnagram('rat', 'tar') → True"],
    notes: [
      "Anagrams are words with the same characters and frequency, ignoring order.",
      "Ignore case for simplicity.",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "python",
    help: {
      quickTips: [
        "Convert strings to lowercase and sort their characters.",
        "Compare the sorted strings for equality.",
        "Handle empty strings or strings of different lengths.",
        "Return True if anagrams, False otherwise."
      ],
      resources: [
        {
          title: "Python String Methods",
          url: "https://docs.python.org/3/library/stdtypes.html#string-methods",
          description: "Learn about string manipulation in Python."
        },
        {
          title: "Python Sorting",
          url: "https://docs.python.org/3/howto/sorting.html",
          description: "Understand how to sort data in Python."
        }
      ],
      furtherAssistance: "If you're still stuck, review the examples or ask for help in the community forum on X."
    }
  },
  "15": {
    id: 15,
    title: "Find First Non-Repeated Character",
    description: "Write a function that returns the first non-repeated character in a string.",
    tags: ["strings", "logic"],
    examples: ["firstNonRepeated('swiss') → 'w'", "firstNonRepeated('hello') → 'h'", "firstNonRepeated('aabb') → None"],
    notes: [
      "Use a dictionary or counter to track character frequencies.",
      "Return None if no non-repeated character exists.",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "python",
    help: {
      quickTips: [
        "Use a dictionary to count character occurrences.",
        "Iterate through the string to find the first character with a count of 1.",
        "Handle empty strings by returning None.",
        "Consider case sensitivity as per examples."
      ],
      resources: [
        {
          title: "Python Dictionaries",
          url: "https://docs.python.org/3/tutorial/datastructures.html#dictionaries",
          description: "Learn how to use dictionaries in Python."
        },
        {
          title: "Python Collections Counter",
          url: "https://docs.python.org/3/library/collections.html#collections.Counter",
          description: "Understand how to use Counter for frequency counting."
        }
      ],
      furtherAssistance: "If you're still stuck, review the examples or ask for help in the community forum on X."
    }
  },
  "16": {
    id: 16,
    title: "Power of a Number",
    description: "Write a function that calculates the power of a number (base raised to exponent).",
    tags: ["maths", "numbers"],
    examples: ["power(2, 3) → 8", "power(5, 0) → 1", "power(3, 2) → 9"],
    notes: [
      "Use a loop or recursion for calculation.",
      "Handle zero exponent (returns 1).",
      "If you get stuck on a challenge, find help by tapping the help button.",
    ],
    language: "python",
    help: {
      quickTips: [
        "Use the ** operator or a loop for exponentiation.",
        "Handle edge cases like exponent = 0.",
        "Assume positive integers for simplicity.",
        "Return the result as an integer."
      ],
      resources: [
        {
          title: "Python Operators",
          url: "https://docs.python.org/3/reference/lexical_analysis.html#operators",
          description: "Learn about Python's arithmetic operators."
        },
        {
          title: "Python Loops",
          url: "https://docs.python.org/3/tutorial/controlflow.html#for-statements",
          description: "Understand how to use loops in Python."
        }
      ],
      furtherAssistance: "If you're still stuck, review the examples or ask for help in the community forum on X."
    }
  }
};

// Updated interface to match Next.js 15 requirements
interface ChallengePageProps {
  params: Promise<{ id: string }>;
}

// ---------- Test cases ----------
const testCases: Record<string, TestCase> = {
  "1": {
    functionName: "addition",
    tests: [
      { inputs: [3, 2], expected: 5 },
      { inputs: [-3, -6], expected: -9 },
      { inputs: [7, 3], expected: 10 },
      { inputs: [0, 0], expected: 0 },
      { inputs: [-1, 1], expected: 0 },
    ],
  },
  "2": {
    functionName: "triArea",
    tests: [
      { inputs: [2, 3], expected: 3 },
      { inputs: [7, 4], expected: 14 },
      { inputs: [10, 10], expected: 50 },
      { inputs: [5, 6], expected: 15 },
      { inputs: [1, 1], expected: 0.5 },
    ],
  },
  "3": {
    functionName: "convert",
    tests: [
      { inputs: [5], expected: 300 },
      { inputs: [3], expected: 180 },
      { inputs: [2], expected: 120 },
      { inputs: [1], expected: 60 },
      { inputs: [0], expected: 0 },
    ],
  },
  "4": {
    functionName: "findMax",
    tests: [
      { inputs: [[1, 2, 3]], expected: 3 },
      { inputs: [[-1, 0, 5]], expected: 5 },
      { inputs: [[10]], expected: 10 },
      { inputs: [[-5, -10, -2]], expected: -2 },
      { inputs: [[1, 1, 1]], expected: 1 },
    ],
  },
  "5": {
    functionName: "is_palindrome",
    tests: [
      { inputs: ["racecar"], expected: true },
      { inputs: ["hello"], expected: false },
      { inputs: ["a"], expected: true },
      { inputs: [""], expected: true },
      { inputs: ["Racecar"], expected: true },
    ],
  },
  "6": {
    functionName: "factorial",
    tests: [
      { inputs: [5], expected: 120 },
      { inputs: [0], expected: 1 },
      { inputs: [3], expected: 6 },
      { inputs: [1], expected: 1 },
      { inputs: [4], expected: 24 },
    ],
  },
  "7": {
    functionName: "fib",
    tests: [
      { inputs: [5], expected: [0, 1, 1, 2, 3, 5] },
      { inputs: [3], expected: [0, 1, 1, 2] },
      { inputs: [0], expected: [] },
      { inputs: [1], expected: [0, 1] },
      { inputs: [2], expected: [0, 1, 1] },
    ],
  },
  "8": {
    functionName: "sort_array",
    tests: [
      { inputs: [[3, 1, 2]], expected: [1, 2, 3] },
      { inputs: [[5]], expected: [5] },
      { inputs: [[]], expected: [] },
      { inputs: [[4, 4, 4]], expected: [4, 4, 4] },
      { inputs: [[-1, 0, -5]], expected: [-5, -1, 0] },
    ],
  },
  "9": {
    functionName: "binarySearch",
    tests: [
      { inputs: [[1, 2, 3, 4], 3], expected: 2 },
      { inputs: [[1, 2], 5], expected: -1 },
      { inputs: [[], 1], expected: -1 },
      { inputs: [[1], 1], expected: 0 },
      { inputs: [[1, 2, 3], 1], expected: 0 },
    ],
  },
  "10": {
    functionName: "countVowels",
    tests: [
      { inputs: ["hello"], expected: 2 },
      { inputs: ["why"], expected: 0 },
      { inputs: ["aeiou"], expected: 5 },
      { inputs: ["HELLO"], expected: 2 },
      { inputs: [""], expected: 0 },
    ],
  },
  "11": {
    functionName: "reverseString",
    tests: [
      { inputs: ["hello"], expected: "olleh" },
      { inputs: ["world"], expected: "dlrow" },
      { inputs: [""], expected: "" },
      { inputs: ["a"], expected: "a" },
      { inputs: ["JavaScript"], expected: "tpircSavaJ" },
    ],
  },
  "12": {
    functionName: "isPrime",
    tests: [
      { inputs: [11], expected: true },
      { inputs: [4], expected: false },
      { inputs: [1], expected: false },
      { inputs: [2], expected: true },
      { inputs: [0], expected: false },
    ],
  },
  "13": {
    functionName: "arraySum",
    tests: [
      { inputs: [[1, 2, 3]], expected: 6 },
      { inputs: [[]], expected: 0 },
      { inputs: [[-1, 1]], expected: 0 },
      { inputs: [[5, 5]], expected: 10 },
      { inputs: [[-2, -3, -4]], expected: -9 },
    ],
  },
  "14": {
    functionName: "isAnagram",
    tests: [
      { inputs: ["listen", "silent"], expected: true },
      { inputs: ["hello", "world"], expected: false },
      { inputs: ["rat", "tar"], expected: true },
      { inputs: ["", ""], expected: true },
      { inputs: ["abc", "abcd"], expected: false },
    ],
  },
  "15": {
    functionName: "firstNonRepeated",
    tests: [
      { inputs: ["swiss"], expected: "w" },
      { inputs: ["hello"], expected: "h" },
      { inputs: ["aabb"], expected: null },
      { inputs: [""], expected: null },
      { inputs: ["aabbccde"], expected: "d" },
    ],
  },
  "16": {
    functionName: "power",
    tests: [
      { inputs: [2, 3], expected: 8 },
      { inputs: [5, 0], expected: 1 },
      { inputs: [3, 2], expected: 9 },
      { inputs: [1, 5], expected: 1 },
      { inputs: [4, 1], expected: 4 },
    ],
  },
};

// ---------- Component ----------
export default function ChallengePage({ params }: ChallengePageProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [challengeId, setChallengeId] = useState<string>("")
  const [isCompleted, setIsCompleted] = useState(false)
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completionData, setCompletionData] = useState<{
    xpEarned: number
    totalXp: number
    currentLevel: number
    isLevelUp: boolean
    nextChallenge?: { id: number; title: string; difficulty: string }
    allChallengesCompleted: boolean
  } | null>(null)
  const [activeTab, setActiveTab] = useState<"instructions" | "code">("instructions");
  const [activeTabct, setActiveTabct] = useState<"console" | "test">("console");
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [isMediumScreen, setIsMediumScreen] = useState(false)

  // Handle responsive breakpoints
  useEffect(() => {
    const updateScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640)
      setIsMediumScreen(window.innerWidth >= 640 && window.innerWidth < 768)
    }

    updateScreenSize()
    window.addEventListener("resize", updateScreenSize)
    return () => window.removeEventListener("resize", updateScreenSize)
  }, [])

  // Handle async params
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      const id = resolvedParams.id
      setChallengeId(id)

      const challengeData_challenge = challengeData[id]
      setChallenge(challengeData_challenge || null)

      if (challengeData_challenge) {
        setIsCompleted(isChallengeCompleted(challengeData_challenge.id))
        setCode(getStarterCode(challengeData_challenge))
      }
    }

    loadParams()
  }, [params])

  const getStarterCode = (c: Challenge): string => {
    switch (c.language) {
      case "javascript":
        if (c.id === 1) return `function addition(a, b) {\n  // Write your code here\n}`;
        if (c.id === 2) return `function triArea(base, height) {\n  // Write your code here\n}`;
        if (c.id === 3) return `function convert(minutes) {\n  // Write your code here\n}`;
        if (c.id === 4) return `function findMax(arr) {\n  // Write your code here\n}`;
        if (c.id === 7) return `function fib(n) {\n  // Write your code here\n}`;
        if (c.id === 10) return `function countVowels(str) {\n  // Write your code here\n}`;
        if (c.id === 11) return `function reverseString(str) {\n  // Write your code here\n}`;
        if (c.id === 12) return `function isPrime(num) {\n  // Write your code here\n}`;
        if (c.id === 13) return `function arraySum(arr) {\n  // Write your code here\n}`;
        return `function solution() {\n  // Write your code here\n}`;
      case "python":
        if (c.id === 5) return `def is_palindrome(s):\n    # Write your code here\n    pass`;
        if (c.id === 8) return `def sort_array(arr):\n    # Write your code here\n    pass`;
        if (c.id === 14) return `def isAnagram(s1, s2):\n    # Write your code here\n    pass`;
        if (c.id === 15) return `def firstNonRepeated(s):\n    # Write your code here\n    pass`;
        if (c.id === 16) return `def power(base, exponent):\n    # Write your code here\n    pass`;
        return `def solution():\n    # Write your code here\n    pass`;
      case "java":
        if (c.id === 6)
          return `public class Solution {\n    public static int factorial(int n) {\n        // Write your code here\n        return 0;\n    }\n}`;
        if (c.id === 9)
          return `public class Solution {\n    public static int binarySearch(int[] arr, int target) {\n        // Write your code here\n        return -1;\n    }\n}`;
        return `public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`;
      default:
        return "// Write your code here";
    }
  };

const handleRunCode = () => {
    if (!challenge) return

    setIsRunning(true)
    setOutput("Running code...")

    setTimeout(() => {
      try {
        if (challenge.language === "javascript") {
          const challengeTests = testCases[challengeId]
          if (!challengeTests) {
            setOutput("❌ No test cases available for this challenge yet.")
            setIsRunning(false)
            return
          }

          const fnName = challengeTests.functionName

          let consoleLogs: string[] = []
          const originalConsoleLog = console.log
          console.log = (...args: any[]) => {
            consoleLogs.push(args.map(arg => JSON.stringify(arg)).join(" "))
          }

          let userFunction: (...args: any[]) => any
          try {
            // If the user defined the named function, return it; otherwise treat the code as an expression returning a function
            if (new RegExp(`\\bfunction\\s+${fnName}\\b`).test(code) || code.includes(`${fnName} =`)) {
              userFunction = new Function(`${code}; return ${fnName};`)() as (...a: any[]) => any
            } else {
              userFunction = new Function(`return (${code});`)() as (...a: any[]) => any
            }
          } catch (e) {
            console.log = originalConsoleLog
            setOutput(`❌ Syntax Error: ${e instanceof Error ? e.message : "Invalid code syntax"}`)
            setIsRunning(false)
            return
          } finally {
            console.log = originalConsoleLog
          }

          if (typeof userFunction !== "function") {
            setOutput("❌ Your code should define and return a function.")
            setIsRunning(false)
            return
          }

          const results: { inputs: any[]; expected: any; actual: any; passed: boolean }[] = []
          let passedTests = 0

          console.log = (...args: any[]) => {
            consoleLogs.push(args.map(arg => JSON.stringify(arg)).join(" "))
          }

          try {
            for (const t of challengeTests.tests) {
              try {
                const actual = userFunction(...t.inputs)
                const passed = JSON.stringify(actual) === JSON.stringify(t.expected)
                if (passed) passedTests++
                results.push({ inputs: t.inputs, expected: t.expected, actual, passed })
              } catch (err) {
                results.push({
                  inputs: t.inputs,
                  expected: t.expected,
                  actual: `Error: ${err instanceof Error ? err.message : String(err)}`,
                  passed: false,
                })
              }
            }
          } finally {
            console.log = originalConsoleLog
          }

          let out = `Test Results: ${passedTests}/${challengeTests.tests.length} passed\n\n`
          results.forEach((r, idx) => {
            const inputStr = r.inputs.map((v) => (typeof v === "string" ? `"${v}"` : JSON.stringify(v))).join(", ")
            out += `${r.passed ? "✅" : "❌"} Test ${idx + 1}: ${fnName}(${inputStr})\n`
            out += `   Expected: ${JSON.stringify(r.expected)}\n`
            out += `   Got:      ${JSON.stringify(r.actual)}\n\n`
          })

          if (consoleLogs.length > 0) {
            out = `Console Output:\n${consoleLogs.join("\n")}\n\n${out}`
          }

          if (passedTests === challengeTests.tests.length) {
            out += "🎉 All tests passed! Challenge completed!"
            console.log("[v0] All tests passed, triggering modal")
            const result = markChallengeComplete(challenge.id, getDifficultyFromId(challenge.id))

            // Update completion status if it wasn't completed before
            if (!isCompleted) {
              setIsCompleted(true)
            }

            // Get the selected language from localStorage
            const selectedLanguage = typeof window !== "undefined" ? localStorage.getItem('challengeLanguage') || challenge.language : challenge.language;
            const nextChallenge = getNextChallenge(challenge.id, selectedLanguage)
            const completionDataObj: {
              xpEarned: number
              totalXp: number
              currentLevel: number
              isLevelUp: boolean
              nextChallenge?: { id: number; title: string; difficulty: string }
              allChallengesCompleted: boolean
            } = {
              xpEarned: isCompleted ? 0 : result.xpEarned,
              totalXp: result.progress.xp,
              currentLevel: result.progress.level,
              isLevelUp: !isCompleted && result.isLevelUp,
              nextChallenge: nextChallenge || undefined,
              allChallengesCompleted: !nextChallenge && result.progress.completedChallenges.length === Object.values(challengeData).filter((c: { language: string }) => c.language === selectedLanguage).length
            }

            console.log("[v0] Setting completion data:", completionDataObj)
            setCompletionData(completionDataObj)

            console.log("[v0] Setting showCompletionModal to true")
            setShowCompletionModal(true)

            if (typeof window !== "undefined" && !isCompleted) {
              window.dispatchEvent(new Event("progressUpdate"))
            }
          } else {
            out += `💡 ${challengeTests.tests.length - passedTests} test(s) failed. Review your logic and try again.`
          }

          setOutput(out)
        } else {
          // Non-JS languages: basic feedback only
          if (code.trim().length < 10) {
            setOutput("❌ Please write more code to implement the solution.")
          } else if (challenge.language === "python" && !code.includes("def ")) {
            setOutput("❌ Python code should define a function using 'def'.")
          } else if (challenge.language === "java" && !code.includes("public ")) {
            setOutput("❌ Java code should include a public method or class.")
          } else {
            setOutput(
              `✅ Code syntax looks good!\n\nNote: Full execution for ${challenge.language} will be available soon.\n\nExpected behavior:\n${challenge.examples.join(
                "\n",
              )}`,
            )
          }
        }
      } catch (error) {
        setOutput(`❌ Unexpected error: ${error instanceof Error ? error.message : "Something went wrong"}`)
      } finally {
        setIsRunning(false)
      }
    }, 500)
  }

  const handleResetCode = () => {
    if (challenge) {
      setCode(getStarterCode(challenge))
      setOutput("")
    }
  }

  // Show loading state while params are being resolved
  if (!challenge && !challengeId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading challenge...</div>
        </div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Challenge Not Found</h1>
          <Link href="/codearena/challenges">
            <Button>Back to Challenges</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between py-4 pr-4 pl-2 md:p-4 border-border border-b mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/codearena/challenges"
            className="flex items-center hover:text-foreground/25 active:text-foreground/30 transition-colors duration-200"
          >
            <ChevronLeft className="h-8 w-8 sm:h-7 sm:w-7" />
            <span>Challenges</span>
          </Link>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <XPDisplay />
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-6 sm:pb-8">
        <Tabs
          defaultValue="instructions"
          onValueChange={(value) => setActiveTab(value as "instructions" | "code")}
          className="w-full px-3 sm:px-4">
          {/* Tab Navigation */}
          <div className="w-full flex justify-center items-center">
            <TabsList className="grid w-full grid-cols-2 mb-8 gap-1 sm:max-w-[24rem]">
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
          </div>

          {/* Instructions Tab */}
          <TabsContent value="instructions" className="space-y-6 min-h-[70vh] sm:min-h-[60vh] md:max-w-7xl m-auto">
            {/* Challenge Header */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl font-semibold">{challenge.title}</h1>
              </div>
              <div className="mb-4">
                {isCompleted && <span className="text-sm text-green-400 font-medium">✓ Completed</span>}
              </div>
              <p className="text-foreground leading-relaxed text-base">{challenge.description}</p>
            </div>

            {/* Examples Section */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Examples</h2>
              <div className="bg-muted border-l-4 border-l-green-500 p-4 rounded-r-md">
                <div className="space-y-1 text-sm">
                  {challenge.examples.map((example: string, index: number) => (
                    <div key={index}>{example}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Notes</h2>
              <ul className="space-y-2">
                {challenge.notes.map((note: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span className="text-foreground">{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags Section */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Tags</h2>
              <div className="flex gap-2 mb-2">
                {challenge.tags.map((tag: string) => (
                  <span key={tag} className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent
            value="code"
            className="space-y-4 sm:space-y-6 min-h-[60vh] sm:min-h-[60vh] max-w-7xl mx-auto"
          >
            {/* Code Editor Header */}
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-[minmax(0,1fr)]
                md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]
                lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]
                gap-4
              "
            >
              {/* Monaco Editor */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-0 mb-2 md:mb-4">
                  <div className="grid grid-cols-[100px_minmax(200px,_1fr)] gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetCode}
                      className="flex items-center gap-2 bg-transparent flex-1 sm:flex-none h-11 sm:h-9"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Reset</span>
                    </Button>
                    <Button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="flex items-center gap-2 flex-1 sm:flex-none h-11 sm:h-9"
                    >
                      <Play className="h-4 w-4" />
                      <span>{isRunning ? "Running..." : "Run Code"}</span>
                    </Button>
                  </div>
                </div>
                <div className="border-border border rounded-sm p-2 md:p-4">
                  <div className="flex items-center gap-2 mb-2 w-fit">
                    {/* <h2 className="text-lg sm:text-xl font-semibold">Code Editor</h2> */}
                    <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-1 capitalize">
                      {challenge.language}
                    </span>
                  </div>
                  <MonacoEditor
                    height={isSmallScreen ? "300px" : isMediumScreen ? "350px" : "400px"}
                    language={challenge.language === "javascript" ? "javascript" : challenge.language}
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{
                      minimap: { enabled: !isSmallScreen },
                      fontSize: isSmallScreen ? 16 : 16,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: "off",
                      folding: !isSmallScreen,
                      lineDecorationsWidth: isSmallScreen ? 10 : 20,
                      lineNumbersMinChars: isSmallScreen ? 2 : 3,
                    }}
                  />
                </div>
              </div>

              {/* Output */}
              <div className="border-border border rounded-sm p-2 md:p-4">
                <Tabs
                  defaultValue="console"
                  onValueChange={(value) => setActiveTabct(value as "console" | "test")}
                  className="w-full">
                  {/* Tab Navigation */}
                  <div className="w-full flex justify-center items-center">
                    <TabsList className="flex w-fit mb-8 h-9 gap-1 sm:max-w-[24rem]">
                      <TabsTrigger value="console" className="py-1 max-w-20">Console</TabsTrigger>
                      <TabsTrigger value="test" className="py-1 min-w-20">Test</TabsTrigger>
                    </TabsList>
                  </div>

{/* Console Tab */}
                  <TabsContent value="console" className="space-y-6 h-[60vh] md:h-[40vh] md:max-w-7xl m-auto">
                    {/* Output */}
                    <div className="border-border border md:p-4 h-full overflow-auto">
                      {output ? (
                        <div className="space-y-2 h-full">
                          <div className="bg-muted border border-border min-h-full p-3 sm:p-4 max-h-full sm:max-h-80 overflow-y-auto">
                            <pre className="text-base whitespace-pre-wrap font-mono break-words">
                              {output}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 min-h-full bg-muted flex justify-center items-center">
                          <div className="p-3 sm:p-4 max-h-64 min-h-full overflow-y-auto">
                            <p className="text-base text-center sm:text-sm text-foreground/25">
                              Run Code: <br />You will see console output here.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Code Tab */}
                  <TabsContent
                    value="test"
                    className="space-y-4 sm:space-y-6 h-[60vh] md:h-[40vh] max-w-7xl mx-auto"
                  >

                    {/* Output */}
                    <div className="border-border border h-full overflow-auto">
                      {output ? (
                        <div className="space-y-2 h-full">
                          <div className="bg-muted border border-border min-h-full p-3 sm:p-4 max-h-full sm:max-h-80 overflow-y-auto">
                            <pre className="text-base whitespace-pre-wrap font-mono break-words">
                              {output}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 min-h-full bg-muted flex justify-center items-center">
                          <div className="p-3 sm:p-4 max-h-64 min-h-full overflow-y-auto">
                            <p className="text-base text-center sm:text-sm text-foreground/25">
                              Run Code: <br />You will see test outputs here.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        {/* Bottom Actions */}
        <BottomActions activeTab={activeTab} challenge={challenge} />
      </main>

      {completionData && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={() => {
            setShowCompletionModal(false)
          }}
          challengeTitle={challenge.title}
          xpEarned={completionData.xpEarned}
          totalXp={completionData.totalXp}
          currentLevel={completionData.currentLevel}
          isLevelUp={completionData.isLevelUp}
          nextChallenge={completionData.nextChallenge}
          allChallengesCompleted={completionData.allChallengesCompleted}
          allowBackgroundScroll={true}
        />
      )}
    </div>
  )
}

const getDifficultyFromId = (id: number): string => {
  const difficultyMap: Record<number, string> = {
    1: "very easy",
    2: "very easy",
    3: "very easy",
    10: "very easy",
    4: "easy",
    6: "easy",
    5: "medium",
    7: "medium",
    8: "medium",
    9: "hard",
  }
  return difficultyMap[id] || "very easy"
}

// Bottom Actions Component
const BottomActions: React.FC<{ activeTab: string; challenge: any }> = ({ activeTab, challenge }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)' });
  const handleHelpClick = () => {
    setIsHelpOpen(true)
  }

  return (
    <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-border max-w-7xl m-auto">
      <div className="flex justify-between gap-3 w-full">
        <Button
          variant="ghost"
          size="lg"
          className="text-base text-foreground/50 hover:text-foreground hover:bg-accent/90 flex items-center gap-2"
        >
          <SkipForward className="w-5 h-5" />
          Skip
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="text-base text-foreground/50 hover:text-foreground flex items-center gap-2"
          onClick={handleHelpClick}
        >
          <HelpCircle className="w-5 h-5" />
          Help
        </Button>
      </div>

      {/* Desktop: Dialog */}
      {isDesktop ? (
        <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <DialogContent className="sm:max-w-[825px]">
            <DialogHeader className="sr-only">
              <DialogTitle>Help: {challenge.title}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="quick-tips" className="w-full">
              <TabsList className="flex gap-10 h-12 w-full grid-cols-3 justify-center items-center text-base rounded-none bg-transparent border-b border-border">
                <TabsTrigger
                  className="rounded-none relative data-[state=active]:text-foreground pb-2 px-0 w-full data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[4px] data-[state=active]:after:bg-primary data-[state=active]:after:rounded-full"
                  value="quick-tips"
                >
                  Quick Tips
                </TabsTrigger>
                <TabsTrigger
                  className="rounded-none relative data-[state=active]:text-foreground pb-2 px-0 w-full data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[4px] data-[state=active]:after:bg-primary data-[state=active]:after:rounded-full"
                  value="resources"
                >
                  Resources
                </TabsTrigger>
                <TabsTrigger
                  className="rounded-none relative data-[state=active]:text-foreground pb-2 px-0 w-full data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[4px] data-[state=active]:after:bg-primary data-[state=active]:after:rounded-full"
                  value="further-assistance"
                >
                  Assistance
                </TabsTrigger>
              </TabsList>
              <TabsContent value="quick-tips" className="mt-4 min-h-[65vh] text-base">
                <ul className="space-y-2 text-foreground">
                  {challenge.help?.quickTips.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="resources" className="mt-4 min-h-[65vh] text-base">
                <div className="space-y-4 text-foreground">
                  {challenge.help?.resources.map((resource: any, index: number) => (
                    <div key={index}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {resource.title}
                      </a>
                      <p className="text-muted-foreground">{resource.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="further-assistance" className="mt-4 min-h-[65vh] text-base">
                <p className="text-foreground">{challenge.help?.furtherAssistance}</p>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      ) : (
        /* Mobile: Drawer */
        <Drawer open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <DrawerContent>
            <DialogHeader className="sr-only">
              <DialogTitle>Help: {challenge.title}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="quick-tips" className="w-full pb-4">
              <TabsList className="flex gap-10 h-12 w-full grid-cols-3 justify-center items-center text-base rounded-none bg-transparent border-b border-border">
                <TabsTrigger
                  className="rounded-none relative data-[state=active]:text-foreground pb-2 px-0 w-min data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[4px] data-[state=active]:after:bg-primary data-[state=active]:after:rounded-full"
                  value="quick-tips"
                >
                  Quick Tips
                </TabsTrigger>
                <TabsTrigger
                  className="rounded-none relative data-[state=active]:text-foreground pb-2 px-0 w-min data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[4px] data-[state=active]:after:bg-primary data-[state=active]:after:rounded-full"
                  value="resources"
                >
                  Resources
                </TabsTrigger>
                <TabsTrigger
                  className="rounded-none relative data-[state=active]:text-foreground pb-2 px-0 w-min data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[4px] data-[state=active]:after:bg-primary data-[state=active]:after:rounded-full"
                  value="further-assistance"
                >
                  Assistance
                </TabsTrigger>
              </TabsList>
              <TabsContent value="quick-tips" className="mt-4 min-h-[80vh] text-base">
                <ul className="space-y-2 text-foreground px-4">
                  {challenge.help?.quickTips.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="resources" className="mt-4 min-h-[94vh] text-base">
                <div className="space-y-4 text-foreground px-4">
                  {challenge.help?.resources.map((resource: any, index: number) => (
                    <div key={index}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {resource.title}
                      </a>
                      <p className="text-muted-foreground">{resource.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="further-assistance" className="mt-4 min-h-[80vh] text-base">
                <div className="px-4">
                  <p className="text-foreground">{challenge.help?.furtherAssistance}</p>
                </div>
              </TabsContent>
            </Tabs>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}
