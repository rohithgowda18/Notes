# [399. Evaluate Division](https://leetcode.com/problems/evaluate-division/)

![Medium](https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

You are given an array of variable pairs `equations` and an array of real numbers `values`, where `equations[i] = [A_i, B_i]` and `values[i]` represent the equation `A_i / B_i = values[i]`. Each `A_i` or `B_i` is a string that represents a single variable.

You are also given some `queries`, where `queries[j] = [C_j, D_j]` represents the `j^th` query where you must find the answer for `C_j / D_j = ?`.

Return *the answers to all queries*. If a single answer cannot be determined, return `-1.0`.

**Note:** The input is always valid. You may assume that evaluating the queries will not result in division by zero and that there is no contradiction.

**Note: **The variables that do not occur in the list of equations are undefined, so the answer cannot be determined for them.

**Example 1:**

```
Input: equations = [["a","b"],["b","c"]], values = [2.0,3.0], queries = [["a","c"],["b","a"],["a","e"],["a","a"],["x","x"]]
Output: [6.00000,0.50000,-1.00000,1.00000,-1.00000]
Explanation:
Given: a / b = 2.0, b / c = 3.0
queries are: a / c = ?, b / a = ?, a / e = ?, a / a = ?, x / x = ?
return: [6.0, 0.5, -1.0, 1.0, -1.0 ]
note: x is undefined => -1.0
```

**Example 2:**

```
Input: equations = [["a","b"],["b","c"],["bc","cd"]], values = [1.5,2.5,5.0], queries = [["a","c"],["c","b"],["bc","cd"],["cd","bc"]]
Output: [3.75000,0.40000,5.00000,0.20000]
```

**Example 3:**

```
Input: equations = [["a","b"]], values = [0.5], queries = [["a","b"],["b","a"],["a","c"],["x","y"]]
Output: [0.50000,2.00000,-1.00000,-1.00000]
```

**Constraints:**

- `1 <= equations.length <= 20`

- `equations[i].length == 2`

- `1 <= A_i.length, B_i.length <= 5`

- `values.length == equations.length`

- `0.0 < values[i] <= 20.0`

- `1 <= queries.length <= 20`

- `queries[i].length == 2`

- `1 <= C_j.length, D_j.length <= 5`

- `A_i, B_i, C_j, D_j` consist of lower case English letters and digits.

**Related Topics:**  
`Array` `String` `Depth-First Search` `Breadth-First Search` `Union-Find` `Graph Theory` `Shortest Path` `Bellman–Ford Algorithm` `Floyd–Warshall Algorithm`

---

## 💻 Solution (Java)

```java
class Solution {
    class Edge {
        String node;
        double value;

        Edge(String node, double value) {
            this.node = node;
            this.value = value;
        }
    }
    public double[] calcEquation(List<List<String>> equations, double[] values, List<List<String>> queries) {
        Map<String, List<Edge>> adj = new HashMap<>();
        
        for(int i=0;i<equations.size();i++){
            String a = equations.get(i).get(0);
            String b = equations.get(i).get(1);
            double val=values[i];

            adj.putIfAbsent(a, new ArrayList<>());
            adj.putIfAbsent(b, new ArrayList<>());

            adj.get(a).add(new Edge(b, val));
            adj.get(b).add(new Edge(a, 1.0 / val));
        }
        
        double[] result = new double[queries.size()];
        for(int i=0;i<queries.size();i++){
            String a=queries.get(i).get(0);
            String b=queries.get(i).get(1);

            if(!adj.containsKey(a) || !adj.containsKey(b)){
                result[i]= -1.0;
            }else{
                Set<String> set=new HashSet<>();

                result[i] = dfs(a,b,1.0,adj,set);
            }
        }

        return result;
    }

    double dfs(String a,String b,double ans,Map<String,List<Edge>> adj,Set<String> set){
        if(a.equals(b))return ans;

        set.add(a);
        for(Edge nei:adj.get(a)){
            String v=nei.node;
            double val=nei.value;
            if(set.contains(v))continue;

            double result = dfs(v,b,ans*val,adj,set);
            
            if (result != -1.0) {
                return result;
            }
        }

        return -1.0;
    }
}
```
