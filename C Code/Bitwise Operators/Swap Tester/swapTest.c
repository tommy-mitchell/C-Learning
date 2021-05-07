#include <stdio.h>
#include "swap.h"

int main(void)
{
    printf("\n");

    int num1, num2;

    printf("Enter two numbers, seperated by a space: ");
        scanf("%i %i", &num1, &num2);
        printf("\n");

    printf("Before: \n");
        printf("\tnum1: %i\n", num1);
        printf("\tnum2: %i\n", num2);

    swap(num1, num2);
        printf("\n");

    printf("After: \n");
        printf("\tnum1: %i\n", num1);
        printf("\tnum2: %i\n", num2);

    printf("\n");

    return 0;
}