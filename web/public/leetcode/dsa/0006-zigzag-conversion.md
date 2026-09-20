# [6. Zigzag Conversion](https://leetcode.com/problems/zigzag-conversion/)

![Medium](https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

The string `"PAYPALISHIRING"` is written in a zigzag pattern on a given number of rows like this: (you may want to display this pattern in a fixed font for better legibility)

```
P   A   H   N
A P L S I I G
Y   I   R
```

And then read line by line: `"PAHNAPLSIIGYIR"`

Write the code that will take a string and make this conversion given a number of rows:

```
string convert(string s, int numRows);
```

**Example 1:**

```
Input: s = "PAYPALISHIRING", numRows = 3
Output: "PAHNAPLSIIGYIR"
```

**Example 2:**

```
Input: s = "PAYPALISHIRING", numRows = 4
Output: "PINALSIGYAHRPI"
Explanation:
P     I    N
A   L S  I G
Y A   H R
P     I
```

**Example 3:**

```
Input: s = "A", numRows = 1
Output: "A"
```

**Constraints:**

- `1 <= s.length <= 1000`

- `s` consists of English letters (lower-case and upper-case), `','` and `'.'`.

- `1 <= numRows <= 1000`

**Related Topics:**  
`String`

---

## 💻 Solution (Java)

```java
class Solution {
    public String convert(String s, int numRows) {
        if(numRows==1)return s;
        int jump = (2*numRows)-2;
        StringBuilder res = new StringBuilder();
        int i=0;

        while(i<numRows){
            int j=i;
            while(j<s.length()){
                res.append(s.charAt(j));

                if(i!=0 && i!=numRows-1){
                    int diag = j+ jump-2 * i;
                    if (diag < s.length()) {
                        res.append(s.charAt(diag));
                    }
                }
                j=j+jump;
            }
            
            i++;
        }

        return res.toString();
    }
}
```
