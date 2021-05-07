#include "player.h"

/** Creates a new Player with the given name. */
Player new_Player(char *playerName)
{
    Player p;
        p.name        = playerName;
        p.points      = 0;
        p.currentTurn = 0;

    return p;
}