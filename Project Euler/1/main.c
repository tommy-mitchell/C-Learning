// sum of all multiples of 3 or 5 below 1000 (i.e, up to 999)

#include <stdlib.h>
#include <stdio.h>

#define numElements(base, max) (max/base - ((max % base == 0) ? 1 : 0 ))

typedef struct {
    int *arr;
    int n;
} intArr;

intArr findMultiples(int base, int max);
int sum(intArr arr);

intArr findMultiples(int base, int max)
{
    intArr multiples = {
        calloc(sizeof(int), numElements(base, max)),
        numElements(base, max)
    };

    if(multiples.arr!=NULL)
    {
        int *p = multiples.arr;
            *p = base;

        for(++p; p < multiples.arr + multiples.n; p++)
            *p += *(p - 1) + base;
    }

    return multiples;
}

int sum(intArr arr)
{
    int sum = 0;

    for(int index = 0; index<arr.n; index++)
        sum += arr.arr[index];

    return sum;
}

int main(void)
{
    const int max = 1000;
    
    int base1 = 3, base2 = 5;

    int sumMultiples = sum(findMultiples(base1, max)) + sum(findMultiples(base2, max)) - sum(findMultiples(base1*base2, max));

    printf("The sum of all multiples of %i or %i less than %i is %i.", base1, base2, max, sumMultiples);
}