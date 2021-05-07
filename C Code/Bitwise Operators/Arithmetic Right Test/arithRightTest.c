#include <stdio.h>
#include <stdbool.h>
#include <limits.h>

#define word int
#define WORD_LENGTH (sizeof(word) * CHAR_BIT)
#define HEX_WORD_LENGTH (WORD_LENGTH / sizeof(word))

/** Determines if the right shift operator (>>) is arithmetic or logical. */
bool isArithmetic(word num)
{
    const word one = 1 << (WORD_LENGTH - 1); // 100...0

    return num>>1 & one; // compares MSB of num to 1
}

int main(void)
{
    word num;

    for(int n = 0; n < HEX_WORD_LENGTH; n++) // sets num to be all As in hexadecimal
        num = num*16 + 0xA;

    printf("\n%s\n", isArithmetic(num) ? "Is arithmetic." : "Is logical.");

    return 0;
}