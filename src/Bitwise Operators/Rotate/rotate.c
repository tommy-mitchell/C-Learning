#include <stdio.h>
#include <stdbool.h>
#include <limits.h>
#include <stdlib.h>
 
#define INT_LENGTH (sizeof(int) * CHAR_BIT)
typedef unsigned int uint;

void rotate(uint *number, int n);

int main(int argc, char* argv[])
{
    printf("\n");
    
    uint number = 0xABCDEF12u;
    int  shiftAmount;

    if(argc > 1)
    {
        number      = strtoul(argv[1], NULL, 16);
        shiftAmount =  strtol(argv[2], NULL, 10);
    }
    else
    {
        printf("Number: 0x%X\n\n", number);
        printf("Enter the number of bits to rotate (+ left, - right): ");
            scanf("%i", &shiftAmount);
            printf("\n");
    }

    uint originalNumber = number;

    rotate(&number, shiftAmount * sizeof(int));

    printf("The number 0x%X rotated %i times: 0x%X\n", originalNumber, shiftAmount, number);

    return 0;
}

/**
 * Rotates the bits of an integer.
 * 
 * @param number A pointer to the number to be rotated.
 * @param n      The number of rotations. Will rotate left if positive, right if negative.
 * 
 */
void rotate(uint *number, int n)
{
    n = (n > 0) ? n % INT_LENGTH : -(-n % INT_LENGTH); // bounds n to length of an int

    if(n > 0) // shift left
        *number = (*number <<  n) | (*number >> (INT_LENGTH -  n));
    else if(n < 0) // shift right
        *number = (*number >> -n) | (*number << (INT_LENGTH - -n));
}