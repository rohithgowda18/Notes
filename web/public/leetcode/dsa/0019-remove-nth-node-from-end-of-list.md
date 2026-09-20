# [19. Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/)

![Medium](https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge) ![Category](https://img.shields.io/badge/Category-DSA-blue?style=for-the-badge)

Given the `head` of a linked list, remove the `n^th` node from the end of the list and return its head.

**Example 1:**

<img alt="" src="https://assets.leetcode.com/uploads/2020/10/03/remove_ex1.jpg" style="width: 542px; height: 222px;" />

```
Input: head = [1,2,3,4,5], n = 2
Output: [1,2,3,5]
```

**Example 2:**

```
Input: head = [1], n = 1
Output: []
```

**Example 3:**

```
Input: head = [1,2], n = 1
Output: [1]
```

**Constraints:**

- The number of nodes in the list is `sz`.

- `1 <= sz <= 30`

- `0 <= Node.val <= 100`

- `1 <= n <= sz`

**Follow up:** Could you do this in one pass?

**Related Topics:**  
`Linked List` `Two Pointers`

---

## 💻 Solution (Java)

```java
class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode node=head;
        int size=0;
        while(node!=null){
            size++;
            node=node.next;
        }
        if(n==size)return head.next;

        n=size-n-1;
        node=head;
        
        while(n-->0){
            node=node.next;
        }
        node.next=node.next.next;

        return head;
    }
}
```
