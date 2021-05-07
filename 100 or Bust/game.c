#include "game.h"

void       updateGameState(void);

void       init_g(char *name1, char *name2);
TurnResult play_turn(Player *p);
void       end_turn(Player *p);

Game game;

// helper functions

    /** Initializes the game state and creates the players. */
    void init_g(char *name1, char *name2)
    {
        game.p1        = new_Player(name1);
        game.p2        = new_Player(name2);
        game.gameState = PLAYER_ONE_TURN;
    }

    /** Checks if either player has won and updates the game state accordingly. If not, the game state is set to the next turn. */
    void updateGameState(void)
    {
        if(game.p1.points >= POINTS_TO_WIN)
            game.gameState = PLAYER_ONE_WINS;
        else if(game.p2.points >= POINTS_TO_WIN)
            game.gameState = PLAYER_TWO_WINS;
        else
            game.gameState = (game.gameState == PLAYER_ONE_TURN) ? PLAYER_TWO_TURN : PLAYER_ONE_TURN;
    }

// interface functions

    /** Starts a new game using the given player names. */
    Game* new_Game(char *name1, char *name2)
    {
        init_g(name1, name2);

        game.playTurn = play_turn;
        game.endTurn  = end_turn;
            
        srand(time(0));

        return &game;
    }

    /**
     * Rolls the dice for the given player.
     * 
     * @param p The player whose turn it is.
     * 
     * @returns The two dice rolled and a flag denoting whether or not they're doubles.
     */
    TurnResult play_turn(Player *p)
    {
        Die die1 = rollDie();
        Die die2 = rollDie();

        bool isDoubles = false;

        if(die1 == die2)
        {
            p->currentTurn = 0;
            isDoubles = true;
        }
        else
            p->currentTurn += die1 + die2;

        return (TurnResult) { die1, die2, isDoubles };
    }

    /** Ends the given player's turn by adding their current turn total to their points, resets their turn total, and then updates the game state. */
    void end_turn(Player *p)
    {
        p->points += p->currentTurn;
        p->currentTurn = 0;

        updateGameState();
    }