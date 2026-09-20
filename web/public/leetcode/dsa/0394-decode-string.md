# [394. Decode String](https://leetcode.com/problems/decode-string/)

![Medium](https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

Given an encoded string, return its decoded string.

The encoding rule is: `k[encoded_string]`, where the `encoded_string` inside the square brackets is being repeated exactly `k` times. Note that `k` is guaranteed to be a positive integer.

You may assume that the input string is always valid; there are no extra white spaces, square brackets are well-formed, etc. Furthermore, you may assume that the original data does not contain any digits and that digits are only for those repeat numbers, `k`. For example, there will not be input like `3a` or `2[4]`.

The test cases are generated so that the length of the output will never exceed `10^5`.

**Example 1:**

```
Input: s = "3[a]2[bc]"
Output: "aaabcbc"
```

**Example 2:**

```
Input: s = "3[a2[c]]"
Output: "accaccacc"
```

**Example 3:**

```
Input: s = "2[abc]3[cd]ef"
Output: "abcabccdcdcdef"
```

**Constraints:**

- `1 <= s.length <= 30`

- `s` consists of lowercase English letters, digits, and square brackets `'[]'`.

- `s` is guaranteed to be **a valid** input.

- All the integers in `s` are in the range `[1, 300]`.

**Related Topics:**  
`String` `Stack` `Recursion`

---

## 💻 Solution (Java)

```java
class Solution {
    public String decodeString(String s) {
        Stack<Integer> number=new Stack<>();
        Stack<Character> character=new Stack<>();
        StringBuilder ans=new StringBuilder();

        int num=0;
        for(char ch:s.toCharArray()){
            if(ch>='0' && ch<='9') num=num*10+ch-'0';
            else if(ch=='['){
                number.push(num);
                character.push('[');
                num=0;
            }
            else if(ch==']'){
                StringBuilder sb=new StringBuilder();

                while(character.peek()!='['){
                    sb.append(character.pop());
                }
                character.pop();
                sb.reverse();
                int times=number.pop();

                String str = sb.toString();
                for (int i = 0; i<times; i++) {
                    for (char c : str.toCharArray()) {
                        character.push(c);
                    }
                }
            }
            else character.push(ch);
        }

        while(!character.isEmpty()){
            ans.append(character.pop());
        }

        return ans.reverse().toString();
    }
}
```
