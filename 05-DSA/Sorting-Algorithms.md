# 📊 Sorting Algorithms — Complete Placement & Interview Master Guide

> **Core Focus**: Intuitive concepts, visual execution diagrams, step-by-step trace walkthroughs, clean Java 17 code templates, edge-case optimization (early stopping in Bubble Sort, Insertion Sort on nearly-sorted data, Lomuto partition in Quick Sort, Merge Sort recursion tree), and placement revision cheat sheets.

---

## 📑 Table of Contents
- [1. Sorting Classification & Properties Overview](#1-sorting-classification--properties-overview)
- [2. Selection Sort (Find Minimum & Place at Front)](#2-selection-sort-find-minimum--place-at-front)
- [3. Bubble Sort (Adjacent Compare & Swap)](#3-bubble-sort-adjacent-compare--swap)
- [4. Insertion Sort (Adjacent Swap into Sorted Prefix)](#4-insertion-sort-adjacent-swap-into-sorted-prefix)
- [5. Merge Sort (Divide, Conquer & Merge) ⭐](#5-merge-sort-divide-conquer--merge-)
- [6. Quick Sort (Pivot Selection & Lomuto Partition) ⭐](#6-quick-sort-pivot-selection--lomuto-partition-)
- [7. Comprehensive Complexity Matrix & Mental Anchors](#7-comprehensive-complexity-matrix--mental-anchors)
- [8. Interview FAQs & Edge Case Traps](#8-interview-faqs--edge-case-traps)

---

## 1. Sorting Classification & Properties Overview

Before diving into specific algorithms, understand the **2 fundamental properties** frequently tested in technical rounds:

```
+----------------------------------------------------------------------------------------------------+
|                                      CORE SORTING PROPERTIES                                       |
+----------------------------------------------------------------------------------------------------+
| 1. Stability        | Preserves the relative order of duplicate elements with equal keys.          |
|                     | Example: [(4, 'A'), (3, 'B'), (4, 'C')] -> Sorted: [(3, 'B'), (4, 'A'), (4, 'C')]   |
|                     | Stable Algorithms  : Bubble Sort, Insertion Sort, Merge Sort                 |
|                     | Unstable Algorithms: Selection Sort, Quick Sort, Heap Sort                   |
+----------------------------------------------------------------------------------------------------+
| 2. In-Place         | Sorts elements using O(1) auxiliary memory (no extra array allocations).     |
|                     | In-Place    : Selection Sort, Bubble Sort, Insertion Sort, Quick Sort (O(log n) stack)|
|                     | Not In-Place: Merge Sort (Requires O(n) temporary array during merge phase)  |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Selection Sort (Find Minimum & Place at Front)

### 💡 Core Idea
Divide the array into a sorted prefix and an unsorted suffix. In each pass, scan the unsorted suffix (`i` to `n-1`) to find the absolute minimum element (`mini`), then swap it with the element at index `i`.

### 🖼️ Visual Execution
![Selection Sort Flow](images/selection-sort-flow.svg)

### 🔍 Trace Walkthrough `[5, 3, 8, 1]`
- **Pass 1 (`i = 0`)**: Scan index 0 to 3 $\rightarrow$ Min is 1 at index 3. Swap `arr[3]` (1) with `arr[0]` (5) $\rightarrow [1, 3, 8, 5]$ *(1 is locked at index 0)*
- **Pass 2 (`i = 1`)**: Scan index 1 to 3 $\rightarrow$ Min is 3 at index 1. Swap `arr[1]` with `arr[1]` $\rightarrow [1, 3, 8, 5]$ *(3 is locked at index 1)*
- **Pass 3 (`i = 2`)**: Scan index 2 to 3 $\rightarrow$ Min is 5 at index 3. Swap `arr[3]` (5) with `arr[2]` (8) $\rightarrow [1, 3, 5, 8]$ *(Sorted!)*

### ☕ Java Implementation
```java
public class SelectionSort {

    public static void selectionSort(int[] arr, int n) {
        if (arr == null || n <= 1) return;

        for (int i = 0; i <= n - 2; i++) {
            int mini = i;

            for (int j = i; j <= n - 1; j++) {
                if (arr[j] < arr[mini]) {
                    mini = j;
                }
            }

            // Swap the found minimum element with element at index i
            swap(arr, mini, i);
        }
    }

    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
```

### ⏱️ Complexity
- **Time Complexity**:
  - **Best Case**: $\mathcal{O}(n^2)$ *(Always scans entire unsorted suffix to find minimum)*
  - **Average Case**: $\mathcal{O}(n^2)$
  - **Worst Case**: $\mathcal{O}(n^2)$
- **Auxiliary Space**: $\mathcal{O}(1)$ *(In-place)*
- **Stable**: **No** (❌) *(Long-distance swaps jump over duplicate elements, e.g. `[4a, 4b, 1]` $\rightarrow$ 1 swaps with 4a, placing 4a behind 4b)*

---

## 3. Bubble Sort (Adjacent Compare & Swap)

### 💡 Core Idea
Repeatedly compare adjacent elements (`arr[j]`, `arr[j+1]`) from `j = 0` to `i - 1` and swap them if they are out of order (`arr[j] > arr[j+1]`). After each pass `i`, the largest unsorted element "bubbles up" to index `i`. If no swaps occur in a full pass, the array is already sorted and we can stop early.

### 🖼️ Visual Execution
![Bubble Sort Flow](images/bubble-sort-flow.svg)

### 🔍 Trace Walkthrough `[5, 3, 8, 1]`
- **Pass 1 (`i = 3`)**:
  - `j = 0`: Compare (5, 3) $\rightarrow 5 > 3 \rightarrow$ Swap $\rightarrow [3, 5, 8, 1]$
  - `j = 1`: Compare (5, 8) $\rightarrow 5 < 8 \rightarrow$ No swap $\rightarrow [3, 5, 8, 1]$
  - `j = 2`: Compare (8, 1) $\rightarrow 8 > 1 \rightarrow$ Swap $\rightarrow [3, 5, 1, 8]$ *(8 locked at index 3)*
- **Pass 2 (`i = 2`)**:
  - `j = 0`: Compare (3, 5) $\rightarrow$ No swap $\rightarrow [3, 5, 1, 8]$
  - `j = 1`: Compare (5, 1) $\rightarrow 5 > 1 \rightarrow$ Swap $\rightarrow [3, 1, 5, 8]$ *(5 locked at index 2)*
- **Pass 3 (`i = 1`)**:
  - `j = 0`: Compare (3, 1) $\rightarrow 3 > 1 \rightarrow$ Swap $\rightarrow [1, 3, 5, 8]$ *(Array is sorted!)*

### ☕ Java Implementation (with Early Stopping & `swap()`)
```java
public class BubbleSort {

    public static void bubbleSort(int[] arr, int n) {
        if (arr == null || n <= 1) return;

        for (int i = n - 1; i >= 1; i--) {
            boolean didSwap = false;

            for (int j = 0; j < i; j++) {
                if (arr[j] > arr[j + 1]) {
                    swap(arr, j, j + 1);
                    didSwap = true;
                }
            }

            // If no elements were swapped during this pass, array is already sorted!
            if (!didSwap) {
                break;
            }
        }
    }

    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
```

### ⏱️ Complexity
- **Time Complexity**:
  - **Best Case**: $\mathcal{O}(n)$ *(Array already sorted, breaks out immediately after 1st pass when `didSwap == false`)*
  - **Average Case**: $\mathcal{O}(n^2)$
  - **Worst Case**: $\mathcal{O}(n^2)$ *(Reverse sorted array)*
- **Auxiliary Space**: $\mathcal{O}(1)$ *(In-place)*
- **Stable**: **Yes** (✅)

---

## 4. Insertion Sort (Adjacent Swap into Sorted Prefix)

### 💡 Core Idea
Iterate from `i = 0` to `n - 1`. For each element at index `i`, continuously swap it with its left neighbour (`j - 1`) as long as `arr[j - 1] > arr[j]` until it settles into its correct sorted position in the left prefix.

### 🖼️ Visual Execution
![Insertion Sort Flow](images/insertion-sort-flow.svg)

### 🔍 Trace Walkthrough `[5, 3, 8, 1]`
- **`i = 0`**: `[5 | 3, 8, 1]` *(Trivially sorted)*
- **`i = 1` (`j = 1`)**: `arr[0] (5) > arr[1] (3)` $\rightarrow$ Swap(0, 1) $\rightarrow [3, 5 \mid 8, 1]$
- **`i = 2` (`j = 2`)**: `arr[1] (5) < arr[2] (8)` $\rightarrow$ Condition fails, no swap $\rightarrow [3, 5, 8 \mid 1]$
- **`i = 3` (`j = 3`)**:
  - `j = 3`: `arr[2] (8) > arr[3] (1)` $\rightarrow$ Swap(2, 3) $\rightarrow [3, 5, 1, 8]$
  - `j = 2`: `arr[1] (5) > arr[2] (1)` $\rightarrow$ Swap(1, 2) $\rightarrow [3, 1, 5, 8]$
  - `j = 1`: `arr[0] (3) > arr[1] (1)` $\rightarrow$ Swap(0, 1) $\rightarrow [1, 3, 5, 8]$

### ☕ Java Implementation (with `swap()`)
```java
public class InsertionSort {

    public static void insertionSort(int[] arr, int n) {
        if (arr == null || n <= 1) return;

        for (int i = 0; i <= n - 1; i++) {
            int j = i;

            while (j > 0 && arr[j - 1] > arr[j]) {
                swap(arr, j - 1, j);
                j--;
            }
        }
    }

    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
```

### ⏱️ Complexity
- **Time Complexity**:
  - **Best Case**: $\mathcal{O}(n)$ *(Array already sorted; inner condition `arr[j - 1] > arr[j]` fails on first check)*
  - **Average Case**: $\mathcal{O}(n^2)$
  - **Worst Case**: $\mathcal{O}(n^2)$ *(Reverse sorted array)*
- **Auxiliary Space**: $\mathcal{O}(1)$ *(In-place)*
- **Stable**: **Yes** (✅)

> 🎯 **Placement High-Yield Tip**: Insertion Sort is the algorithm of choice for **nearly-sorted / small arrays ($n \le 16$)** because of minimal constant overhead and $\mathcal{O}(n)$ best-case behavior (often used as the base case in hybrid algorithms like TimSort).

---

## 5. Merge Sort (Divide, Conquer & Merge) ⭐

### 💡 Core Idea
Follow the classic **Divide and Conquer** paradigm:
1. **Divide**: Split the array into two equal halves until each subarray contains only 1 element.
2. **Conquer**: Recursively sort both halves.
3. **Combine (Merge)**: Merge the two sorted subarrays into a single sorted array.

### 🖼️ Visual Execution (Recursion Tree)
![Merge Sort Recursion Tree](images/merge-sort-tree.svg)

### ☕ Java Implementation
```java
public class MergeSort {

    public static void sort(int[] arr) {
        if (arr == null || arr.length <= 1) return;
        mergeSort(arr, 0, arr.length - 1);
    }

    private static void mergeSort(int[] arr, int left, int right) {
        if (left >= right) return;

        int mid = left + (right - left) / 2; // Prevents integer overflow
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }

    private static void merge(int[] arr, int left, int mid, int right) {
        int[] temp = new int[right - left + 1];
        int i = left;      // Pointer for left sorted subarray [left..mid]
        int j = mid + 1;   // Pointer for right sorted subarray [mid+1..right]
        int k = 0;         // Pointer for temp array

        while (i <= mid && j <= right) {
            if (arr[i] <= arr[j]) { // '<=' guarantees stability
                temp[k++] = arr[i++];
            } else {
                temp[k++] = arr[j++];
            }
        }

        // Copy remaining elements of left subarray
        while (i <= mid) {
            temp[k++] = arr[i++];
        }

        // Copy remaining elements of right subarray
        while (j <= right) {
            temp[k++] = arr[j++];
        }

        // Copy back from temp into original array
        for (int x = 0; x < temp.length; x++) {
            arr[left + x] = temp[x];
        }
    }
}
```

### ⏱️ Complexity
- **Time Complexity**:
  - **Best Case**: $\mathcal{O}(n \log n)$
  - **Average Case**: $\mathcal{O}(n \log n)$
  - **Worst Case**: $\mathcal{O}(n \log n)$ *(Guaranteed $\mathcal{O}(n \log n)$ in all cases!)*
- **Auxiliary Space**: $\mathcal{O}(n)$ *(Requires temp array during merge phase)*
- **Stable**: **Yes** (✅)

---

## 6. Quick Sort (Pivot Selection & Lomuto Partition) ⭐

### 💡 Core Idea
1. **Choose a Pivot**: Pick an element from the array (e.g. last element, first element, or random).
2. **Partition**: Rearrange the array such that all elements smaller than or equal to the pivot are placed to its left, and all larger elements are placed to its right. The pivot is now at its final sorted position.
3. **Recurse**: Recursively apply Quick Sort on the left and right subarrays.

### 🖼️ Visual Execution (Lomuto Partition Scheme)
![Quick Sort Lomuto Partition](images/quick-sort-partition.svg)

### ☕ Java Implementation (Lomuto Partition with `swap()`)
```java
public class QuickSort {

    public static void sort(int[] arr) {
        if (arr == null || arr.length <= 1) return;
        quickSort(arr, 0, arr.length - 1);
    }

    private static void quickSort(int[] arr, int low, int high) {
        if (low >= high) return;

        // partition returns index of pivot in its correct sorted position
        int pivotIndex = partition(arr, low, high);
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }

    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high]; // Choosing last element as pivot
        int i = low - 1;       // Index of smaller element

        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                swap(arr, i, j);
            }
        }

        // Place pivot in its correct position by swapping with arr[i + 1]
        swap(arr, i + 1, high);
        return i + 1;
    }

    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
```

### ⏱️ Complexity
- **Time Complexity**:
  - **Best Case**: $\mathcal{O}(n \log n)$ *(Pivot divides array into 2 equal halves)*
  - **Average Case**: $\mathcal{O}(n \log n)$
  - **Worst Case**: $\mathcal{O}(n^2)$ *(When pivot is repeatedly the extreme smallest or largest element, e.g. already sorted array with naive last-element pivot)*
- **Auxiliary Space**: $\mathcal{O}(\log n)$ average recursion stack space ($\mathcal{O}(n)$ worst-case stack)
- **Stable**: **No** (❌) *(Non-adjacent swaps across pivot break order of duplicate elements)*

---

## 7. Comprehensive Complexity Matrix & Mental Anchors

| Algorithm | Best Time | Average Time | Worst Time | Auxiliary Space | Stable? | In-Place? | Key Mechanism |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Selection Sort** | $\mathcal{O}(n^2)$ | $\mathcal{O}(n^2)$ | $\mathcal{O}(n^2)$ | $\mathcal{O}(1)$ | ❌ No | ✅ Yes | Find min & swap to front |
| **Bubble Sort** | $\mathcal{O}(n)$ | $\mathcal{O}(n^2)$ | $\mathcal{O}(n^2)$ | $\mathcal{O}(1)$ | ✅ Yes | ✅ Yes | Adjacent compare & swap |
| **Insertion Sort** | $\mathcal{O}(n)$ | $\mathcal{O}(n^2)$ | $\mathcal{O}(n^2)$ | $\mathcal{O}(1)$ | ✅ Yes | ✅ Yes | Adjacent swap into sorted prefix |
| **Merge Sort** | $\mathcal{O}(n \log n)$ | $\mathcal{O}(n \log n)$ | $\mathcal{O}(n \log n)$ | $\mathcal{O}(n)$ | ✅ Yes | ❌ No | Divide, Conquer & Merge |
| **Quick Sort** | $\mathcal{O}(n \log n)$ | $\mathcal{O}(n \log n)$ | $\mathcal{O}(n^2)$ | $\mathcal{O}(\log n)^*$ | ❌ No | ✅ Yes | Pivot selection & Partitioning |

*\*Recursion call stack memory.*

### 🧠 1-Sentence Mental Anchors for Coding Rounds:
- **Selection Sort**: *"Select minimum from unsorted suffix, swap with current index."*
- **Bubble Sort**: *"Compare neighbours, bubble biggest to the right with early exit check."*
- **Insertion Sort**: *"Card deck sort — best for nearly sorted data ($\mathcal{O}(n)$) and small subsets."*
- **Merge Sort**: *"Guaranteed $\mathcal{O}(n \log n)$ always and stable, but requires $\mathcal{O}(n)$ extra buffer."*
- **Quick Sort**: *"Fastest in practice with cache locality and $\mathcal{O}(1)$ heap space, but $\mathcal{O}(n^2)$ worst case without randomized pivot."*

---

## 8. Interview FAQs & Edge Case Traps

### Q1: Why is Merge Sort preferred for Linked Lists, but Quick Sort for Arrays?
**Answer**:
- **Linked Lists**: Inserting and merging nodes requires $\mathcal{O}(1)$ pointer changes (no extra $\mathcal{O}(n)$ temporary buffer needed!). Linked lists have slow $\mathcal{O}(n)$ random access, which hurts Quick Sort's partitioning.
- **Arrays**: Arrays have $\mathcal{O}(1)$ random indexing and excellent CPU cache locality, making Quick Sort significantly faster in practice with zero extra allocation.

### Q2: How do you prevent Quick Sort from degrading to $\mathcal{O}(n^2)$?
**Answer**:
1. **Randomized Pivot Selection**: Swap `arr[high]` with a random index `low + rand() % (high - low)`.
2. **Median-of-Three**: Choose the median of `arr[low]`, `arr[mid]`, and `arr[high]` as the pivot.
3. **Dual-Pivot / Introsort**: Switch to HeapSort if recursion depth exceeds $2 \log n$ (used in Java's `Arrays.sort()` for primitives).

### Q3: What is the recurrence relation for Merge Sort and Quick Sort?
**Answer**:
- **Merge Sort**: $T(n) = 2T(n/2) + \mathcal{O}(n) \implies \mathcal{O}(n \log n)$ (by Master Theorem).
- **Quick Sort (Average)**: $T(n) = 2T(n/2) + \mathcal{O}(n) \implies \mathcal{O}(n \log n)$.
- **Quick Sort (Worst)**: $T(n) = T(n-1) + \mathcal{O}(n) \implies \mathcal{O}(n^2)$.
