#include <stdio.h>
#include <limits.h>
#include <stdlib.h>
#include <math.h>

#define INT_LENGTH ( sizeof(int) * CHAR_BIT )
#define BIT_N(num) ( (int) log2( ( num ) ) + 1 )
typedef unsigned int uint;

int bitPatternSearch(uint number, int pattern, int patternLength);

int main(int argc, char *argv[])
{ 
    uint number  = 0;
    int  pattern = 0;
    int  length  = 0;

    if(argc > 1)
    {
        number  = strtoul(argv[1], NULL, 16);
        pattern =  strtol(argv[2], NULL, 16);
        length  =   BIT_N(pattern);
    }
    else
    {
        number  = 0xABCDEF12u;
        pattern = 0xAB;
        length  = 8;
    }

    int index = bitPatternSearch(number, pattern, length);
    
    printf("\nThe pattern 0x%X was %s in the number 0x%X", pattern, index != -1 ? "found" : "not found", number);

    if(index != -1)
        printf(" at index %i", index);

    printf(".\n");

    return 0;
}

/**
 * Determines if a given bit pattern is contained within a number.
 * 
 * @param number        The number to search within.
 * @param pattern       The pattern to search for.
 * @param patternLength The length of the pattern, in bits. Gives an error if <= 0, or >= the number of bits in an int.
 * 
 * @returns The index of the pattern, if found, where 0 is the MSB. Returns -1 if not found or in error.
 * 
 */
int bitPatternSearch(uint number, int pattern, int patternLength)
{
    if(patternLength <= 0 || patternLength >= INT_LENGTH)
    {
        printf("Length out of bounds.\n");
        return -1;
    }

    const int BITS = BIT_N(number); // number of bits in number
    const int MASK = (1 << patternLength) - 1; // a mask of 1s for all bits not tested for

    for(int index = 0; index < BITS - 1; index++)
    {
        int shiftAmount = BITS - patternLength - index;
        uint  maskedNum = (number >> shiftAmount) & MASK;

        if(!(maskedNum ^ pattern)) // compares the necessary bits to the pattern (gives 0 if same -> !)
            return index;
    }

    return -1;
}