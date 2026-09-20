# [2091. Removing Minimum and Maximum From Array](https://leetcode.com/problems/removing-minimum-and-maximum-from-array/)

![Medium](https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

You are given a **0-indexed** array of **distinct** integers `nums`.

There is an element in `nums` that has the **lowest** value and an element that has the **highest** value. We call them the **minimum** and **maximum** respectively. Your goal is to remove **both** these elements from the array.

A **deletion** is defined as either removing an element from the **front** of the array or removing an element from the **back** of the array.

Return *the **minimum** number of deletions it would take to remove **both** the minimum and maximum element from the array.*

**Example 1:**

```
Input: nums = [2,10,7,5,4,1,8,6]
Output: 5
Explanation:
The minimum element in the array is nums[5], which is 1.
The maximum element in the array is nums[1], which is 10.
We can remove both the minimum and maximum by removing 2 elements from the front and 3 elements from the back.
This results in 2 + 3 = 5 deletions, which is the minimum number possible.
```

**Example 2:**

```
Input: nums = [0,-4,19,1,8,-2,-3,5]
Output: 3
Explanation:
The minimum element in the array is nums[1], which is -4.
The maximum element in the array is nums[2], which is 19.
We can remove both the minimum and maximum by removing 3 elements from the front.
This results in only 3 deletions, which is the minimum number possible.
```

**Example 3:**

```
Input: nums = [101]
Output: 1
Explanation:
There is only one element in the array, which makes it both the minimum and maximum element.
We can remove it with 1 deletion.
```

**Constraints:**

- `1 <= nums.length <= 10^5`

- `-10^5 <= nums[i] <= 10^5`

- The integers in `nums` are **distinct**.

**Related Topics:**  
`Array` `Greedy`

---

## 💻 Solution (Java)

```java
class Solution {
    public int minimumDeletions(int[] nums) {
        int min=Integer.MAX_VALUE;
        int max=Integer.MIN_VALUE;

        for(int n:nums){
            min=Math.min(min,n);
            max=Math.max(max,n);
        }

        int leftmin=0;
        int leftmax=0;
        for(int i=0;i<nums.length;i++){
            if(nums[i]==min) leftmin=i+1;
            if(nums[i]==max) leftmax=i+1;
        }

        int rightmin=0;
        int rightmax=0;
        int n=nums.length;
        for(int i=nums.length-1;i>=0;i--){
            if(nums[i]==min) rightmin=n-i;
            if(nums[i]==max) rightmax=n-i;
        }

        int s1=Math.max(leftmin,leftmax);
        int s2=Math.max(rightmin,rightmax);
        int s3=Math.min(leftmin+rightmax,rightmin+leftmax);


        return Math.min(s1,Math.min(s2,s3));
    }
}
```
