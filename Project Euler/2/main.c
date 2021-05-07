// sum of even Fibonacci numbers up to 4 million

#include <stdlib.h>
#include <stdio.h>

#define ALLOC_INT_ARR(n) (calloc(sizeof(int), n))

typedef struct {
    int *arr;
    int n;
} intArr;

const int base1 = 1;
const int base2 = 2; // skips the first calculation, thanks Project Euler?

/** 
 * Generates all Fibonnaci numbers up to a specificed maximum value.
 * 
 * @param max The specified maxiumum value.
 * 
 * @returns An intArr of the generated Fibonacci numbers.
 */
intArr generateFibNumbers(int max)
{
    intArr fibNumbers = {
        ALLOC_INT_ARR(34), // Fib(34) = 9,227,465
        max
    };

    fibNumbers.arr[0] = base1;
    fibNumbers.arr[1] = base2;

    for(int index = 2; index < fibNumbers.n; index++)
    {
        if(fibNumbers.arr[index-1] > max) // didn't calculate number of elements, oh well
        {
            fibNumbers.n = index-1;
            break;
        }

        fibNumbers.arr[index] = fibNumbers.arr[index-1] + fibNumbers.arr[index-2];
    }

    return fibNumbers;
}

/** Gives the sum of all even numbers in a given array. */
int evenSum(intArr arr)
{
    int sum = 0;

    for(int index = 0; index < arr.n; index++)
        if(arr.arr[index] % 2 == 0)
            sum += arr.arr[index];

    return sum;
}

int main(void)
{
    const int max = 4000000; // 4 mil

    int evenFibSum = evenSum(generateFibNumbers(max));

    printf("The sum of all even Fibonacci numbers less than %i is %i.\n", max, evenFibSum);
}