// takes a number string as an input, outputs the numerals as words

#include <stdio.h>

#define NUMBER_LENGTH (10 + 1) // length + 1 for null terminator ('\0')
#define println() printf("\n")
#define charisNumber(c) (c >= '0' && c <= '9')

const char* wordMap[10] = {
	"zero",
	"one",
	"two",
	"three",
	"four",
	"five",
	"six",
	"seven",
	"eight",
	"nine"
};

/** Converts a numeral character to its corresponding integer value. */
int charToInt(char c)
{
	return c - 48; // c - 48 = actual number, due to ASCII ('0' is 48)
}

int main(void)
{
	char number[NUMBER_LENGTH];

	printf("\nEnter a number (max %i digits): ", NUMBER_LENGTH-1);
		scanf("%10s", number); // yeah boss idk how to make this variable-length

	println();

	for(int index = 0; number[index]/*index<NUMBER_LENGTH*/; index++)
		if(charisNumber(number[index]))
			printf("%s ", wordMap[charToInt(number[index])]);

	println();

	return 0;
}