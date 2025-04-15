class MorseCodeTranslator {
    private englishToMorseMap: Record<string, string> = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
        'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
        'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..',
        '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
        '6': '-....', '7': '--...', '8': '---..', '9': '----.',
        '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.',
        '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
        '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
        ' ': '/'
    };

    private morseToEnglishMap: Record<string, string>;

    constructor() {
        // Create reverse mapping for decoding
        this.morseToEnglishMap = Object.entries(this.englishToMorseMap).reduce(
            (acc, [key, value]) => {
                acc[value] = key;
                return acc;
            },
            {} as Record<string, string>
        );
    }

    /**
     * Converts English text to Morse code
     * @param text The text to convert to Morse code
     * @returns The Morse code representation
     */
    public encode(text: string): string {
        if (!text || text.trim() === '') {
            return '';
        }

        return text
            .toUpperCase()
            .split('')
            .map(char => this.englishToMorseMap[char] || char)
            .join(' ');
    }

    /**
     * Converts Morse code to English text
     * @param morse The Morse code to convert
     * @returns The English text representation
     */
    public decode(morse: string): string {
        if (!morse || morse.trim() === '') {
            return '';
        }

        return morse
            .split(' ')
            .map(code => this.morseToEnglishMap[code] || code)
            .join('');
    }
}

// Example usage
const translator = new MorseCodeTranslator();

// English to Morse
const textToEncode = "Hello World";
const morseCode = translator.encode(textToEncode);
console.log(`"${textToEncode}" in Morse code: ${morseCode}`);
// Output: "Hello World" in Morse code: .... . .-.. .-.. --- / .-- --- .-. .-.. -..

// Morse to English
const textToDecode = ".... . .-.. .-.. --- / .-- --- .-. .-.. -..";
const decodedText = translator.decode(textToDecode);
console.log(`"${textToDecode}" decoded to: ${decodedText}`);
// Output: ".... . .-.. .-.. --- / .-- --- .-. .-.. -.." decoded to: HELLO WORLD