#include <stdio.h>
#include <stdbool.h>

#include "game.h"

void printTurn(int *guess);

Game game;

/** Prints the current turn, showing the previous guesses and the number of guesses remaining. Gets user input for the next guess. */
void printTurn(int *guess)
{
    printf("\n\tPrevious guesses: ");
        for(int index = 0; index < MAX_NUMBER_OF_GUESSES; index++)
            if(game.previousGuesses[index])
                printf("%i%s ", game.previousGuesses[index], (game.previousGuesses[index + 1]) ? "," : ""); // inputs comma unless next index DNE

        printf("\n");

    printf("\tNumber remaining: %i\n", MAX_NUMBER_OF_GUESSES - game.guessCount);

    printf("\tEnter your guess: ");
        scanf("%i", guess);
        printf("\n");
}

void playGame(void)
{
    game.initialize();

    printf("\nGuess a random number between %i and %i, inclusive. You have %i guesses. Good luck!\n", NUMBER_RANGE_LOW, NUMBER_RANGE_HIGH, MAX_NUMBER_OF_GUESSES);

    int guess;

    while(!game.gameOver)
    {
        // get new guess
        printTurn(&guess);

        states result = game.addGuess(guess);

        // wrong guess
        if(result != game_won)
            printf("Incorrect! %i is not the number. Your guess was too %s.\n", guess, (result == guess_low) ? "low" : "high");

        // game over
        if(result == game_won || result == game_lost)
        {
            if(result == game_won)
                printf("Correct! The number was %i. You win! You used %i guesses.\n", game.number, game.guessCount);
            else
                printf("\nYou've run out of guesses. Sorry, you lose. The number was %i.\n", game.number);
            
            break;
        }
    }
}

int main(void)
{
    setup(&game);
    
    bool continueFlag = true;

    while(continueFlag)
    {
        char c;

        /*printf("\nHard mode? (Y/N): ");
            scanf(" %c", &c);*/

        playGame();

        printf("\n\tContinue? (Y/N): ");
            scanf(" %c", &c);

        if(c == 'N' || c == 'n')
            continueFlag = false;
    }

    printf("\nThanks for playing!\n");

    printf("\n") && system("pause"); // "Press any key to continue . . . "

    return 0;
}