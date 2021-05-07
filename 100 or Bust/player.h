#ifndef ONE_HDR_PLYR
#define ONE_HDR_PLYR

    #include <stdbool.h>

    typedef struct Player {
        char *name;
        int   points;
        int   currentTurn;
    } Player;

    Player new_Player(char *playerName);

#endif