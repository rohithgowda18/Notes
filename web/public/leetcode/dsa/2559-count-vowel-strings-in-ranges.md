# [2559. Count Vowel Strings in Ranges](https://leetcode.com/problems/count-vowel-strings-in-ranges/)

![Medium](https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

You are given a **0-indexed** array of strings `words` and a 2D array of integers `queries`.

Each query `queries[i] = [l_i, r_i]` asks us to find the number of strings present at the indices ranging from `l_i` to `r_i` (both **inclusive**) of `words` that start and end with a vowel.

Return *an array *`ans`* of size *`queries.length`*, where *`ans[i]`* is the answer to the *`i`^th* query*.

**Note** that the vowel letters are `'a'`, `'e'`, `'i'`, `'o'`, and `'u'`.

**Example 1:**

```
Input: words = ["aba","bcb","ece","aa","e"], queries = [[0,2],[1,4],[1,1]]
Output: [2,3,0]
Explanation: The strings starting and ending with a vowel are "aba", "ece", "aa" and "e".
The answer to the query [0,2] is 2 (strings "aba" and "ece").
to query [1,4] is 3 (strings "ece", "aa", "e").
to query [1,1] is 0.
We return [2,3,0].
```

**Example 2:**

```
Input: words = ["a","e","i"], queries = [[0,2],[0,1],[2,2]]
Output: [3,2,1]
Explanation: Every string satisfies the conditions, so we return [3,2,1].
```

**Constraints:**

- `1 <= words.length <= 10^5`

- `1 <= words[i].length <= 40`

- `words[i]` consists only of lowercase English letters.

- `sum(words[i].length) <= 3 * 10^5`

- `1 <= queries.length <= 10^5`

- `0 <= l_i <= r_i < words.length`

**Related Topics:**  
`Array` `String` `Prefix Sum`

---

## 💻 Solution (Java)

```java
class Solution {
    public int[] vowelStrings(String[] words, int[][] queries) {
        int[] prefix=new int[words.length];

        prefix[0]=check(words[0]);
        for(int i=1;i<words.length;i++){
            prefix[i]=prefix[i-1]+check(words[i]);
        }

        int[] ans=new int[queries.length];
        for(int i=0;i<queries.length;i++){
            int a=queries[i][0];
            int b=queries[i][1];

            if(a==0)ans[i]=prefix[b];
            else ans[i]=prefix[b]-prefix[a-1];

        }


        return ans;
    }
    int check(String word){
        if("aieou".indexOf(word.charAt(0)) != -1 && "aieou".indexOf(word.charAt(word.length()-1)) != -1)return 1;

        return 0;
    }
}
```
