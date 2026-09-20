# [547. Number of Provinces](https://leetcode.com/problems/number-of-provinces/)

![Medium](https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

There are `n` cities. Some of them are connected, while some are not. If city `a` is connected directly with city `b`, and city `b` is connected directly with city `c`, then city `a` is connected indirectly with city `c`.

A **province** is a group of directly or indirectly connected cities and no other cities outside of the group.

You are given an `n x n` matrix `isConnected` where `isConnected[i][j] = 1` if the `i^th` city and the `j^th` city are directly connected, and `isConnected[i][j] = 0` otherwise.

Return *the total number of **provinces***.

**Example 1:**

<img alt="" src="https://assets.leetcode.com/uploads/2020/12/24/graph1.jpg" style="width: 222px; height: 142px;" />

```
Input: isConnected = [[1,1,0],[1,1,0],[0,0,1]]
Output: 2
```

**Example 2:**

<img alt="" src="https://assets.leetcode.com/uploads/2020/12/24/graph2.jpg" style="width: 222px; height: 142px;" />

```
Input: isConnected = [[1,0,0],[0,1,0],[0,0,1]]
Output: 3
```

**Constraints:**

- `1 <= n <= 200`

- `n == isConnected.length`

- `n == isConnected[i].length`

- `isConnected[i][j]` is `1` or `0`.

- `isConnected[i][i] == 1`

- `isConnected[i][j] == isConnected[j][i]`

**Related Topics:**  
`Depth-First Search` `Breadth-First Search` `Union-Find` `Graph Theory`

---

## 💻 Solution (Java)

```java
class Solution {
    public int findCircleNum(int[][] isConnected) {
        
        int n= isConnected.length;
        boolean[] vis=new boolean[n];
        int ans=0;
        for(int i=0;i<n;i++){
            if(!vis[i]){
                dfs(isConnected,i,vis);
                ans++;
            }
        }

        return ans;
    }
    void dfs(int[][] isConnected,int i,boolean[] vis){
        vis[i]=true;
        for(int v=0;v<isConnected.length;v++){
            if(isConnected[i][v]==1 && !vis[v])dfs(isConnected,v,vis);
        }
    }
}
```
