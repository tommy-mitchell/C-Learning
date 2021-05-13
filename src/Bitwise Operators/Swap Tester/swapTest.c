#include <stdio.h>
#include <stdlib.h>
#include "swap.h"

int main(int argc, char* argv[])
{
    printf("\n");

    int num1, num2;

    if(argc > 1) // numbers inputted
    {
        num1 = strtol(argv[1], NULL, 10);
        num2 = strtol(argv[2], NULL, 10);
    }
    else // numbers from stdin
    {
        printf("Enter two numbers, seperated by a space: ");
            scanf("%i %i", &num1, &num2);
            printf("\n");
    }

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