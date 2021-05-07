#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include "dice.h"

#define println(s) ( printf("\n%s", (s) ) )

int  randomNumberInRange(int low, int high);
Die  rollDie(void);
void printRow(Die dies[], int n, const char* const row[], const char *indentation);

/*
                        _________ 
                       |         |
                       |         |
                       |         |
                       |         |
                       |_________|
*/

const char one[]    = " _________      ";

const char left[]   = "|  O      |     ";
const char middle[] = "|    O    |     ";
const char right[]  = "|      O  |     ";
const char both[]   = "|  O   O  |     ";
const char open[]   = "|         |     ";

const char end[]    = "|_________|     ";

// the rows of each respective die face (assumes 6-sided)

const char* const tops[7] = { "",   open,  left,   left, both,   both, both };
const char* const mids[7] = { "", middle,  open, middle, open, middle, both };
const char* const bots[7] = { "",   open, right,  right, both,   both, both };

// helper functions

    /** Generates a random number in the given range, inclusive. */
    int randomNumberInRange(int low, int high)
    {
        return rand() % (high + 1 - low) + low;
    }

    /** Generates a random dice roll. */
    Die rollDie(void)
    {
        return randomNumberInRange(1, 6);
    }

    /** Prints the given row of the given n dies. */
    void printRow(Die dies[], int n, const char* const row[], const char *indentation)
    {
        for(int index = 0; index < n; index++)
            printf(row[dies[index]]); // print a row based on the face-number of the die

        println(indentation);
    }

// interface functions

    /** Prints the given n dies in a row, indenting the first die accordingly. */
    void printDice(Die dies[], int n, char *indentation)
    {
        //println(indentation);
        printf(indentation);

        printRow((Die[7]) { 0 }, n, (const char* const[]) {  one }, indentation); // " _________ "
        printRow((Die[7]) { 0 }, n, (const char* const[]) { open }, indentation); // "|         |"

        printRow(dies, n, tops, indentation);
        printRow(dies, n, mids, indentation);
        printRow(dies, n, bots, indentation);

        printRow((Die[7]) { 0 }, n, (const char* const[]) {  end }, indentation); // "|_________|"
    }