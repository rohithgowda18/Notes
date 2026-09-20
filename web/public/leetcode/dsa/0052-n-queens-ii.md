# [52. N-Queens II](https://leetcode.com/problems/n-queens-ii/)

![Hard](https://img.shields.io/badge/Difficulty-Hard-red?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

The **n-queens** puzzle is the problem of placing `n` queens on an `n x n` chessboard such that no two queens attack each other.

Given an integer `n`, return *the number of distinct solutions to the **n-queens puzzle***.

**Example 1:**

<img alt="" src="https://assets.leetcode.com/uploads/2020/11/13/queens.jpg" style="width: 600px; height: 268px;" />

```
Input: n = 4
Output: 2
Explanation: There are two distinct solutions to the 4-queens puzzle as shown.
```

**Example 2:**

```
Input: n = 1
Output: 1
```

**Constraints:**

- `1 <= n <= 9`

**Related Topics:**  
`Backtracking` `Algorithm X`

---

## 💻 Solution (Java)

```java
class Solution {
    int ans=0;
    public int totalNQueens(int n) {
        char[][] board=new char[n][n];
        for(int i=0;i<n;i++)Arrays.fill(board[i],'.');

        solve(board,0);

        return ans;
    }
    
    void solve(char[][] board,int i){
        if(i==board.length){
            ans++;
            return;
        }

        for(int j=0;j<board.length;j++){
            if(isSafe(board,i,j)){
                board[i][j]='Q';

                solve(board,i+1);

                board[i][j]='.';
            }
        }

    }

    boolean isSafe(char[][] board,int i,int j){

        for(int r=0;r<i;r++){
            if(board[r][j]=='Q')return false;
        }

        for(int r=i-1,c=j-1;r>=0 && c>=0;r--,c--)if(board[r][c]=='Q')return false;

        for(int r=i-1,c=j+1;r>=0 && c<board.length;r--,c++)if(board[r][c]=='Q')return false;

        return true;
    }
}
```
