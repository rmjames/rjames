
const audioAssets = import.meta.glob('../assets/audio/**/*', { eager: true, query: '?url', import: 'default' });

// Helper to find asset key robustly
function findAssetKey(src) {
    if (!src) return null;
    if (audioAssets[src]) return src;

    // Try verifying path normalization quirks
    // Vite glob keys are exactly as written in the pattern prefix + file path
    // Sometimes spaces or special chars might be issue.
    
    const keys = Object.keys(audioAssets);
    const fileName = src.split('/').pop();
    const lowerFileName = fileName.toLowerCase();

    // 1. Try URI encoded version (Vite sometimes encodes keys?)
    // 2. Try looking for exact ending match (file name)
    // 3. Case insensitive suffix match

    const match = keys.find(k => 
        k.endsWith('/' + fileName) || 
        k === fileName ||
        k.toLowerCase().endsWith('/' + lowerFileName) || 
        k.toLowerCase() === lowerFileName
    );
    
    if (match) {
        console.debug('Fuzzy matched asset:', src, '->', match);
        return match;
    }
    
    return null;
}

class AudioLibrary {
    constructor() {
        this._rawTracks = [
    {
        "id": "fabolous-01-fabolous-transformation",
        "title": "01 Fabolous - Transformation",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/01 Fabolous - Transformation.mp3",
        "genre": "Hip-Hop",
        "album": "The Soul Tape 2",
        "duration": 238.52408163265306,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-02-fabolous-for-the-love-prod-by-streetrunner",
        "title": "02 Fabolous - For The Love [Prod. By Streetrunner]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/02 Fabolous - For The Love [Prod. By Streetrunner].mp3",
        "genre": "Hip-Hop",
        "album": "The Soul Tape 2",
        "duration": 177.192,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-03-fabolous-b-i-t-e-prod-by-teddy-da-don",
        "title": "03 Fabolous - B.I.T.E. [Prod. By Teddy Da Don]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/03 Fabolous - B.I.T.E. [Prod. By Teddy Da Don].mp3",
        "genre": "Hip-Hop",
        "album": "The Soul Tape 2",
        "duration": 237.66204081632654,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-04-fabolous-we-get-high-prod-by-c-sick",
        "title": "04 Fabolous - We Get High [Prod. By C-Sick]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/04 Fabolous - We Get High [Prod. By C-Sick].mp3",
        "genre": "Hip-Hop",
        "album": "The Soul Tape 2",
        "duration": 256.2873469387755,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-05-fabolous-diamonds-prod-by-mally-the-martian-hype",
        "title": "05 Fabolous - Diamonds [Prod. By Mally The Martian & Hype]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/05 Fabolous - Diamonds [Prod. By Mally The Martian & Hype].mp3",
        "genre": "Hip-Hop",
        "album": "The Soul Tape 2",
        "duration": 252.504,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-06-fabolous-guess-whos-bizzack-feat-broadway-prod-by-mally-the-martian",
        "title": "06 Fabolous - Guess Whos Bizzack (Feat. Broadway) [Prod. By Mally The Martian]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/06 Fabolous - Guess Whos Bizzack (Feat. Broadway) [Prod. By Mally The Martian].mp3",
        "genre": "Hip-Hop",
        "album": "The Soul Tape 2",
        "duration": 206.00163265306122,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-07-fabolous-louis-vuitton-feat-j-cole",
        "title": "07 Fabolous - Louis Vuitton (Feat. J.Cole)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/07 Fabolous - Louis Vuitton (Feat. J.Cole).mp3",
        "genre": "Hip-Hop",
        "album": "The Soul Tape 2",
        "duration": 296.5942857142857,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-08-fabolous-life-is-so-exciting-feat-pusha-t-prod-by-the-arsenals-sarah-j",
        "title": "08 Fabolous - Life Is So Exciting (Feat. Pusha T) [Prod. By The Arsenals & Sarah J]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/08 Fabolous - Life Is So Exciting (Feat. Pusha T) [Prod. By The Arsenals & Sarah J].mp3",
        "genre": "Hip-Hop",
        "album": "The Soul Tape 2",
        "duration": 245.02857142857144,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-09-fabolous-only-life-i-know-feat-troy-ave-prod-by-john-scino",
        "title": "09 Fabolous - Only Life I Know (Feat. Troy Ave) [Prod. By John Scino]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/09 Fabolous - Only Life I Know (Feat. Troy Ave) [Prod. By John Scino].mp3",
        "genre": "Hip-Hop",
        "album": "The Soul Tape 2",
        "duration": 338.1812244897959,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-10-fabolous-diced-pineapples-feat-trey-songz-cassie-prod-by-cardiak",
        "title": "10 Fabolous - Diced Pineapples (Feat. Trey Songz & Cassie) [Prod. By Cardiak]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/10 Fabolous - Diced Pineapples (Feat. Trey Songz & Cassie) [Prod. By Cardiak].mp3",
        "genre": "Hip-Hop",
        "album": "The Soul Tape 2",
        "duration": 330.2661224489796,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-11-fabolous-beauty-feat-wale-prod-by-araabmuzik",
        "title": "11 Fabolous - Beauty (Feat. Wale) [Prod. By Araabmuzik]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/11 Fabolous - Beauty (Feat. Wale) [Prod. By Araabmuzik].mp3",
        "genre": "Hip-Hop",
        "album": "The Soul Tape 2",
        "duration": 201.40408163265306,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-12-fabolous-want-you-back-feat-joe-budden-teyana-taylor-prod-by-sonaro",
        "title": "12 Fabolous - Want You Back (Feat. Joe Budden & Teyana Taylor) [Prod. By Sonaro]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/12 Fabolous - Want You Back (Feat. Joe Budden & Teyana Taylor) [Prod. By Sonaro].mp3",
        "genre": "Hip-Hop",
        "album": "The Soul Tape 2",
        "duration": 346.09632653061226,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-b-e-t-ft-jadakiss-styles-p-datpiff-exclusive",
        "title": "B.E.T ft Jadakiss & Styles P (DatPiff Exclusive)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/10 - BET ft Jadakiss & Styles P (DatPiff Exclusive).mp3",
        "genre": "Hip-Hop",
        "album": "There Is No Competition: Death Comes In 3's",
        "duration": 165.4073469387755,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-black-city-datpiff-exclusive",
        "title": "Black City (DatPiff Exclusive)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/08 - Black City (DatPiff Exclusive).mp3",
        "genre": "Hip-Hop",
        "album": "There Is No Competition: Death Comes In 3's",
        "duration": 113.13632653061225,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-death-comes-in-3-s-datpiff-exclusive",
        "title": "Death Comes in 3's (DatPiff Exclusive)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/02 - Death Comes in 3s (DatPiff Exclusive).mp3",
        "genre": "Hip-Hop",
        "album": "There Is No Competition: Death Comes In 3's",
        "duration": 163.2130612244898,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-death-in-the-family-ft-paul-cain-datpiff-exclusive",
        "title": "Death In The Family Ft Paul Cain (DatPiff Exclusive)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/13 - Death In The Family Ft Paul Cain (DatPiff Exclusive).mp3",
        "genre": "Hip-Hop",
        "album": "There Is No Competition: Death Comes In 3's",
        "duration": 241.2930612244898,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-dram-s-on-time-datpiff-exclusive",
        "title": "Dram's On Time (DatPiff Exclusive)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/14 - Drams On Time (DatPiff Exclusive).mp3",
        "genre": "Hip-Hop",
        "album": "There Is No Competition: Death Comes In 3's",
        "duration": 46.027755102040814,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-get-down-or-lay-down-ft-lloyd-banks-datpiff-exclusive",
        "title": "Get Down or Lay Down Ft Lloyd Banks (DatPiff Exclusive)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/11 - Get Down or Lay Down Ft Lloyd Banks (DatPiff Exclusive).mp3",
        "genre": "Hip-Hop",
        "album": "There Is No Competition: Death Comes In 3's",
        "duration": 194.56,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-got-that-work-datpiff-exclusive",
        "title": "Got That Work (DatPiff Exclusive)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/09 - Got That Work (DatPiff Exclusive).mp3",
        "genre": "Hip-Hop",
        "album": "There Is No Competition: Death Comes In 3's",
        "duration": 176.3526530612245,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-intro-datpiff-exclusive",
        "title": "Intro (DatPiff Exclusive)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/01 - Intro (DatPiff Exclusive).mp3",
        "genre": "Hip-Hop",
        "album": "There Is No Competition: Death Comes In 3's",
        "duration": 82.10285714285715,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-lord-knows-datpiff-exclusive",
        "title": "Lord Knows (DatPiff Exclusive)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/15 - Lord Knows (DatPiff Exclusive).mp3",
        "genre": "Hip-Hop",
        "album": "There Is No Competition: Death Comes In 3's",
        "duration": 549.7208163265307,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-she-did-it-datpiff-exclusive",
        "title": "She Did It (DatPiff Exclusive)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/06 - She Did It (DatPiff Exclusive).mp3",
        "genre": "Hip-Hop",
        "album": "There Is No Competition: Death Comes In 3's",
        "duration": 178.99102040816325,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-spend-it-ft-trey-songz-datpiff-exclusive",
        "title": "Spend It ft Trey Songz (DatPiff Exclusive)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/07 - Spend It ft Trey Songz (DatPiff Exclusive).mp3",
        "genre": "Hip-Hop",
        "album": "There Is No Competition: Death Comes In 3's",
        "duration": 223.3991836734694,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-swag-champ-datpiff-exclusive",
        "title": "Swag Champ (DatPiff Exclusive)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/04 - Swag Champ (DatPiff Exclusive).mp3",
        "genre": "Hip-Hop",
        "album": "There Is No Competition: Death Comes In 3's",
        "duration": 208.3787755102041,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-the-widows-datpiff-exclusive",
        "title": "The Widows (DatPiff Exclusive)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/05 - The Widows (DatPiff Exclusive).mp3",
        "genre": "Hip-Hop",
        "album": "There Is No Competition: Death Comes In 3's",
        "duration": 24.58122448979592,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-unfuckwitable-datpiff-exclusive",
        "title": "Unfuckwitable (DatPiff Exclusive)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/12 - Unfuckwitable (DatPiff Exclusive).mp3",
        "genre": "Hip-Hop",
        "album": "There Is No Competition: Death Comes In 3's",
        "duration": 232.15020408163267,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-you-dont-know-bout-it-ft-meek-mill-datpiff-exclusive",
        "title": "You Dont Know Bout It ft Meek Mill (DatPiff Exclusive)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/03 - You Dont Know Bout It ft Meek Mill (DatPiff Exclusive).mp3",
        "genre": "Hip-Hop",
        "album": "There Is No Competition: Death Comes In 3's",
        "duration": 219.32408163265305,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "ghostface-killah-260-feat-raekwon",
        "title": "260 feat Raekwon",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/04. 260 feat Raekwon.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 166.92244897959185,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-after-the-smoke-is-clear-fea-the-delphonics",
        "title": "After The Smoke Is Clear fea The Delphonics",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/14. After The Smoke Is Clear fea The Delphonics.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 197.4334693877551,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-all-that-i-got-is-you-feat-mary-j-blige",
        "title": "All That I Got Is You feat Mary J Blige",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/15. All That I Got Is You feat Mary J Blige.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 321.2277551020408,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-assassination-day-feat-raekwon-the-rza-inspectah-deck",
        "title": "Assassination Day feat Raekwon, The RZA & Inspectah Deck",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/05. Assassination Day feat Raekwon, The RZA & Inspectah Deck.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 258.35102040816327,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-black-jesus-feat-raekwon-u-god",
        "title": "Black Jesus feat Raekwon & U-God",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/13. Black Jesus feat Raekwon & U-God.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 277.23755102040815,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-box-in-hand-feat-method-man-street",
        "title": "Box In Hand feat Method Man & Street",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/08. Box In Hand feat Method Man & Street.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 194.79510204081632,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-camay-feat-raekwon-cappadonna",
        "title": "Camay feat Raekwon & Cappadonna",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/10. Camay feat Raekwon & Cappadonna.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 274.1812244897959,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-daytona-500-feat-raekwon-cappadonna",
        "title": "Daytona 500 feat Raekwon & Cappadonna",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/11. Daytona 500 feat Raekwon & Cappadonna.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 280.55510204081634,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-fish-feat-raekwon-cappadonna",
        "title": "Fish feat Raekwon & Cappadonna",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/09. Fish feat Raekwon & Cappadonna.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 230.55673469387756,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-iron-maiden-feat-raekwon-cappadonna",
        "title": "Iron Maiden feat Raekwon & Cappadonna",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/01. Iron Maiden feat Raekwon & Cappadonna.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 286.7722448979592,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-marvel",
        "title": "Marvel",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/17. Marvel.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 310.3608163265306,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-motherless-child-feat-raekwo",
        "title": "Motherless Child feat Raekwo",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/12. Motherless Child feat Raekwo.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 225.33224489795919,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-poisonous-darts",
        "title": "Poisonous Darts",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/06. Poisonous Darts.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 135.52326530612245,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-the-faster-blade-feat-raekwon",
        "title": "The Faster Blade feat Raekwon",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/03. The Faster Blade feat Raekwon.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 147.95755102040818,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-the-soul-controller-feat-the-force-md-s",
        "title": "The Soul Controller feat The Force MD's",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/16. The Soul Controller feat The Force MD's.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 410.5404081632653,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-wildflower",
        "title": "Wildflower",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/02. Wildflower.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 206.88979591836735,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-winter-warz-feat-cappadonna-u-god-masta-killa",
        "title": "Winter Warz feat Cappadonna, U-God & Masta Killa",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/07. Winter Warz feat Cappadonna, U-God & Masta Killa.mp3",
        "genre": "Rap",
        "album": "Ironman",
        "duration": 280.71183673469386,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "j-dilla-crushin-yeeeeaah",
        "title": "Crushin (Yeeeeaah!)",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/09 - Crushin’ (Yeeeeaah!).mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 223.24244897959184,
        "albumArt": null
    },
    {
        "id": "j-dilla-crushin-yeeeeeah-instrumental",
        "title": "Crushin' (Yeeeeeah!) (Instrumental)",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/206 - Crushin' (Yeeeeeah!) (Instrumental).mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 221.25714285714287,
        "albumArt": null
    },
    {
        "id": "j-dilla-interlude",
        "title": "Interlude",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/06 - Interlude.mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 49.47591836734694,
        "albumArt": null
    },
    {
        "id": "j-dilla-interlude",
        "title": "Interlude",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/08 - Interlude.mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 45.29632653061225,
        "albumArt": null
    },
    {
        "id": "j-dilla-intro",
        "title": "Intro",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/01 - Intro.mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 17.78938775510204,
        "albumArt": null
    },
    {
        "id": "j-dilla-intro-alt",
        "title": "Intro (Alt)",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/11 - Intro (Alt).mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 48.19591836734694,
        "albumArt": null
    },
    {
        "id": "j-dilla-intro-alt-instrumental",
        "title": "Intro (Alt) (Instrumental)",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/207 - Intro (Alt) (Instrumental).mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 46.7069387755102,
        "albumArt": null
    },
    {
        "id": "j-dilla-let-s-take-it-back",
        "title": "Let's Take It Back",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/02 - Let's Take It Back.mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 130.50775510204082,
        "albumArt": null
    },
    {
        "id": "j-dilla-let-s-take-it-back-instrumental",
        "title": "Let's Take It Back (Instrumental)",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/201 - Let's Take It Back (Instrumental).mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 126.66775510204081,
        "albumArt": null
    },
    {
        "id": "j-dilla-make-em-nv",
        "title": "Makeem NV",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/07 - Make’em NV.mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 145.11020408163265,
        "albumArt": null
    },
    {
        "id": "j-dilla-make-em-nv-instrumental",
        "title": "Make'Em NV (Instrumental)",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/205 - Make'Em NV (Instrumental).mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 144.71836734693878,
        "albumArt": null
    },
    {
        "id": "j-dilla-nothing-like-this",
        "title": "Nothing Like This",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/04 - Nothing Like This.mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 153.73061224489797,
        "albumArt": null
    },
    {
        "id": "j-dilla-nothing-like-this-instrumental",
        "title": "Nothing Like This (Instrumental)",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/203 - Nothing Like This (Instrumental).mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 154.01795918367347,
        "albumArt": null
    },
    {
        "id": "j-dilla-reckless-driving",
        "title": "Reckless Driving",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/03 - Reckless Driving.mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 161.98530612244897,
        "albumArt": null
    },
    {
        "id": "j-dilla-reckless-driving-instrumental",
        "title": "Reckless Driving (Instrumental)",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/202 - Reckless Driving (Instrumental).mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 161.98530612244897,
        "albumArt": null
    },
    {
        "id": "j-dilla-shouts",
        "title": "Shouts",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/10 - Shouts.mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 51.82693877551021,
        "albumArt": null
    },
    {
        "id": "j-dilla-shouts-alt",
        "title": "Shouts (Alt)",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/14 - Shouts (Alt).mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 107.2065306122449,
        "albumArt": null
    },
    {
        "id": "j-dilla-shouts-alt-instrumental",
        "title": "Shouts (Alt) (Instrumental)",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/210 - Shouts (Alt) (Instrumental).mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 107.2065306122449,
        "albumArt": null
    },
    {
        "id": "j-dilla-take-notice-feat-guilty-simpson",
        "title": "Take Notice (feat. Guilty Simpson)",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/13 - Take Notice (feat. Guilty Simpson).mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 265.40408163265306,
        "albumArt": null
    },
    {
        "id": "j-dilla-take-notice-instrumental",
        "title": "Take Notice (Instrumental)",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/209 - Take Notice (Instrumental).mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 266.13551020408164,
        "albumArt": null
    },
    {
        "id": "j-dilla-the",
        "title": "The $",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/05 - The $.mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 163.97061224489795,
        "albumArt": null
    },
    {
        "id": "j-dilla-the-instrumental",
        "title": "The $ (Instrumental)",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/204 - The $ (Instrumental).mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 165.7991836734694,
        "albumArt": null
    },
    {
        "id": "j-dilla-wild",
        "title": "Wild",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/12 - Wild.mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 139.75510204081633,
        "albumArt": null
    },
    {
        "id": "j-dilla-wild-instrumental",
        "title": "Wild (Instrumental)",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/208 - Wild (Instrumental).mp3",
        "genre": "Hip-Hop",
        "album": "Ruff Draft",
        "duration": 141.27020408163264,
        "albumArt": null
    },
    {
        "id": "jadakiss-styles-p-01-time-never-stops-ft-blackhand-product-jimmy-da-gent-prinz-mike-beck-rip-dave-lerrick-prod-by-dave-lerrick",
        "title": "01. Time Never Stops Ft. Blackhand Product (Jimmy Da Gent & Prinz), Mike Beck (Rip) & Dave Lerrick (Prod. By Dave Lerrick)",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/01. Time Never Stops ft. Blackhand Product (Jimmy Da Gent & Prinz), Mike Beck (RIP) & Dave Lerrick (Prod. by Dave Lerrick).mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 174.1061224489796,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-02-grippin-ft-styles-p-jimmy-da-gent-tony-pacasso-dave-lerrick-pusha-t-french-montana",
        "title": "02. Grippin Ft. Styles P, Jimmy Da Gent, Tony Pacasso, Dave Lerrick, Pusha T, French Montana",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/02. Grippin ft. Styles P, Jimmy Da Gent, Tony Pacasso, Dave Lerrick, Pusha T, French Montana.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 276.4277551020408,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-03-order-up-ft-jadakiss-future-chubby-baby",
        "title": "03. Order Up Ft. Jadakiss, Future, Chubby Baby",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/03. Order Up ft. Jadakiss, Future, Chubby Baby.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 177.73714285714286,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-04-boss-dealings-ft-styles-p-n-o-r-e-currensy",
        "title": "04. Boss Dealings Ft. Styles P, N.O.R.E., Currensy",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/04. Boss Dealings ft. Styles P, N.O.R.E., Currensy.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 199.13142857142856,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-05-ain-t-no-turning-around-ft-jadakiss-yo-gotti",
        "title": "05. Ain T No Turning Around Ft. Jadakiss, Yo Gotti",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/05. Ain_t No Turning Around ft. Jadakiss, Yo Gotti.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 236.90448979591838,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-06-aarab-styles-ft-styles-p",
        "title": "06. Aarab Styles Ft. Styles P",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/06. Aarab Styles ft. Styles P.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 153.02530612244897,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-07-killa-confrontations-ft-jadakiss-krook-rock-mall-g",
        "title": "07. Killa Confrontations Ft. Jadakiss, Krook Rock, Mall G",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/07. Killa Confrontations ft. Jadakiss, Krook Rock, Mall G.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 174.7069387755102,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-08-shit-happens-ft-tha-embassy-elite-dave-lerrick-prod-by-dave-lerrick",
        "title": "08. Shit Happens Ft. Tha Embassy Elite, Dave Lerrick (Prod By Dave Lerrick)",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/08. Shit Happens ft. Tha Embassy Elite, Dave Lerrick (Prod by Dave Lerrick).mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 150.85714285714286,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-09-b-n-banger-ft-styles-p-masspike-miles-chubby-jag",
        "title": "09. B N Banger Ft. Styles P, Masspike Miles, Chubby Jag",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/09. B N Banger ft. Styles P, Masspike Miles, Chubby Jag.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 146.2595918367347,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-10-to-the-left-ft-jadakiss-yung-joc-big-a",
        "title": "10. To The Left Ft. Jadakiss, Yung Joc, Big A",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/10. To The Left ft. Jadakiss, Yung Joc, Big A.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 172.72163265306122,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-11-new-jack-city-ft-dj-op-styles-p-cormega-tek-of-smif-n-wessun-tyler-williams",
        "title": "11. New Jack City Ft. Dj Op, Styles P, Cormega, Tek Of Smif N Wessun, Tyler Williams",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/11. New Jack City ft. DJ OP, Styles P, Cormega, Tek of Smif N Wessun, Tyler Williams.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 165.30285714285714,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-12-stick-up-kids-ft-jadakiss-sheek-louch-ghostface-killa",
        "title": "12. Stick Up Kids Ft. Jadakiss, Sheek Louch, Ghostface Killa",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/12. Stick Up Kids ft. Jadakiss, Sheek Louch, Ghostface Killa.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 169.14285714285714,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-13-play-dirty-ft-styles-p-lil-fame-termanology-busta-rhymes",
        "title": "13. Play Dirty Ft. Styles P, Lil Fame, Termanology, Busta Rhymes",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/13. Play Dirty ft. Styles P, Lil Fame, Termanology, Busta Rhymes.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 211.06938775510204,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-14-never-die-ft-jadakiss-cee-lo-nipsey-hussle-young-jeezy",
        "title": "14. Never Die Ft. Jadakiss, Cee-Lo, Nipsey Hussle, Young Jeezy",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/14. Never Die ft. Jadakiss, Cee-Lo, Nipsey Hussle, Young Jeezy.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 251.42857142857142,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-15-product-money-ft-mike-beck-rip-jimmy-da-gent",
        "title": "15. Product Money Ft. Mike Beck (Rip), Jimmy Da Gent",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/15. Product Money ft. Mike Beck (RIP), Jimmy Da Gent.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 143.85632653061225,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-16-i-know-ft-styles-p",
        "title": "16. I Know Ft. Styles P",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/16. I Know ft. Styles P.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 173.19183673469388,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-17-krazy-ft-jadakiss-freddie-gibbs-jay-rock",
        "title": "17. Krazy Ft. Jadakiss, Freddie Gibbs, Jay Rock",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/17. Krazy ft. Jadakiss, Freddie Gibbs, Jay Rock.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 208.82285714285715,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-18-ny-shining-ft-styles-p-talib-kweli-greg-nice",
        "title": "18. Ny Shining Ft. Styles P, Talib Kweli, Greg Nice",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/18. NY Shining ft. Styles P, Talib Kweli, Greg Nice.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 269.4791836734694,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-19-move-it-around-ft-jimmy-da-gent-dave-lerrick-capone-of-cnn-prod-by-kris-fame",
        "title": "19. Move It Around Ft. Jimmy Da Gent, Dave Lerrick, Capone Of Cnn (Prod. By Kris Fame)",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/19. Move It Around ft. Jimmy Da Gent, Dave Lerrick, Capone of CNN (prod. by Kris Fame).mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 245.86448979591836,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-20-holiday-any-emcee-ft-styles-p",
        "title": "20. Holiday Any Emcee Ft. Styles P",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/20. Holiday Any Emcee ft. Styles P.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 121.2865306122449,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-21-chosen-few-ft-jadakiss-lloyd-banks",
        "title": "21. Chosen Few Ft. Jadakiss, Lloyd Banks",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/21. Chosen Few ft. Jadakiss, Lloyd Banks.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 164.75428571428571,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-22-wavy-product-ft-jimmy-da-gent-max-b",
        "title": "22. Wavy Product Ft. Jimmy Da Gent, Max B",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/22. Wavy Product ft. Jimmy Da Gent, Max B.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 117.26367346938775,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-23-8-is-enough-ft-styles-p-dj-op-shoota-papoose-a-mafia-capone-uncle-murda-push-j-r-writer",
        "title": "23. 8 Is Enough Ft. Styles P, Dj Op, Shoota, Papoose, A-Mafia, Capone, Uncle Murda, Push!, J.R. Writer",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/23. 8 Is Enough Ft. Styles P, DJ OP, Shoota, Papoose, A-Mafia, Capone, Uncle Murda, PUSH!, J.R. Writer.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 154.40979591836734,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-24-slum-dog-millionaires-green-lantern-mix-ft-jadakiss-styles-p-2-chainz-lil-wayne",
        "title": "24. Slum Dog Millionaires (Green Lantern Mix) Ft. Jadakiss, Styles P, 2 Chainz, Lil Wayne",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/24. Slum Dog Millionaires (Green Lantern Mix) ft. Jadakiss, Styles P, 2 Chainz, Lil Wayne.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 157.36163265306124,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-25-hop-out-green-lantern-mix-ft-styles-p",
        "title": "25. Hop Out (Green Lantern Mix) Ft. Styles P",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/25. Hop Out (Green lantern Mix) ft. Styles P.mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 115.95755102040816,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "jadakiss-styles-p-26-gangstas-don-t-die-ft-jadakiss-n-o-r-e",
        "title": "26. Gangstas Don T Die Ft. Jadakiss, N.O.R.E.",
        "artist": "Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/26. Gangstas Don_t Die ft. Jadakiss, N.O.R.E..mp3",
        "genre": "Hip-Hop",
        "album": "Brothers",
        "duration": 243.95755102040818,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "kendrick-lamar-a-d-h-d",
        "title": "A.D.H.D",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/03 A.D.H.D.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 215.56244897959184,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "kendrick-lamar-ab-souls-outro",
        "title": "Ab-Souls Outro ",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/15 Ab-Souls Outro.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 350.014693877551,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "kendrick-lamar-backseat-freestyle",
        "title": "Backseat Freestyle",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/03 - Backseat Freestyle.mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 212.68897959183673,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-bitch-don-t-kill-my-vibe",
        "title": "Bitch, Don't Kill My Vibe",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/02 - Bitch, Don't Kill My Vibe.mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 310.75265306122446,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-black-boy-fly",
        "title": "Black Boy Fly",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD2 (2012)/02 - Black Boy Fly.mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 279.22285714285715,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-blow-my-high",
        "title": "Blow My High ",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/14 Blow My High.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 215.84979591836733,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "kendrick-lamar-chapter-six",
        "title": "Chapter Six",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/06 Chapter Six.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 161.14938775510205,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "kendrick-lamar-chapter-ten",
        "title": "Chapter Ten",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/10 Chapter Ten.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 75.59836734693877,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "kendrick-lamar-compton-feat-dr-dre",
        "title": "Compton (Feat. Dr. Dre)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/12 - Compton (Feat. Dr. Dre).mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 248.13714285714286,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-county-building-blues",
        "title": "County Building Blues",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD2 (2012)/04 - County Building Blues.mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 258.2465306122449,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-fuck-your-ethnicity",
        "title": "Fuck Your Ethnicity",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/01 Fuck Your Ethnicity.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 224.6530612244898,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "kendrick-lamar-good-kid",
        "title": "good kid",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/07 - good kid.mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 214.1518367346939,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-hiiipower",
        "title": "HiiiPower",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/16 HiiiPower.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 279.8759183673469,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "kendrick-lamar-hol-up",
        "title": "Hol' Up",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/02 Hold Up.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 173.16571428571427,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "kendrick-lamar-keisha-s-song",
        "title": "Keisha's Song ",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/11 Keisha's Song.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 227.34367346938777,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "kendrick-lamar-kush-corinthians",
        "title": "Kush & Corinthians ",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/13 Kush & Corinthians.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 304.71836734693875,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "kendrick-lamar-m-a-a-d-city-feat-mc-eiht",
        "title": "m.A.A.d city (Feat. MC Eiht)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/08 - m.A.A.d city (Feat. MC Eiht).mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 350.1714285714286,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-money-trees-feat-jay-rock",
        "title": "Money Trees (Feat. Jay Rock)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/05 - Money Trees (Feat. Jay Rock).mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 386.95183673469387,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-no-make-up",
        "title": "No Make-Up ",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/04 No Make-Up.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 235.93795918367346,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "kendrick-lamar-now-or-never-feat-mary-j-blige",
        "title": "Now Or Never (Feat. Mary J. Blige)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD2 (2012)/03 - Now Or Never (Feat. Mary J. Blige).mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 256.36571428571426,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-poe-mans-dreams",
        "title": "Poe Mans Dreams ",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/08 Poe Mans Dreams.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 261.92979591836735,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "kendrick-lamar-poetic-justice-feat-drake",
        "title": "Poetic Justice (Feat. Drake)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/06 - Poetic Justice (Feat. Drake).mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 300.1991836734694,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-real-feat-anna-wise-of-sonnymoon",
        "title": "Real (Feat. Anna Wise Of SonnyMoon)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/11 - Real (Feat. Anna Wise Of SonnyMoon).mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 443.454693877551,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-rigamortus",
        "title": "Rigamortus",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/12 Rigamortus.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 168.59428571428572,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "kendrick-lamar-ronald-reagan-era",
        "title": "Ronald Reagan Era",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/07 Ronald Reagan Era.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 216.9469387755102,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "kendrick-lamar-sherane-a-k-a-master-splinter-s-daughter",
        "title": "Sherane a.k.a Master Splinter's Daughter",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/01 - Sherane a.k.a Master Splinter's Daughter.mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 273.6848979591837,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-sing-about-me-i-m-dying-of-thirst",
        "title": "Sing About Me, I'm Dying Of Thirst",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/10 - Sing About Me, I'm Dying Of Thirst.mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 723.6179591836735,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-swimming-pools-drank-black-hippy-remix",
        "title": "Swimming Pools (Drank) (Black Hippy Remix)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD2 (2012)/05 - Swimming Pools (Drank) (Black Hippy Remix).mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 314.9061224489796,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-swimming-pools-drank-extended-version",
        "title": "Swimming Pools (Drank) (Extended Version)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/09 - Swimming Pools (Drank) (Extended Version).mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 313.8351020408163,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-tammy-s-song",
        "title": "Tammy's Song",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/05 Tammy's Song.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 161.67183673469387,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "kendrick-lamar-the-art-of-peer-pressure",
        "title": "The Art Of Peer Pressure",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/04 - The Art Of Peer Pressure.mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 324.57142857142856,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-the-recipe-feat-dr-dre",
        "title": "The Recipe (Feat. Dr. Dre)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD2 (2012)/01 - The Recipe (Feat. Dr. Dre).mp3",
        "genre": "Hip-Hop",
        "album": "good kid, m.A.A.d city",
        "duration": 353.2277551020408,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-the-spiteful-chant",
        "title": "The Spiteful Chant",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar-Section.80/09 The Spiteful Chant.mp3",
        "genre": "Rap",
        "album": "Section.80",
        "duration": 320.9404081632653,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "j-dilla-01-intro",
        "title": "01 Intro",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/01 - Intro.mp3",
        "genre": "Hip Hop",
        "album": "Ruff Draft",
        "duration": 21.0
    },
    {
        "id": "j-dilla-02-let-s-take-it-back",
        "title": "02 Let's Take It Back",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/02 - Let's Take It Back.mp3",
        "genre": "Hip Hop",
        "album": "Ruff Draft",
        "duration": 133.0
    },
    {
        "id": "j-dilla-03-reckless-driving",
        "title": "03 Reckless Driving",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/03 - Reckless Driving.mp3",
        "genre": "Hip Hop",
        "album": "Ruff Draft",
        "duration": 164.0
    },
    {
        "id": "j-dilla-04-nothing-like-this",
        "title": "04 Nothing Like This",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/04 - Nothing Like This.mp3",
        "genre": "Hip Hop",
        "album": "Ruff Draft",
        "duration": 155.0
    },
    {
        "id": "j-dilla-05-the-sh-t-lately",
        "title": "05 The $",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/05 - The $.mp3",
        "genre": "Hip Hop",
        "album": "Ruff Draft",
        "duration": 212.0
    },
    {
        "id": "j-dilla-06-interlude",
        "title": "06 Interlude",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/06 - Interlude.mp3",
        "genre": "Hip Hop",
        "album": "Ruff Draft",
        "duration": 145.0
    },
    {
        "id": "j-dilla-07-make-em-nv",
        "title": "07 Make'em NV",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/07 - Make’em NV.mp3",
        "genre": "Hip Hop",
        "album": "Ruff Draft",
        "duration": 48.0
    },
    {
        "id": "j-dilla-08-interlude-2",
        "title": "08 Interlude",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/08 - Interlude.mp3",
        "genre": "Hip Hop",
        "album": "Ruff Draft",
        "duration": 210.0
    },
    {
        "id": "j-dilla-09-crushin",
        "title": "09 Crushin’ (Yeeeeaah!)",
        "artist": "J. Dilla",
        "src": "../assets/audio/J. Dilla - Ruff Draft - 2007/09 - Crushin’ (Yeeeeaah!).mp3",
        "genre": "Hip Hop",
        "album": "Ruff Draft",
        "duration": 210.0
    }
];
        this._tracks = null;
    }

    _init() {
        if (this._tracks) return;
        this._tracks = this._rawTracks.map(track => {
            const srcKey = findAssetKey(track.src);
            const srcUrl = srcKey ? audioAssets[srcKey] : null;

            const artKey = findAssetKey(track.albumArt);
            const mappedArt = artKey ? audioAssets[artKey] : null;

            if (!srcUrl) { 
                console.warn('Audio asset not found in build:', track.src);
            }

            if (track.albumArt && !mappedArt) {
                 console.warn('Album art asset not found in build:', track.albumArt);
            }

            return {
                ...track,
                src: srcUrl || track.src,
                albumArt: mappedArt || null
            };
        });
        this._rawTracks = null; // Cleanup
    }

    get tracks() { 
        this._init();
        return this._tracks; 
    }
    getAll() { 
        this._init();
        return this._tracks; 
    }
    getById(id) { 
        this._init();
        return this._tracks.find(track => track.id === id); 
    }
    addTrack(track) { 
        this._init();
        this._tracks.push(track); 
    }
}
export const audioLibrary = new AudioLibrary();
