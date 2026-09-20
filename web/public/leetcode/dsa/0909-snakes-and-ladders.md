# [909. Snakes and Ladders](https://leetcode.com/problems/snakes-and-ladders/)

![Medium](https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

You are given an `n x n` integer matrix `board` where the cells are labeled from `1` to `n^2` in a [**Boustrophedon style**](https://en.wikipedia.org/wiki/Boustrophedon) starting from the bottom left of the board (i.e. `board[n - 1][0]`) and alternating direction each row.

You start on square `1` of the board. In each move, starting from square `curr`, do the following:

- Choose a destination square `next` with a label in the range `[curr + 1, min(curr + 6, n^2)]`.

		This choice simulates the result of a standard **6-sided die roll**: i.e., there are always at most 6 destinations, regardless of the size of the board.

- If `next` has a snake or ladder, you **must** move to the destination of that snake or ladder. Otherwise, you move to `next`.

- The game ends when you reach the square `n^2`.

A board square on row `r` and column `c` has a snake or ladder if `board[r][c] != -1`. The destination of that snake or ladder is `board[r][c]`. Squares `1` and `n^2` are not the starting points of any snake or ladder.

Note that you only take a snake or ladder at most once per dice roll. If the destination to a snake or ladder is the start of another snake or ladder, you do **not** follow the subsequent snake or ladder.

- For example, suppose the board is `[[-1,4],[-1,3]]`, and on the first move, your destination square is `2`. You follow the ladder to square `3`, but do **not** follow the subsequent ladder to `4`.

Return *the least number of dice rolls required to reach the square *`n^2`*. If it is not possible to reach the square, return *`-1`.

**Example 1:**

<img alt="" src="https://assets.leetcode.com/uploads/2018/09/23/snakes.png" style="width: 500px; height: 394px;" />

```
Input: board = [[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,35,-1,-1,13,-1],[-1,-1,-1,-1,-1,-1],[-1,15,-1,-1,-1,-1]]
Output: 4
Explanation:
In the beginning, you start at square 1 (at row 5, column 0).
You decide to move to square 2 and must take the ladder to square 15.
You then decide to move to square 17 and must take the snake to square 13.
You then decide to move to square 14 and must take the ladder to square 35.
You then decide to move to square 36, ending the game.
This is the lowest possible number of moves to reach the last square, so return 4.
```

**Example 2:**

```
Input: board = [[-1,-1],[-1,3]]
Output: 1
```

**Constraints:**

- `n == board.length == board[i].length`

- `2 <= n <= 20`

- `board[i][j]` is either `-1` or in the range `[1, n^2]`.

- The squares labeled `1` and `n^2` are not the starting points of any snake or ladder.

**Related Topics:**  
`Array` `Breadth-First Search` `Matrix`

---

## 💻 Solution (Java)

```java
class Solution {
    public int snakesAndLadders(int[][] board) {
        int n=board.length;

        int[] cells = new int[n*n+1];
        int index=1;
        int nrow=0;
        for(int row=n-1;row>=0;row--){
            if(nrow%2==0){
                for (int col = 0; col < n; col++) cells[index++] = board[row][col];
            } else {
                for (int col = n - 1; col >= 0; col--) cells[index++] = board[row][col];
            }
            nrow++;
        }
        boolean[] vis=new boolean[n*n+1];
        Queue<int[]> q=new LinkedList<>();
        q.offer(new int[]{1,0});
        vis[1]=true;
        
        while(!q.isEmpty()){
            int[] node=q.poll();
            int sq=node[0];
            int rolls=node[1];

            if(sq==n*n)return rolls;
            for(int i=1;i<=6 && sq+i<=n*n;i++){
                int next=sq+i;

                if(cells[next]!=-1)next=cells[next];

                if(!vis[next]){
                    vis[next]=true;
                    q.offer(new int[]{next,rolls+1});
                }
            }
        }
        return -1;
    }
    
}
```
