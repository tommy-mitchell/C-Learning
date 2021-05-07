#include <time.h>
#include <assert.h>

#include "game.h"

int randomNumberInRange(int low, int high);
void init(void);
states add(int guess);
states check(int guess);

// helper functions

int randomNumberInRange(int low, int high)
{
    return rand() % (high + 1 - low) + low;
}

// -------

Game game;

/** Sets up the internal representation of the game. */
void setup(Game *g)
{
    game = *g;
        game.initialize = init;
        game.addGuess   = add;

    srand(time(0));
}

/** Initializes the game state. */
void init(void)
{
    game.number     = randomNumberInRange(NUMBER_RANGE_LOW, NUMBER_RANGE_HIGH);
    game.guessCount = 0;
    game.gameOver   = false;
    
    for(int index = 0; index < MAX_NUMBER_OF_GUESSES; index++)
        game.previousGuesses[index] = 0;
}

/**
 * Adds a guess, updating the state of the game if necessary.
 * 
 * @param guess The player's guess.
 * 
 * @returns A value representing if the guess is too high/low, or the win status if the game is over.
 */
states add(int guess)
{
    assert(!game.gameOver);

    // update game tracker
    game.previousGuesses[game.guessCount] = guess;
    game.guessCount++;

    states guessResult = check(guess);

    // game over
    if(guessResult == guess_correct || game.guessCount >= MAX_NUMBER_OF_GUESSES)
    {
        game.gameOver = true;

        return (guessResult == guess_correct) ? game_won : game_lost;
    }

    // return result if game is still playing (i.e. returns if guess is too high or too low)
    return guessResult;
}

/**
 * Compares a given guess to the game's random number.
 * 
 * @param guess The player's guess.
 * 
 * @returns The associated states enum if the guess is lower than, equal to, or greater than the number.
 */
states check(int guess)
{
    return (guess < game.number) ? guess_low : (guess > game.number) ? guess_high : guess_correct;
}