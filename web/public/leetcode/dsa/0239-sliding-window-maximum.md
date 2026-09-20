# [239. Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/)

![Hard](https://img.shields.io/badge/Difficulty-Hard-red?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

You are given an array of integers `nums`, there is a sliding window of size `k` which is moving from the very left of the array to the very right. You can only see the `k` numbers in the window. Each time the sliding window moves right by one position.

Return *the max sliding window*.

**Example 1:**

```
Input: nums = [1,3,-1,-3,5,3,6,7], k = 3
Output: [3,3,5,5,6,7]
Explanation:
Window position                Max
---------------               -----
[1  3  -1] -3  5  3  6  7       3
 1 [3  -1  -3] 5  3  6  7       3
 1  3 [-1  -3  5] 3  6  7       5
 1  3  -1 [-3  5  3] 6  7       5
 1  3  -1  -3 [5  3  6] 7       6
 1  3  -1  -3  5 [3  6  7]      7
```

**Example 2:**

```
Input: nums = [1], k = 1
Output: [1]
```

**Constraints:**

- `1 <= nums.length <= 10^5`

- `-10^4 <= nums[i] <= 10^4`

- `1 <= k <= nums.length`

**Related Topics:**  
`Array` `Queue` `Sliding Window` `Heap (Priority Queue)` `Monotonic Queue` `Range Minimum/Maximum Query`

---

## 💻 Solution (Java)

```java
class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int[] ans=new int[nums.length-k+1];
        Deque<Integer> dq=new ArrayDeque<>();


        for(int i=0;i<nums.length;i++){
            if(!dq.isEmpty() && dq.peekFirst()<=i-k) dq.pollFirst();

            while(!dq.isEmpty() && nums[dq.peekLast()]<=nums[i]) dq.pollLast();

            dq.offerLast(i);
            if(i>=k-1) ans[i-k+1]=nums[dq.peekFirst()];
       }

        return ans;
    }
}
```
