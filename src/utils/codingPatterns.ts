// Common coding patterns for problem solving

// Pattern 1: Array Manipulation (Moving elements like zeros to end)
export const moveElementsToEnd = (arr: number[], elementToMove: number): number[] => {
  let nonZeroIndex = 0;
  
  // First pass: Move all non-zero elements to front
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== elementToMove) {
      [arr[nonZeroIndex], arr[i]] = [arr[i], arr[nonZeroIndex]];
      nonZeroIndex++;
    }
  }
  
  return arr;
};

// Pattern 2: Binary/Decimal Conversion and Bit Manipulation
export const binaryManipulation = {
  // Decimal to binary
  decimalToBinary: (num: number): string => {
    return num.toString(2);
  },
  
  // Binary to decimal
  binaryToDecimal: (binary: string): number => {
    return parseInt(binary, 2);
  },
  
  // Toggle bits
  toggleBits: (num: number): number => {
    const binary = num.toString(2);
    const toggledBinary = binary
      .split('')
      .map(bit => bit === '0' ? '1' : '0')
      .join('');
    return parseInt(toggledBinary, 2);
  }
};

// Pattern 3: Cyclic Problems (like finding Sundays)
export const cyclicPatterns = {
  // Count occurrences in a cycle
  countOccurrences: (startDay: string, totalDays: number, targetDay: string): number => {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const startIndex = days.indexOf(startDay.toLowerCase());
    const targetIndex = days.indexOf(targetDay.toLowerCase());
    
    let firstOccurrence = (targetIndex - startIndex + 7) % 7;
    if (firstOccurrence === 0) firstOccurrence = 7;
    
    if (firstOccurrence > totalDays) return 0;
    
    return Math.floor((totalDays - firstOccurrence) / 7) + 1;
  }
};

// Pattern 4: Sorting (Risk levels 0,1,2)
export const customSort = {
  // Sort array with limited range of values (0,1,2)
  sortLimitedRange: (arr: number[]): number[] => {
    let low = 0, mid = 0, high = arr.length - 1;
    
    while (mid <= high) {
      if (arr[mid] === 0) {
        [arr[low], arr[mid]] = [arr[mid], arr[low]];
        low++;
        mid++;
      } else if (arr[mid] === 1) {
        mid++;
      } else {
        [arr[mid], arr[high]] = [arr[high], arr[mid]];
        high--;
      }
    }
    
    return arr;
  }
};

// Pattern 5: Finding Elements Greater Than Previous
export const arrayComparisons = {
  countGreaterThanPrevious: (arr: number[]): number => {
    if (arr.length === 0) return 0;
    
    let count = 1; // First element is always counted
    let maxSoFar = arr[0];
    
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > maxSoFar) {
        count++;
        maxSoFar = arr[i];
      }
    }
    
    return count;
  }
};

// Pattern 6: Digit Operations
export const digitOperations = {
  // Product of digits
  getDigitProduct: (num: number): number => {
    return String(num)
      .split('')
      .reduce((product, digit) => product * Number(digit), 1);
  },
  
  // Sum of digits
  getDigitSum: (num: number): number => {
    return String(num)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0);
  },
  
  // Repeat sum R times
  repeatDigitSum: (num: number, repetitions: number): number => {
    if (repetitions === 0) return 0;
    
    let result = num;
    for (let i = 0; i < repetitions; i++) {
      result = String(result)
        .split('')
        .reduce((sum, digit) => sum + Number(digit), 0);
    }
    
    return result;
  }
};

// Pattern 7: String Pattern Matching
export const stringPatterns = {
  // Count maximum occurrences in substrings
  maxCharInSubstrings: (str: string, length: number): number => {
    let maxCount = 0;
    
    for (let i = 0; i <= str.length - length; i++) {
      const substring = str.slice(i, i + length);
      const count = (substring.match(/a/g) || []).length;
      maxCount = Math.max(maxCount, count);
    }
    
    return maxCount;
  }
};

// Pattern 8: Permutations and Combinations
export const permutations = {
  // Calculate factorial
  factorial: (n: number): number => {
    if (n <= 1) return 1;
    return n * permutations.factorial(n - 1);
  },
  
  // Calculate circular permutation with fixed adjacent elements
  circularPermWithFixed: (n: number): number => {
    // 2! for fixed adjacent pair * (n-1)! for remaining arrangements
    return 2 * permutations.factorial(n - 1);
  }
};