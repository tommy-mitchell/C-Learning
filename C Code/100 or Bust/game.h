#ifndef ONE_HDR_GAME
#define ONE_HDR_GAME

    #include <stdbool.h>
    #include "player.h"
    #include "dice.h"

    #define POINTS_TO_WIN 100

    typedef enum gameState {
        PLAYER_ONE_TURN = 1,
        PLAYER_ONE_WINS,
        PLAYER_TWO_TURN,
        PLAYER_TWO_WINS
    } gameState;

    typedef enum choices {
        choice_roll = 1,
        choice_stop
    } choice;

    typedef struct TurnResult {
        Die  die1;
        Die  die2;
        bool isDoubles;
    } TurnResult;

    typedef struct Game {
        // pointers to functions

        /** Ends the given player's turn by adding their current turn total to their points, resets their turn total, and then updatss the game state. */
        void       (*endTurn)    (Player *p);
        /**
         * Rolls the dice for the given player.
         * 
         * @param p The player whose turn it is.
         * 
         * @returns The two dice rolled and a flag denoting whether or not they're doubles.
         */
        TurnResult (*playTurn)   (Player *p);
        
        Player    p1;
        Player    p2;
        gameState gameState;
    } Game;

    Game* new_Game(char *name1, char *name2);

#endif