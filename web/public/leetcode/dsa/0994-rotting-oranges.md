# [994. Rotting Oranges](https://leetcode.com/problems/rotting-oranges/)

![Medium](https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

You are given an `m x n` `grid` where each cell can have one of three values:

- `0` representing an empty cell,

- `1` representing a fresh orange, or

- `2` representing a rotten orange.

Every minute, any fresh orange that is **4-directionally adjacent** to a rotten orange becomes rotten.

Return *the minimum number of minutes that must elapse until no cell has a fresh orange*. If *this is impossible, return* `-1`.

**Example 1:**

<img alt="" src="https://assets.leetcode.com/uploads/2019/02/16/oranges.png" style="width: 650px; height: 137px;" />

```
Input: grid = [[2,1,1],[1,1,0],[0,1,1]]
Output: 4
```

**Example 2:**

```
Input: grid = [[2,1,1],[0,1,1],[1,0,1]]
Output: -1
Explanation: The orange in the bottom left corner (row 2, column 0) is never rotten, because rotting only happens 4-directionally.
```

**Example 3:**

```
Input: grid = [[0,2]]
Output: 0
Explanation: Since there are already no fresh oranges at minute 0, the answer is just 0.
```

**Constraints:**

- `m == grid.length`

- `n == grid[i].length`

- `1 <= m, n <= 10`

- `grid[i][j]` is `0`, `1`, or `2`.

**Related Topics:**  
`Array` `Breadth-First Search` `Matrix`

---

## 💻 Solution (Java)

```java
class Solution {
    public int orangesRotting(int[][] grid) {
        Queue<int[]> q=new LinkedList<>();
        int m=grid.length;
        int n=grid[0].length;

        int fresh=0;
        for(int i=0;i<m;i++){
            for(int j=0;j<n;j++){
                if(grid[i][j]==2)q.add(new int[]{i,j});
                else if(grid[i][j]==1)fresh++;
            }
        }
        int sec=0;
        int[][] dir={
            {-1,0},{1,0},{0,-1},{0,1}
        };

        while(!q.isEmpty() && fresh>0){
            int size=q.size();

            for(int i=0;i<size;i++){
                int[] cur=q.poll();
                int r=cur[0],c=cur[1];

                for(int[] d:dir){
                    int nr=r+d[0];
                    int nc=c+d[1];

                     if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc]==1) {
                        grid[nr][nc] = 2;
                        fresh--;

                        q.offer(new int[]{nr, nc});
                    }
                }
            }
            sec++;
        }

        return fresh==0? sec:-1;
    }
}
```
