// sum of all multiples of 3 or 5 below 1000 (i.e, up to 999)

#include <stdlib.h>
#include <stdio.h>

#define numElements(base, max) (max/base - ((max % base == 0) ? 1 : 0 ))

int* findMultiples(int base, int max);
int  sum(int arr[], int length);

int* findMultiples(int base, int max)
{
    int length = numElements(base, max);
    
    int *multiples = malloc(length * sizeof(int));

    if(multiples != NULL)
    {
        multiples[0] = base;
        
        for(int index = 1; index < length; index++)
            multiples[index] = multiples[index - 1] + base;
    }

    return multiples;
}

int sum(int arr[], int length)
{
    int sum = 0;

    for(int index = 0; index < length; index++)
        sum += arr[index];

    return sum;
}

int main(void)
{
    const int max = 1000;
    
    int base1 = 3, base2 = 5;

    int sumMultiples = sum(findMultiples(base1, max), numElements(base1, max)) +
                       sum(findMultiples(base2, max), numElements(base2, max)) -
                       sum(findMultiples(base1 * base2, max), numElements((base1 * base2), max));

    printf("The sum of all multiples of %i or %i less than %i is %i.", base1, base2, max, sumMultiples);
}