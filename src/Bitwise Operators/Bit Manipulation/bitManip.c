#include <stdio.h>
#include <stdbool.h>
#include <limits.h>
 
#define INT_LENGTH (sizeof(int) * CHAR_BIT) // number of bytes in an int * length of a byte
typedef unsigned int uint;

/**
 * Checks if a given bit is set.
 * 
 * @param number The number to be tested.
 * @param index  The index of the bit, where 0 is the MSB. Gives an error if index is outside of the bounds of the number of bits in an int.
 */
bool testBit(uint number, int index)
{
    if(index < 0 || index >= INT_LENGTH)
    {
        printf("Error: index does not exist.\n");
        return false;
    }

    return (number << index) & (1 << (INT_LENGTH - 1)); // compares number to 100...0b (i.e only returns true if indexed bit of number is 1)
}

// TODO: make negative values start from last index

/**
 * Sets a given bit in a number.
 * 
 * @param number A pointer to the number.
 * @param index  The index of the bit, where 0 is the MSB. Gives an error if index is outside of the bounds of the number of bits in an int.
 */
bool setBit(uint *number, int index)
{
    if(index < 0 || index >= INT_LENGTH)
    {
        printf("Error: index does not exist.\n");
        return false;
    }

    *number |= 1 << ((INT_LENGTH - 1) - index); // moves a 1 the correct number of bits to left and ORs it

    return true;
}

#define ENTER_NUMBER 1
#define  VIEW_NUMBER 2
#define      SET_BIT 3
#define     TEST_BIT 4
#define         EXIT 5

void printMenu(int *choice)
{
    printf("\n---Menu---\n");
        printf("\t1. Enter a Number\n");
        printf("\t2. View your Number\n");
        printf("\t3. Set Bit\n");
        printf("\t4. Test Bit\n");
        printf("\t5. Exit\n");

        while(*choice < ENTER_NUMBER || *choice > EXIT)
        {
            printf("\n\tEnter your choice: ");
                scanf("%i", choice);
        }

        printf("\n");
}

int main(void)
{
    uint number;
     int index;
     int choice = 0;
    
    bool assigned = false;

    while(true)
    {
        printMenu(&choice);

        if(choice == EXIT)
            break;
        else if(choice == ENTER_NUMBER)
        {
            printf("Enter an 8-digit hexadecimal number: ");
                scanf("%8x", &number);
                printf("\n");

            printf("The number 0x%X has been saved.\n", number);

            assigned = true;
        }
        else
        {
            if(!assigned)
                printf("No number has been entered.\n");
            else if(choice == VIEW_NUMBER)
                printf("Your number is 0x%X.\n", number);
            else if(choice == SET_BIT || choice == TEST_BIT)
            {
                printf("Enter a bit index to %s: ", choice == SET_BIT ? "set" : "test");
                    scanf("%i", &index);
                    printf("\n");

                if(choice == SET_BIT)
                {
                    uint oldNum = number;
                    printf("The bit at index %i in the number 0x%X was %s.\n", index, oldNum, setBit(&number, index) ? "set" : "not set");
                        printf("\tYour new number is 0x%X.\n", number);
                }
                else
                    printf("The bit at index %i in the number 0x%X is %s.\n" , index, number, testBit(number, index) ? "set" : "not set");
            }
        }

        choice = 0;
    }

    return 0;
}