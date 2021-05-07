#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "player.h"
#include "dice.h"
#include "game.h"

#define MAX_NAME_LENGTH 20
#define MAX(a, b)       ( ( (a) > (b) ) ? (a) : (b) )

void   printRules(void);
choice printMenu(void);
void   getPlayerName(int playerNumber, char *name);
bool   playTurn(Player *p);
void   playGame(void);

Game game;

/** Welcomes the players to the game and explains the rules. */
void printRules(void)
{
    printf("\n\t\t\t\tWelcome to 100 or Bust!\n");
    printf("\nThis is a two-player game, where your points come from the faces of two dice rolls. In order to win, you need\n at least %i points.\n", POINTS_TO_WIN); 
    printf("\nOn your turn, you can do one of the following: \n\n");
        printf("\t1. Roll dice\n");
        printf("\t2. Stop turn\n");
    printf("\nEach time you roll the dice, your total for the current turn is increased by the sum of the numbers on the faces\n of the dice. "); 
    printf(  "At the end of your turn, your point total will be increased by your current turn total.\n");
    printf("\nBut be warned! If you happen to roll doubles, you earn NO points for the entire turn! Be careful about\n continuously rolling.\n");
    printf("\nGood luck!\n");
}

/** Prints player turn choices and returns the player's choice. */
choice printMenu(void)
{
    printf("\n--- Menu ---\n");
        printf("\t1. Roll dice\n");
        printf("\t2. Stop turn\n");
        printf("\n");

    choice choice = 0;

    printf("\tEnter your choice: ");
        scanf("%1i", &choice);

    return choice;
}

/** Prompts the user for the name of the given player. */
void getPlayerName(int playerNumber, char *name)
{
    char format[11]; // string buffer based on MAX_NAME_LENGTH
        sprintf(format, " %%%i[^\n]s", MAX_NAME_LENGTH); // format -> " %MAX[^\n]s" -> entire line up to whitespace or MAX

    printf("\nEnter the name of player %i: ", playerNumber);
        scanf(format, name);
}

bool playTurn(Player *p)
{
    bool rolledDoubles = false;

    while(true)
    {
        choice choice = printMenu();

        // end turn
        if(choice == choice_stop)
            break;

        // roll dice
        TurnResult result = game.playTurn(p);

        printDice((Die[2]) { result.die1, result.die2 }, 2, "\t"); // print the two dice in a row with one level of indentation

        // doubles -> no points
        if(result.isDoubles)
        {
            printf("\nSorry, you rolled doubles! You earn no points this turn. ");

            rolledDoubles = true;
                break;
        }

        // tell points
        printf("\nYou rolled a %i and a %i. Your turn total is %i, and you have %i points.\n", result.die1, result.die2, p->currentTurn, p->points);
            printf("\t( With your roll(s), you'd have %i points. )\n", p->points + p->currentTurn);
    }

    return rolledDoubles;
}

/** Plays the game until a player wins (i.e. reaches POINTS_TO_WIN) */
void playGame(void)
{
    Player *p;
    
    while(game.gameState == PLAYER_ONE_TURN || game.gameState == PLAYER_TWO_TURN)
    {
        // get player for this turn
        p = (game.gameState == PLAYER_ONE_TURN) ? &game.p1 : &game.p2;

        printf("\nIt's your turn, %s! You have %i points.\n", p->name, p->points); // player %i

        // roll
        bool rolledDoubles = playTurn(p);

        // end of turn
        if(rolledDoubles)
        {
            printf("You still have %i points.\n", p->points);
            game.endTurn(p);
        }
        else
        {
            printf("\nYou earned %i points this turn, ", p->currentTurn);
                game.endTurn(p);
                printf("bringing your total to %i.\n", p->points);
        }

        printf("\n--------------------------------------------------\n");
    }
}


int main(void)
{
    printRules();

    // get player names - create name instances so they don't go out of scope

    printf("\n--------------------------------------------------\n");

    char *name1 = malloc(MAX_NAME_LENGTH + 1);
        getPlayerName(1, name1);
    char *name2 = malloc(MAX_NAME_LENGTH + 1);
        getPlayerName(2, name2);

    game = *(new_Game(name1, name2));

    printf("\n--------------------------------------------------\n");

    playGame();

    // end game

    int longestNameLength = MAX(strlen(game.p1.name), strlen(game.p2.name));
        char format[14]; // string length based on longest name
        sprintf(format, "\t%%%is: %%3i\n", longestNameLength); // "\t%LONGESTs: %3i"

    printf("\nGame over!\n");
        printf(format, game.p1.name, game.p1.points);
        printf(format, game.p2.name, game.p2.points);
        printf("\n");

        Player *winner = (game.gameState == PLAYER_ONE_WINS) ? &game.p1 : &game.p2;
        Player *loser  = (game.gameState == PLAYER_ONE_WINS) ? &game.p2 : &game.p1;

        printf("\t%s, you win! You beat %s by %i points.\n\n", winner->name, loser->name, winner->points - loser->points);

    system("pause"); // "Press any key to continue . . . "

    return 0;
}