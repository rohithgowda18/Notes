# [4043. Count Rotations With Exactly K Equal Adjacent Pairs](https://leetcode.com/problems/count-rotations-with-exactly-k-equal-adjacent-pairs/)

![Easy](https://img.shields.io/badge/Difficulty-Easy-green?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

You are given a string `s` of length `n` and an integer `k`.

A **cyclic rotation** of `s` is obtained by choosing a **prefix** of `s` whose length is between 0 and `n - 1` (inclusive), and moving it to the end of the string while preserving the order of all characters.

For **every** cyclic rotation of `s`, let its **score** be the number of indices `i` such that `0

**Input:** s = "aab", k = 1

**Output:** 2

**Explanation:**

The cyclic rotations of `s` are:

- `"aab"`: The characters at positions 0 and 1 are equal, so `score = 1`.

- `"aba"`: No two adjacent characters are equal, so `score = 0`.

- `"baa"`: The characters at positions 1 and 2 are equal, so `score = 1`.

Since `score` equals `k` for 2 cyclic rotations of `s`, the answer is 2.

**Example 2:**

**Input:** s = "abca", k = 0

**Output:** 1

**Explanation:**

The cyclic rotations of `s` are:

- `"abca"`: No two adjacent characters are equal, so `score = 0`.

- `"bcaa"`: The characters at positions 2 and 3 are equal, so `score = 1`.

- `"caab"`: The characters at positions 1 and 2 are equal, so `score = 1`.

- `"aabc"`: The characters at positions 0 and 1 are equal, so `score = 1`.

Since `score` equals `k` for only 1 cyclic rotation of `s`, the answer is 1.

**Constraints:**

- `2 <= n == s.length <= 100`

- `s` only consists of lowercase English letters.

- `0 <= k <= n - 1`

---

## 💻 Solution (Java)

```java
class Solution {
    public int countRotations(String s, int k) {
        String temp=s+s;
        int n=s.length();
        int score =0;
        int ans=0;
        int i=0;
        for( i=1;i<s.length();i++){
            if(temp.charAt(i)==temp.charAt(i-1))score++;
        }
        if(score==k)ans++;
        for(;i<temp.length()-1;i++){
            int left=i-n;
            if(temp.charAt(left)==temp.charAt(left+1))score--;

            if(temp.charAt(i)==temp.charAt(i-1))score++;

            if(score==k)ans++;
        }


        return ans;
        
    }
}
```
