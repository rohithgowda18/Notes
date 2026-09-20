# [210. Course Schedule II](https://leetcode.com/problems/course-schedule-ii/)

![Medium](https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a_i, b_i]` indicates that you **must** take course `b_i` first if you want to take course `a_i`.

- For example, the pair `[0, 1]`, indicates that to take course `0` you have to first take course `1`.

Return *the ordering of courses you should take to finish all courses*. If there are many valid answers, return **any** of them. If it is impossible to finish all courses, return **an empty array**.

**Example 1:**

```
Input: numCourses = 2, prerequisites = [[1,0]]
Output: [0,1]
Explanation: There are a total of 2 courses to take. To take course 1 you should have finished course 0. So the correct course order is [0,1].
```

**Example 2:**

```
Input: numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]
Output: [0,2,1,3]
Explanation: There are a total of 4 courses to take. To take course 3 you should have finished both courses 1 and 2. Both courses 1 and 2 should be taken after you finished course 0.
So one correct course order is [0,1,2,3]. Another correct ordering is [0,2,1,3].
```

**Example 3:**

```
Input: numCourses = 1, prerequisites = []
Output: [0]
```

**Constraints:**

- `1 <= numCourses <= 2000`

- `0 <= prerequisites.length <= numCourses * (numCourses - 1)`

- `prerequisites[i].length == 2`

- `0 <= a_i, b_i < numCourses`

- `a_i != b_i`

- All the pairs `[a_i, b_i]` are **distinct**.

**Related Topics:**  
`Depth-First Search` `Breadth-First Search` `Graph Theory` `Topological Sort`

---

## 💻 Solution (Java)

```java
class Solution {
    public int[] findOrder(int numCourses, int[][] prerequisites) {
        int[] indegree=new int[numCourses];
        List<List<Integer>> adj = new ArrayList<>();

        for (int i = 0; i < numCourses; i++) {
            adj.add(new ArrayList<>());
        }

        for (int[] p : prerequisites) {
            int a = p[0];
            int b = p[1];

            adj.get(b).add(a);
            indegree[a]++;
        }
        List<Integer> topo=new ArrayList<>();

        Queue<Integer> q=new LinkedList<>();
        for(int i=0;i<numCourses;i++){
            if(indegree[i]==0)q.offer(i);
        }

        int cnt=0;
        while(!q.isEmpty()){
            int node=q.poll();
            cnt++;
            topo.add(node);
            for(int n:adj.get(node)){
                indegree[n]--;
                if(indegree[n]==0)q.offer(n);
            }
        }
        
        if (cnt != numCourses) {
            return new int[0];
        }
        int[] res=new int[topo.size()];

        for(int i=0;i<topo.size();i++){
            res[i]=topo.get(i);
        }

        
        return res;
    }
}
```
