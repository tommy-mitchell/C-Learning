#include <stdio.h>

int intSize()
{
    int num = ~0, counter = 0;

    while(num!=0)
    {
        num <<= 1;
        counter++;
    }

    return counter;
}

int main(void)
{
    printf("\nThe number of bits in an int is %i.\n", intSize());

    return 0;
}