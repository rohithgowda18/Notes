# [4049. Count Values With Equally Spaced Occurrences II](https://leetcode.com/problems/count-values-with-equally-spaced-occurrences-ii/)

![Medium](https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

You are given an integer array `nums`.

An integer `x` is called **special** if:

- `x` appears **at least three** times in `nums`.

- **All** occurrences of `x` are **equally spaced** in `nums`. In other words, if all occurrences of `x` are at indices `i_1

**Input:** nums = [1,8,1,5,1,5,8,5]

**Output:** 2

**Explanation:**

- 1 is special because it occurs at equally spaced indices 0, 2, and 4.

- 5 is special because it occurs at equally spaced indices 3, 5, and 7.

- 8 is not special because it occurs only twice.

Therefore, the answer is 2.

**Example 2:**

**Input:** nums = [8,8,8,8]

**Output:** 1

**Explanation:**

8 is special because it occurs at equally spaced indices 0, 1, 2, and 3. Therefore, the answer is 1.

**Example 3:**

**Input:** nums = [8,6,6,8,8]

**Output:** 0

**Explanation:**

8 occurs at indices 0, 3, and 4, which are not equally spaced. 6 occurs only twice. Therefore, no integer is special.

**Constraints:**

- `3 <= nums.length <= 10^5`

- `1 <= nums[i] <= 10^9`

---

## 💻 Solution (Java)

```java
class Solution {
    public int countSpecialIntegers(int[] nums) {
        Map<Integer,List<Integer>> map=new HashMap<>();

        int ans=0;

        for(int i=0;i<nums.length;i++){
            if(!map.containsKey(nums[i])){
                List<Integer> temp=new ArrayList<>();
                temp.add(i);
                map.put(nums[i],temp);
            }else{
                map.get(nums[i]).add(i);
            }
        }

        for(List<Integer> list:map.values()){
            if(list.size()>=3){
                int n1=list.get(0);
                int n2=list.get(1);
                int gap=n2-n1;
                int i=2;
                for(i=2;i<list.size();i++){
                    if(list.get(i)-list.get(i-1)!=gap)break;
                }
                if(i==list.size())ans++;
            }
        }

        return ans;
    }
}
```
