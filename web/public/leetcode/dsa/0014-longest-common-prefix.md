# [14. Longest Common Prefix](https://leetcode.com/problems/longest-common-prefix/)

![Easy](https://img.shields.io/badge/Difficulty-Easy-green?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string `""`.

**Example 1:**

```
Input: strs = ["flower","flow","flight"]
Output: "fl"
```

**Example 2:**

```
Input: strs = ["dog","racecar","car"]
Output: ""
Explanation: There is no common prefix among the input strings.
```

**Constraints:**

- `1 <= strs.length <= 200`

- `0 <= strs[i].length <= 200`

- `strs[i]` consists of only lowercase English letters if it is non-empty.

**Related Topics:**  
`Array` `String` `Trie`

---

## 💻 Solution (Java)

```java
class Solution {
    public String longestCommonPrefix(String[] strs) {
        String prefix = "";
        for(int i=0;i<strs[0].length();i++){
            String temp = strs[0].substring(0,i+1);
            int j=0;
            for(j=1;j<strs.length;j++){
                if(strs[j].length()< i+1 || !strs[j].substring(0,i+1).equals(temp)){
                    break;
                }
            }
            if (j == strs.length) {
                prefix = temp;
            } else {
                break;
            }

        }

        return prefix;
    }
}
```
