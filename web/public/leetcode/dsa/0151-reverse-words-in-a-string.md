# [151. Reverse Words in a String](https://leetcode.com/problems/reverse-words-in-a-string/)

![Medium](https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

Given an input string `s`, reverse the order of the **words**.

A **word** is defined as a sequence of non-space characters. The **words** in `s` will be separated by at least one space.

Return *a string of the words in reverse order concatenated by a single space.*

**Note** that `s` may contain leading or trailing spaces or multiple spaces between two words. The returned string should only have a single space separating the words. Do not include any extra spaces.

**Example 1:**

```
Input: s = "the sky is blue"
Output: "blue is sky the"
```

**Example 2:**

```
Input: s = "  hello world  "
Output: "world hello"
Explanation: Your reversed string should not contain leading or trailing spaces.
```

**Example 3:**

```
Input: s = "a good   example"
Output: "example good a"
Explanation: You need to reduce multiple spaces between two words to a single space in the reversed string.
```

**Constraints:**

- `1 <= s.length <= 10^4`

- `s` contains English letters (upper-case and lower-case), digits, and spaces `' '`.

- There is **at least one** word in `s`.

**Follow-up: **If the string data type is mutable in your language, can you solve it **in-place** with `O(1)` extra space?

**Related Topics:**  
`Two Pointers` `String`

---

## 💻 Solution (Java)

```java
class Solution {
    public String reverseWords(String s) {
        StringBuilder sb=new StringBuilder();
        int n=s.length();

        for(int i=n-1;i>=0;i--){
            while(i>=0 && s.charAt(i)==' ')i--;

            if (i < 0) break;
            int end=i;
            
            while(i>=0 && s.charAt(i)!=' ')i--;
            
            int start=i;
            sb.append(s.substring(start+1,end+1));
            sb.append(" ");
        }

        return sb.toString().trim();
    }
}
```
