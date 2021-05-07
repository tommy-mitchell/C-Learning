#define INLINE static inline

typedef struct {
    int *num1;
    int *num2;
} pair_int;

/** Swaps a pair of integers with XOR bitwise operations. */
INLINE void swap(pair_int pair)
{
    *(pair.num1) ^= *(pair.num2);
    *(pair.num2) ^= *(pair.num1);
    *(pair.num1) ^= *(pair.num2);
}

/** Swaps a pair of integers. */
#define swap(num1, num2) swap((pair_int) { &num1, &num2 })