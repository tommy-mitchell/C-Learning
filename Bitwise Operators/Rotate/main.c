#include <stdio.h>
#include <stdbool.h>
#include <limits.h>
 
#define INT_LENGTH (sizeof(int) * CHAR_BIT)
typedef unsigned int uint;

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

int main(void)
{
    uint number = 0xABCDEF12u;
    int  shiftAmount;

    printf("\nNumber: 0x%X\n\nEnter the number of bytes to rotate (+ left, - right): ", number);
        scanf("%i", &shiftAmount);
        printf("\n");

    rotate(&number, shiftAmount*sizeof(int));

    printf("The number rotated %i times: 0x%X\n", shiftAmount, number);

    return 0;
}