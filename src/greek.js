export class Greek {
    static greekLetters = [
        "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta",
        "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi", "Rho",
        "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi"
      ];
    
      static greekCharacters = [
        "\u0391", "\u0392", "\u0393", "\u0394", "\u0395", "\u0396", "\u0397", "\u0398",
        "\u0399", "\u039A", "\u039B", "\u039C", "\u039D", "\u039E", "\u039F", "\u03A0",
        "\u03A1", "\u03A3", "\u03A4", "\u03A5", "\u03A6", "\u03A7", "\u03A8"
      ];

    // getInt(str) {
    //     if (str.localeCompare("GCAs") === 0) {
    //         return 0;
    //     } else if (str.localeCompare("Founding Class") === 0) {
    //         return 1;
    //     }
    //     let letters;

    //     var arr = [];
    //     for (let s of str.split(" ")) {
    //         if (str.equalsIgnoreCase("Class")) continue;
    //         for (let j = 0; j < 23; j++) {
    //             if (s.localeCompare(Greek.greekLetters[j]) === 0) {
    //                 arr.push(j);
    //                 break;
    //             }
    //         }
    //     }

    //     let out = 2;
    //     let counter = 1;
    //     for (let i = 1; i < letters.length; i++) {
    //         out += (letters[letters.length - i].ordinal()) * counter;
    //         counter *= 23;
    //         out += counter;
    //     }
    //     out += (letters[0].ordinal()) * counter;
    //     return out;
    // }

    static getText(pc, english) {
        if (pc === 0) {
            return "GCAs";
        } else if (pc === 1) {
            return english ? "Founding Class" : "Founders";
        } else {
            var str = "";
            pc -= 2;
            let counter = 23;
            let length = 1;
            while (pc >= counter) {
                pc -= counter;
                length++;
                counter *= 23;
            }
            for (let i = 0; i < length - 1; i++) {
                counter /= 23;
                let tmp = Math.floor(pc / counter);
                str += (english ? Greek.greekLetters[tmp] : Greek.greekCharacters[tmp]) + " ";
                pc -= tmp * 23;
            }
            return str + (english ? Greek.greekLetters[pc] : Greek.greekCharacters[pc]) + (english ? " Class" : "");
        }
    }
}