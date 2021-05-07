#ifndef NMB_GSR_GAME
#define NMB_GSR_GAME

    #include <stdbool.h>
    #include <math.h>
                                                                // could be ceil( log2(HIGH - LOW + 1) )
                                        // hard mode: 7            -> log2(100) = 6.64 -> 7 (i.e. need at most 7, using BST algorithm)
    //#define MAX_NUMBER_OF_GUESSES ((int) ceil( log2(NUMBER_RANGE_HIGH - NUMBER_RANGE_LOW + 1) ))


    #define MAX_NUMBER_OF_GUESSES 10
    #define NUMBER_RANGE_LOW      1
    #define NUMBER_RANGE_HIGH     100
    

    typedef enum _states {
        guess_low = -1,
        guess_correct,
        guess_high,
        game_lost,
        game_won
    } states;

    typedef struct _game {
        // pointers to functions

        /** Initializes the game state. */
        void   (*initialize) (void);
        /**
         * Adds a guess, updating the state of the game if necessary.
         * 
         * @param guess The player's guess.
         * 
         * @returns A value representing if the guess is too high/low, or the win status if the game is over.
         */
        states (*addGuess)   (int guess);

        int  number;
        int  guessCount;
        bool gameOver;
        int  previousGuesses[MAX_NUMBER_OF_GUESSES];
    } Game;

    void setup(Game *g);

#endif