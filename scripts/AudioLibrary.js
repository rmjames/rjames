
const audioAssets = import.meta.glob('../assets/audio/**/*', { eager: true, query: '?url', import: 'default' });

// Helper to find asset key robustly
function findAssetKey(src) {
    if (!src) return null;
    if (audioAssets[src]) return src;

    // Try verifying path normalization quirks
    // Vite glob keys are exactly as written in the pattern prefix + file path
    // Sometimes spaces or special chars might be issue.
    
    const keys = Object.keys(audioAssets);
    
    // 1. Try URI encoded version (Vite sometimes encodes keys?)
    // 2. Try looking for exact ending match (file name)
    
    const fileName = src.split('/').pop();
    // Find key ending with this filename (preceded by /)
    const match = keys.find(k => k.endsWith('/' + fileName) || k === fileName);
    
    if (match) {
        console.debug('Fuzzy matched asset:', src, '->', match);
        return match;
    }
    
    return null;
}

class AudioLibrary {
    constructor() {
        const rawTracks = [
    {
        "id": "bob-marley-the-wailers-bob-marley-the-wailers-concrete-jungle-live",
        "title": "Bob Marley & The Wailers - Concrete Jungle (Live)",
        "artist": "Bob Marley & The Wailers",
        "src": "../assets/audio/Bob Marley & The Wailers - Live @ Quiet Night Club (Chicago, IL) (6-10-1975)/03 - Bob Marley & The Wailers - Concrete Jungle (Live).m4a",
        "genre": "Hip Hop",
        "album": "Live @ Quiet Night Club (Chicago, IL) (6-10-1975)",
        "duration": 366.71274376417233,
        "albumArt": null
    },
    {
        "id": "bob-marley-the-wailers-bob-marley-the-wailers-i-shot-the-sheriff-live",
        "title": "Bob Marley & The Wailers - I Shot The Sheriff (Live)",
        "artist": "Bob Marley & The Wailers",
        "src": "../assets/audio/Bob Marley & The Wailers - Live @ Quiet Night Club (Chicago, IL) (6-10-1975)/07 - Bob Marley & The Wailers - I Shot The Sheriff (Live).m4a",
        "genre": "Hip Hop",
        "album": "Live @ Quiet Night Club (Chicago, IL) (6-10-1975)",
        "duration": 746.4983219954648,
        "albumArt": null
    },
    {
        "id": "bob-marley-the-wailers-bob-marley-the-wailers-midnight-raver-live",
        "title": "Bob Marley & The Wailers - Midnight Raver (Live)",
        "artist": "Bob Marley & The Wailers",
        "src": "../assets/audio/Bob Marley & The Wailers - Live @ Quiet Night Club (Chicago, IL) (6-10-1975)/04 - Bob Marley & The Wailers - Midnight Raver (Live).m4a",
        "genre": "Hip Hop",
        "album": "Live @ Quiet Night Club (Chicago, IL) (6-10-1975)",
        "duration": 401.26403628117913,
        "albumArt": null
    },
    {
        "id": "bob-marley-the-wailers-bob-marley-the-wailers-natty-dread-live",
        "title": "Bob Marley & The Wailers - Natty Dread (Live)",
        "artist": "Bob Marley & The Wailers",
        "src": "../assets/audio/Bob Marley & The Wailers - Live @ Quiet Night Club (Chicago, IL) (6-10-1975)/08 - Bob Marley & The Wailers - Natty Dread (Live).m4a",
        "genre": "Hip Hop",
        "album": "Live @ Quiet Night Club (Chicago, IL) (6-10-1975)",
        "duration": 495.74603174603175,
        "albumArt": null
    },
    {
        "id": "bob-marley-the-wailers-bob-marley-the-wailers-rebel-music-live",
        "title": "Bob Marley & The Wailers - Rebel Music (Live)",
        "artist": "Bob Marley & The Wailers",
        "src": "../assets/audio/Bob Marley & The Wailers - Live @ Quiet Night Club (Chicago, IL) (6-10-1975)/06 - Bob Marley & The Wailers - Rebel Music (Live).m4a",
        "genre": "Hip Hop",
        "album": "Live @ Quiet Night Club (Chicago, IL) (6-10-1975)",
        "duration": 456.6900680272109,
        "albumArt": null
    },
    {
        "id": "bob-marley-the-wailers-bob-marley-the-wailers-slave-driver-live",
        "title": "Bob Marley & The Wailers - Slave Driver (Live)",
        "artist": "Bob Marley & The Wailers",
        "src": "../assets/audio/Bob Marley & The Wailers - Live @ Quiet Night Club (Chicago, IL) (6-10-1975)/01 - Bob Marley & The Wailers - Slave Driver (Live).m4a",
        "genre": "Hip Hop",
        "album": "Live @ Quiet Night Club (Chicago, IL) (6-10-1975)",
        "duration": 267.00625850340134,
        "albumArt": null
    },
    {
        "id": "bob-marley-the-wailers-bob-marley-the-wailers-talkin-blues-live",
        "title": "Bob Marley & The Wailers - Talkin' Blues (Live)",
        "artist": "Bob Marley & The Wailers",
        "src": "../assets/audio/Bob Marley & The Wailers - Live @ Quiet Night Club (Chicago, IL) (6-10-1975)/05 - Bob Marley & The Wailers - Talkin' Blues (Live).m4a",
        "genre": "Hip Hop",
        "album": "Live @ Quiet Night Club (Chicago, IL) (6-10-1975)",
        "duration": 370.66013605442174,
        "albumArt": null
    },
    {
        "id": "bob-marley-the-wailers-bob-marley-the-wailers-trenchtown-rock-live",
        "title": "Bob Marley & The Wailers - Trenchtown Rock (Live)",
        "artist": "Bob Marley & The Wailers",
        "src": "../assets/audio/Bob Marley & The Wailers - Live @ Quiet Night Club (Chicago, IL) (6-10-1975)/02 - Bob Marley & The Wailers - Trenchtown Rock (Live).m4a",
        "genre": "Hip Hop",
        "album": "Live @ Quiet Night Club (Chicago, IL) (6-10-1975)",
        "duration": 360.23437641723353,
        "albumArt": null
    },
    {
        "id": "fabolous-01-fabolous-transformation",
        "title": "01 Fabolous - Transformation",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/01 Fabolous - Transformation.mp3",
        "genre": "Hip Hop",
        "album": "The Soul Tape 2-2012-MIXFIEND",
        "duration": 238.52408163265306,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-02-fabolous-for-the-love-prod-by-streetrunner",
        "title": "02 Fabolous - For The Love [Prod. By Streetrunner]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/02 Fabolous - For The Love [Prod. By Streetrunner].mp3",
        "genre": "Hip Hop",
        "album": "The Soul Tape 2-2012-MIXFIEND",
        "duration": 177.192,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-03-fabolous-b-i-t-e-prod-by-teddy-da-don",
        "title": "03 Fabolous - B.I.T.E. [Prod. By Teddy Da Don]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/03 Fabolous - B.I.T.E. [Prod. By Teddy Da Don].mp3",
        "genre": "Hip Hop",
        "album": "The Soul Tape 2-2012-MIXFIEND",
        "duration": 237.66204081632654,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-04-fabolous-we-get-high-prod-by-c-sick",
        "title": "04 Fabolous - We Get High [Prod. By C-Sick]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/04 Fabolous - We Get High [Prod. By C-Sick].mp3",
        "genre": "Hip Hop",
        "album": "The Soul Tape 2-2012-MIXFIEND",
        "duration": 256.2873469387755,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-05-fabolous-diamonds-prod-by-mally-the-martian-hype",
        "title": "05 Fabolous - Diamonds [Prod. By Mally The Martian & Hype]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/05 Fabolous - Diamonds [Prod. By Mally The Martian & Hype].mp3",
        "genre": "Hip Hop",
        "album": "The Soul Tape 2-2012-MIXFIEND",
        "duration": 252.504,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-06-fabolous-guess-whos-bizzack-feat-broadway-prod-by-mally-the-martian",
        "title": "06 Fabolous - Guess Whos Bizzack (Feat. Broadway) [Prod. By Mally The Martian]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/06 Fabolous - Guess Whos Bizzack (Feat. Broadway) [Prod. By Mally The Martian].mp3",
        "genre": "Hip Hop",
        "album": "The Soul Tape 2-2012-MIXFIEND",
        "duration": 206.00163265306122,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-07-fabolous-louis-vuitton-feat-j-cole",
        "title": "07 Fabolous - Louis Vuitton (Feat. J.Cole)",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/07 Fabolous - Louis Vuitton (Feat. J.Cole).mp3",
        "genre": "Hip Hop",
        "album": "The Soul Tape 2-2012-MIXFIEND",
        "duration": 296.5942857142857,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-08-fabolous-life-is-so-exciting-feat-pusha-t-prod-by-the-arsenals-sarah-j",
        "title": "08 Fabolous - Life Is So Exciting (Feat. Pusha T) [Prod. By The Arsenals & Sarah J]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/08 Fabolous - Life Is So Exciting (Feat. Pusha T) [Prod. By The Arsenals & Sarah J].mp3",
        "genre": "Hip Hop",
        "album": "The Soul Tape 2-2012-MIXFIEND",
        "duration": 245.02857142857144,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-09-fabolous-only-life-i-know-feat-troy-ave-prod-by-john-scino",
        "title": "09 Fabolous - Only Life I Know (Feat. Troy Ave) [Prod. By John Scino]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/09 Fabolous - Only Life I Know (Feat. Troy Ave) [Prod. By John Scino].mp3",
        "genre": "Hip Hop",
        "album": "The Soul Tape 2-2012-MIXFIEND",
        "duration": 338.1812244897959,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-10-fabolous-diced-pineapples-feat-trey-songz-cassie-prod-by-cardiak",
        "title": "10 Fabolous - Diced Pineapples (Feat. Trey Songz & Cassie) [Prod. By Cardiak]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/10 Fabolous - Diced Pineapples (Feat. Trey Songz & Cassie) [Prod. By Cardiak].mp3",
        "genre": "Hip Hop",
        "album": "The Soul Tape 2-2012-MIXFIEND",
        "duration": 330.2661224489796,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-11-fabolous-beauty-feat-wale-prod-by-araabmuzik",
        "title": "11 Fabolous - Beauty (Feat. Wale) [Prod. By Araabmuzik]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/11 Fabolous - Beauty (Feat. Wale) [Prod. By Araabmuzik].mp3",
        "genre": "Hip Hop",
        "album": "The Soul Tape 2-2012-MIXFIEND",
        "duration": 201.40408163265306,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-12-fabolous-want-you-back-feat-joe-budden-teyana-taylor-prod-by-sonaro",
        "title": "12 Fabolous - Want You Back (Feat. Joe Budden & Teyana Taylor) [Prod. By Sonaro]",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/12 Fabolous - Want You Back (Feat. Joe Budden & Teyana Taylor) [Prod. By Sonaro].mp3",
        "genre": "Hip Hop",
        "album": "The Soul Tape 2-2012-MIXFIEND",
        "duration": 346.09632653061226,
        "albumArt": "../assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "fabolous-bet-ft-jadakiss-styles-p",
        "title": "BET ft Jadakiss & Styles P",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/10 - BET ft Jadakiss & Styles P (DatPiff Exclusive).mp3",
        "genre": "Hip Hop",
        "album": "There Is No Competition Death Comes In",
        "duration": 165.4073469387755,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-black-city",
        "title": "Black City",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/08 - Black City (DatPiff Exclusive).mp3",
        "genre": "Hip Hop",
        "album": "There Is No Competition Death Comes In",
        "duration": 113.13632653061225,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-death-comes-in-3s",
        "title": "Death Comes in 3s",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/02 - Death Comes in 3s (DatPiff Exclusive).mp3",
        "genre": "Hip Hop",
        "album": "There Is No Competition Death Comes In",
        "duration": 163.2130612244898,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-death-in-the-family-ft-paul-cain",
        "title": "Death In The Family Ft Paul Cain",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/13 - Death In The Family Ft Paul Cain (DatPiff Exclusive).mp3",
        "genre": "Hip Hop",
        "album": "There Is No Competition Death Comes In",
        "duration": 241.2930612244898,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-drams-on-time",
        "title": "Drams On Time",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/14 - Drams On Time (DatPiff Exclusive).mp3",
        "genre": "Hip Hop",
        "album": "There Is No Competition Death Comes In",
        "duration": 46.027755102040814,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-get-down-or-lay-down-ft-lloyd-banks",
        "title": "Get Down or Lay Down Ft Lloyd Banks",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/11 - Get Down or Lay Down Ft Lloyd Banks (DatPiff Exclusive).mp3",
        "genre": "Hip Hop",
        "album": "There Is No Competition Death Comes In",
        "duration": 194.56,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-got-that-work",
        "title": "Got That Work",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/09 - Got That Work (DatPiff Exclusive).mp3",
        "genre": "Hip Hop",
        "album": "There Is No Competition Death Comes In",
        "duration": 176.3526530612245,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-intro",
        "title": "Intro",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/01 - Intro (DatPiff Exclusive).mp3",
        "genre": "Hip Hop",
        "album": "There Is No Competition Death Comes In",
        "duration": 82.10285714285715,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-lord-knows",
        "title": "Lord Knows",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/15 - Lord Knows (DatPiff Exclusive).mp3",
        "genre": "Hip Hop",
        "album": "There Is No Competition Death Comes In",
        "duration": 549.7208163265307,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-she-did-it",
        "title": "She Did It",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/06 - She Did It (DatPiff Exclusive).mp3",
        "genre": "Hip Hop",
        "album": "There Is No Competition Death Comes In",
        "duration": 178.99102040816325,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-spend-it-ft-trey-songz",
        "title": "Spend It ft Trey Songz",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/07 - Spend It ft Trey Songz (DatPiff Exclusive).mp3",
        "genre": "Hip Hop",
        "album": "There Is No Competition Death Comes In",
        "duration": 223.3991836734694,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-swag-champ",
        "title": "Swag Champ",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/04 - Swag Champ (DatPiff Exclusive).mp3",
        "genre": "Hip Hop",
        "album": "There Is No Competition Death Comes In",
        "duration": 208.3787755102041,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-the-widows",
        "title": "The Widows",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/05 - The Widows (DatPiff Exclusive).mp3",
        "genre": "Hip Hop",
        "album": "There Is No Competition Death Comes In",
        "duration": 24.58122448979592,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-unfuckwitable",
        "title": "Unfuckwitable",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/12 - Unfuckwitable (DatPiff Exclusive).mp3",
        "genre": "Hip Hop",
        "album": "There Is No Competition Death Comes In",
        "duration": 232.15020408163267,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "fabolous-you-dont-know-bout-it-ft-meek-mill",
        "title": "You Dont Know Bout It ft Meek Mill",
        "artist": "Fabolous",
        "src": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/03 - You Dont Know Bout It ft Meek Mill (DatPiff Exclusive).mp3",
        "genre": "Hip Hop",
        "album": "There Is No Competition Death Comes In",
        "duration": 219.32408163265305,
        "albumArt": "../assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg"
    },
    {
        "id": "ghostface-killah-260-feat-raekwon",
        "title": "260 feat Raekwon",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/04. 260 feat Raekwon.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 166.92244897959185,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-after-the-smoke-is-clear-fea-the-delphonics",
        "title": "After The Smoke Is Clear fea The Delphonics",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/14. After The Smoke Is Clear fea The Delphonics.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 197.4334693877551,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-all-that-i-got-is-you-feat-mary-j-blige",
        "title": "All That I Got Is You feat Mary J Blige",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/15. All That I Got Is You feat Mary J Blige.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 321.2277551020408,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-apollo-kids-featuring-raekwon",
        "title": "APOLLO KIDS (FEATURING RAEKWON)",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/06 - APOLLO KIDS (FEATURING RAEKWON).mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 234.2138775510204,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-assassination-day-feat-raekwon-the-rza-inspectah-deck",
        "title": "Assassination Day feat Raekwon, The RZA & Inspectah Deck",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/05. Assassination Day feat Raekwon, The RZA & Inspectah Deck.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 258.35102040816327,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-black-jesus-feat-raekwon-u-god",
        "title": "Black Jesus feat Raekwon & U-God",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/13. Black Jesus feat Raekwon & U-God.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 277.23755102040815,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-box-in-hand-feat-method-man-street",
        "title": "Box In Hand feat Method Man & Street",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/08. Box In Hand feat Method Man & Street.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 194.79510204081632,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-buck-50-featuring-cappadonna-method-man-masta-killah-redman",
        "title": "BUCK 50 (FEATURING CAPPADONNA, METHOD MAN, MASTA KILLAH & REDMAN)",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/08 - BUCK 50 (FEATURING CAPPADONNA, METHOD MAN, MASTA KILLAH & REDMAN).mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 242.2595918367347,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-camay-feat-raekwon-cappadonna",
        "title": "Camay feat Raekwon & Cappadonna",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/10. Camay feat Raekwon & Cappadonna.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 274.1812244897959,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-cherchez-laghost",
        "title": "CHERCHEZ LAGHOST",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/18 - CHERCHEZ LAGHOST.mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 191.3991836734694,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-child-s-play",
        "title": "CHILD'S PLAY",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/17 - CHILD'S PLAY.mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 213.15918367346939,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-clyde-smith",
        "title": "CLYDE SMITH",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/20 - CLYDE SMITH.mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 160.10448979591837,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-daytona-500-feat-raekwon-cappadonna",
        "title": "Daytona 500 feat Raekwon & Cappadonna",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/11. Daytona 500 feat Raekwon & Cappadonna.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 280.55510204081634,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-fish-feat-raekwon-cappadonna",
        "title": "Fish feat Raekwon & Cappadonna",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/09. Fish feat Raekwon & Cappadonna.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 230.55673469387756,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-ghost-deini-featuring-superb",
        "title": "GHOST DEINI (FEATURING SUPERB)",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/05 - GHOST DEINI (FEATURING SUPERB).mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 245.68163265306123,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-intro",
        "title": "INTRO",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/01 - INTRO.mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 46.65469387755102,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-iron-maiden-feat-raekwon-cappadonna",
        "title": "Iron Maiden feat Raekwon & Cappadonna",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/01. Iron Maiden feat Raekwon & Cappadonna.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 286.7722448979592,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-iron-s-theme-conclusion",
        "title": "IRON'S THEME - CONCLUSION",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/21 - IRON'S THEME - CONCLUSION.mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 118.75265306122449,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-iron-s-theme-intermission",
        "title": "IRON'S THEME - INTERMISSION",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/14 - IRON'S THEME - INTERMISSION.mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 90.48816326530613,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-malcolm",
        "title": "MALCOLM",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/15 - MALCOLM.mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 255.3208163265306,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-marvel",
        "title": "Marvel",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/17. Marvel.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 310.3608163265306,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-mighty-healthy",
        "title": "MIGHTY HEALTHY",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/09 - MIGHTY HEALTHY.mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 201.74367346938774,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-motherless-child-feat-raekwo",
        "title": "Motherless Child feat Raekwo",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/12. Motherless Child feat Raekwo.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 225.33224489795919,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-nutmeg-featuring-the-rza",
        "title": "NUTMEG (FEATURING THE RZA)",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/02 - NUTMEG (FEATURING THE RZA).mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 265.09061224489795,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-one",
        "title": "ONE",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/03 - ONE.mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 226.37714285714284,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-poisonous-darts",
        "title": "Poisonous Darts",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/06. Poisonous Darts.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 135.52326530612245,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-saturday-nite",
        "title": "SATURDAY NITE",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/04 - SATURDAY NITE.mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 99.42204081632653,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-stay-true-featuring-60-second-assassin",
        "title": "STAY TRUE (FEATURING 60 SECOND ASSASSIN)",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/11 - STAY TRUE (FEATURING 60 SECOND ASSASSIN).mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 99.44816326530612,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-stroke-of-death",
        "title": "STROKE OF DEATH",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/13 - STROKE OF DEATH.mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 116.48,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-the-faster-blade-feat-raekwon",
        "title": "The Faster Blade feat Raekwon",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/03. The Faster Blade feat Raekwon.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 147.95755102040818,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-the-grain-featuring-the-rza",
        "title": "THE GRAIN (FEATURING THE RZA)",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/07 - THE GRAIN (FEATURING THE RZA).mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 154.72326530612244,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-the-soul-controller-feat-the-force-md-s",
        "title": "The Soul Controller feat The Force MD's",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/16. The Soul Controller feat The Force MD's.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 410.5404081632653,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-we-made-it-featuring-superb",
        "title": "WE MADE IT (FEATURING SUPERB)",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/12 - WE MADE IT (FEATURING SUPERB).mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 277.99510204081633,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-who-would-you-fuck",
        "title": "WHO WOULD YOU FUCK",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/16 - WHO WOULD YOU FUCK.mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 164.46693877551022,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-wildflower",
        "title": "Wildflower",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/02. Wildflower.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 206.88979591836735,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-winter-warz-feat-cappadonna-u-god-masta-killa",
        "title": "Winter Warz feat Cappadonna, U-God & Masta Killa",
        "artist": "Ghostface Killah",
        "src": "../assets/audio/Ghostface Killah - Ironman/07. Winter Warz feat Cappadonna, U-God & Masta Killa.mp3",
        "genre": "Hip Hop",
        "album": "Ironman",
        "duration": 280.71183673469386,
        "albumArt": "../assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    },
    {
        "id": "ghostface-killah-woodrow-the-base-head",
        "title": "WOODROW THE BASE HEAD",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/10 - WOODROW THE BASE HEAD.mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 184.29387755102042,
        "albumArt": null
    },
    {
        "id": "ghostface-killah-wu-banga-101-featuring-gza-cappadonna-masta-killah-raekwon",
        "title": "WU BANGA 101 (FEATURING GZA, CAPPADONNA, MASTA KILLAH & RAEKWON)",
        "artist": "GHOSTFACE KILLAH",
        "src": "../assets/audio/GHOSTFACE KILLAH - SUPREME CLIENTELE/19 - WU BANGA 101 (FEATURING GZA, CAPPADONNA, MASTA KILLAH & RAEKWON).mp3",
        "genre": "Hip Hop",
        "album": "SUPREME CLIENTELE",
        "duration": 263.26204081632653,
        "albumArt": null
    },
    {
        "id": "kendrick-lamar-backseat-freestyle",
        "title": "Backseat Freestyle",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/03 - Backseat Freestyle.mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD1 (2012)",
        "duration": 212.68897959183673,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-bitch-don-t-kill-my-vibe",
        "title": "Bitch, Don't Kill My Vibe",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/02 - Bitch, Don't Kill My Vibe.mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD1 (2012)",
        "duration": 310.75265306122446,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-black-boy-fly",
        "title": "Black Boy Fly",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD2 (2012)/02 - Black Boy Fly.mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD2 (2012)",
        "duration": 279.22285714285715,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-compton-feat-dr-dre",
        "title": "Compton (Feat. Dr. Dre)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/12 - Compton (Feat. Dr. Dre).mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD1 (2012)",
        "duration": 248.13714285714286,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-county-building-blues",
        "title": "County Building Blues",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD2 (2012)/04 - County Building Blues.mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD2 (2012)",
        "duration": 258.2465306122449,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-good-kid",
        "title": "good kid",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/07 - good kid.mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD1 (2012)",
        "duration": 214.1518367346939,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-m-a-a-d-city-feat-mc-eiht",
        "title": "m.A.A.d city (Feat. MC Eiht)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/08 - m.A.A.d city (Feat. MC Eiht).mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD1 (2012)",
        "duration": 350.1714285714286,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-money-trees-feat-jay-rock",
        "title": "Money Trees (Feat. Jay Rock)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/05 - Money Trees (Feat. Jay Rock).mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD1 (2012)",
        "duration": 386.95183673469387,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-now-or-never-feat-mary-j-blige",
        "title": "Now Or Never (Feat. Mary J. Blige)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD2 (2012)/03 - Now Or Never (Feat. Mary J. Blige).mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD2 (2012)",
        "duration": 256.36571428571426,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-poetic-justice-feat-drake",
        "title": "Poetic Justice (Feat. Drake)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/06 - Poetic Justice (Feat. Drake).mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD1 (2012)",
        "duration": 300.1991836734694,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-real-feat-anna-wise-of-sonnymoon",
        "title": "Real (Feat. Anna Wise Of SonnyMoon)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/11 - Real (Feat. Anna Wise Of SonnyMoon).mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD1 (2012)",
        "duration": 443.454693877551,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-sherane-a-k-a-master-splinter-s-daughter",
        "title": "Sherane a.k.a Master Splinter's Daughter",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/01 - Sherane a.k.a Master Splinter's Daughter.mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD1 (2012)",
        "duration": 273.6848979591837,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-sing-about-me-i-m-dying-of-thirst",
        "title": "Sing About Me, I'm Dying Of Thirst",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/10 - Sing About Me, I'm Dying Of Thirst.mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD1 (2012)",
        "duration": 723.6179591836735,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-swimming-pools-drank-black-hippy-remix",
        "title": "Swimming Pools (Drank) (Black Hippy Remix)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD2 (2012)/05 - Swimming Pools (Drank) (Black Hippy Remix).mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD2 (2012)",
        "duration": 314.9061224489796,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-swimming-pools-drank-extended-version",
        "title": "Swimming Pools (Drank) (Extended Version)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/09 - Swimming Pools (Drank) (Extended Version).mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD1 (2012)",
        "duration": 313.8351020408163,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-the-art-of-peer-pressure",
        "title": "The Art Of Peer Pressure",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD1 (2012)/04 - The Art Of Peer Pressure.mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD1 (2012)",
        "duration": 324.57142857142856,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "kendrick-lamar-the-recipe-feat-dr-dre",
        "title": "The Recipe (Feat. Dr. Dre)",
        "artist": "Kendrick Lamar",
        "src": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar - good kid, m.A.A.d city CD2 (2012)/01 - The Recipe (Feat. Dr. Dre).mp3",
        "genre": "Hip Hop",
        "album": "good kid, m.A.A.d city CD2 (2012)",
        "duration": 353.2277551020408,
        "albumArt": "../assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-8-is-enough-ft-styles-p-dj-op-shoota-papoose-a-mafia-capone-uncle-murda-push-j-r-writer",
        "title": "8 Is Enough Ft. Styles P, DJ OP, Shoota, Papoose, A-Mafia, Capone, Uncle Murda, PUSH!, J.R. Writer",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/23. 8 Is Enough Ft. Styles P, DJ OP, Shoota, Papoose, A-Mafia, Capone, Uncle Murda, PUSH!, J.R. Writer.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 154.40979591836734,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-aarab-styles-ft-styles-p",
        "title": "Aarab Styles ft. Styles P",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/06. Aarab Styles ft. Styles P.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 153.02530612244897,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-ain-t-no-turning-around-ft-jadakiss-yo-gotti",
        "title": "Ain_t No Turning Around ft. Jadakiss, Yo Gotti",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/05. Ain_t No Turning Around ft. Jadakiss, Yo Gotti.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 236.90448979591838,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-b-n-banger-ft-styles-p-masspike-miles-chubby-jag",
        "title": "B N Banger ft. Styles P, Masspike Miles, Chubby Jag",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/09. B N Banger ft. Styles P, Masspike Miles, Chubby Jag.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 146.2595918367347,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-boss-dealings-ft-styles-p-n-o-r-e-currensy",
        "title": "Boss Dealings ft. Styles P, N.O.R.E., Currensy",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/04. Boss Dealings ft. Styles P, N.O.R.E., Currensy.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 199.13142857142856,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-chosen-few-ft-jadakiss-lloyd-banks",
        "title": "Chosen Few ft. Jadakiss, Lloyd Banks",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/21. Chosen Few ft. Jadakiss, Lloyd Banks.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 164.75428571428571,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-gangstas-don-t-die-ft-jadakiss-n-o-r-e",
        "title": "Gangstas Don_t Die ft. Jadakiss, N.O.R.E.",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/26. Gangstas Don_t Die ft. Jadakiss, N.O.R.E..mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 243.95755102040818,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-grippin-ft-styles-p-jimmy-da-gent-tony-pacasso-dave-lerrick-pusha-t-french-montana",
        "title": "Grippin ft. Styles P, Jimmy Da Gent, Tony Pacasso, Dave Lerrick, Pusha T, French Montana",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/02. Grippin ft. Styles P, Jimmy Da Gent, Tony Pacasso, Dave Lerrick, Pusha T, French Montana.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 276.4277551020408,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-holiday-any-emcee-ft-styles-p",
        "title": "Holiday Any Emcee ft. Styles P",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/20. Holiday Any Emcee ft. Styles P.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 121.2865306122449,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-hop-out-green-lantern-mix-ft-styles-p",
        "title": "Hop Out (Green lantern Mix) ft. Styles P",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/25. Hop Out (Green lantern Mix) ft. Styles P.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 115.95755102040816,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-i-know-ft-styles-p",
        "title": "I Know ft. Styles P",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/16. I Know ft. Styles P.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 173.19183673469388,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-killa-confrontations-ft-jadakiss-krook-rock-mall-g",
        "title": "Killa Confrontations ft. Jadakiss, Krook Rock, Mall G",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/07. Killa Confrontations ft. Jadakiss, Krook Rock, Mall G.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 174.7069387755102,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-krazy-ft-jadakiss-freddie-gibbs-jay-rock",
        "title": "Krazy ft. Jadakiss, Freddie Gibbs, Jay Rock",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/17. Krazy ft. Jadakiss, Freddie Gibbs, Jay Rock.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 208.82285714285715,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-move-it-around-ft-jimmy-da-gent-dave-lerrick-capone-of-cnn-prod-by-kris-fame",
        "title": "Move It Around ft. Jimmy Da Gent, Dave Lerrick, Capone of CNN (prod. by Kris Fame)",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/19. Move It Around ft. Jimmy Da Gent, Dave Lerrick, Capone of CNN (prod. by Kris Fame).mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 245.86448979591836,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-never-die-ft-jadakiss-cee-lo-nipsey-hussle-young-jeezy",
        "title": "Never Die ft. Jadakiss, Cee-Lo, Nipsey Hussle, Young Jeezy",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/14. Never Die ft. Jadakiss, Cee-Lo, Nipsey Hussle, Young Jeezy.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 251.42857142857142,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-new-jack-city-ft-dj-op-styles-p-cormega-tek-of-smif-n-wessun-tyler-williams",
        "title": "New Jack City ft. DJ OP, Styles P, Cormega, Tek of Smif N Wessun, Tyler Williams",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/11. New Jack City ft. DJ OP, Styles P, Cormega, Tek of Smif N Wessun, Tyler Williams.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 165.30285714285714,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-ny-shining-ft-styles-p-talib-kweli-greg-nice",
        "title": "NY Shining ft. Styles P, Talib Kweli, Greg Nice",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/18. NY Shining ft. Styles P, Talib Kweli, Greg Nice.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 269.4791836734694,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-order-up-ft-jadakiss-future-chubby-baby",
        "title": "Order Up ft. Jadakiss, Future, Chubby Baby",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/03. Order Up ft. Jadakiss, Future, Chubby Baby.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 177.73714285714286,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-play-dirty-ft-styles-p-lil-fame-termanology-busta-rhymes",
        "title": "Play Dirty ft. Styles P, Lil Fame, Termanology, Busta Rhymes",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/13. Play Dirty ft. Styles P, Lil Fame, Termanology, Busta Rhymes.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 211.06938775510204,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-product-money-ft-mike-beck-rip-jimmy-da-gent",
        "title": "Product Money ft. Mike Beck (RIP), Jimmy Da Gent",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/15. Product Money ft. Mike Beck (RIP), Jimmy Da Gent.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 143.85632653061225,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-shit-happens-ft-tha-embassy-elite-dave-lerrick-prod-by-dave-lerrick",
        "title": "Shit Happens ft. Tha Embassy Elite, Dave Lerrick (Prod by Dave Lerrick)",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/08. Shit Happens ft. Tha Embassy Elite, Dave Lerrick (Prod by Dave Lerrick).mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 150.85714285714286,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-slum-dog-millionaires-green-lantern-mix-ft-jadakiss-styles-p-2-chainz-lil-wayne",
        "title": "Slum Dog Millionaires (Green Lantern Mix) ft. Jadakiss, Styles P, 2 Chainz, Lil Wayne",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/24. Slum Dog Millionaires (Green Lantern Mix) ft. Jadakiss, Styles P, 2 Chainz, Lil Wayne.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 157.36163265306124,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-stick-up-kids-ft-jadakiss-sheek-louch-ghostface-killa",
        "title": "Stick Up Kids ft. Jadakiss, Sheek Louch, Ghostface Killa",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/12. Stick Up Kids ft. Jadakiss, Sheek Louch, Ghostface Killa.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 169.14285714285714,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-time-never-stops-ft-blackhand-product-jimmy-da-gent-prinz-mike-beck-rip-dave-lerrick-prod-by-dave-lerrick",
        "title": "Time Never Stops ft. Blackhand Product (Jimmy Da Gent & Prinz), Mike Beck (RIP) & Dave Lerrick (Prod. by Dave Lerrick)",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/01. Time Never Stops ft. Blackhand Product (Jimmy Da Gent & Prinz), Mike Beck (RIP) & Dave Lerrick (Prod. by Dave Lerrick).mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 174.1061224489796,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-to-the-left-ft-jadakiss-yung-joc-big-a",
        "title": "To The Left ft. Jadakiss, Yung Joc, Big A",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/10. To The Left ft. Jadakiss, Yung Joc, Big A.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 172.72163265306122,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "suge-white-presents-jadakiss-styles-p-wavy-product-ft-jimmy-da-gent-max-b",
        "title": "Wavy Product ft. Jimmy Da Gent, Max B",
        "artist": "Suge White Presents Jadakiss & Styles P",
        "src": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/22. Wavy Product ft. Jimmy Da Gent, Max B.mp3",
        "genre": "Hip Hop",
        "album": "Brothers-2012-MIXFIEND",
        "duration": 117.26367346938775,
        "albumArt": "../assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg"
    },
    {
        "id": "unknown-artist-01-fuck-your-ethnicity",
        "title": "01 Fuck Your Ethnicity",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/01 Fuck Your Ethnicity.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 224.6530612244898,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "unknown-artist-02-hold-up",
        "title": "02 Hold Up",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/02 Hold Up.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 173.16571428571427,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "unknown-artist-03-a-d-h-d",
        "title": "03 A.D.H.D",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/03 A.D.H.D.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 215.56244897959184,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "unknown-artist-04-no-make-up",
        "title": "04 No Make-Up",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/04 No Make-Up.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 235.93795918367346,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "unknown-artist-05-tammy-s-song",
        "title": "05 Tammy's Song",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/05 Tammy's Song.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 161.67183673469387,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "unknown-artist-06-chapter-six",
        "title": "06 Chapter Six",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/06 Chapter Six.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 161.14938775510205,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "unknown-artist-07-ronald-reagan-era",
        "title": "07 Ronald Reagan Era",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/07 Ronald Reagan Era.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 216.9469387755102,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "unknown-artist-08-poe-mans-dreams",
        "title": "08 Poe Mans Dreams",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/08 Poe Mans Dreams.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 261.92979591836735,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "unknown-artist-09-the-spiteful-chant",
        "title": "09 The Spiteful Chant",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/09 The Spiteful Chant.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 320.9404081632653,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "unknown-artist-10-chapter-ten",
        "title": "10 Chapter Ten",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/10 Chapter Ten.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 75.59836734693877,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "unknown-artist-11-keisha-s-song",
        "title": "11 Keisha's Song",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/11 Keisha's Song.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 227.34367346938777,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "unknown-artist-12-rigamortus",
        "title": "12 Rigamortus",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/12 Rigamortus.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 168.59428571428572,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "unknown-artist-13-kush-corinthians",
        "title": "13 Kush & Corinthians",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/13 Kush & Corinthians.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 304.71836734693875,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "unknown-artist-14-blow-my-high",
        "title": "14 Blow My High",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/14 Blow My High.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 215.84979591836733,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "unknown-artist-15-ab-souls-outro",
        "title": "15 Ab-Souls Outro",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/15 Ab-Souls Outro.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 350.014693877551,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    },
    {
        "id": "unknown-artist-16-hiiipower",
        "title": "16 HiiiPower",
        "artist": "Unknown Artist",
        "src": "../assets/audio/Kendrick Lamar-Section.80/16 HiiiPower.mp3",
        "genre": "Hip Hop",
        "album": "Kendrick Lamar-Section.80",
        "duration": 279.8759183673469,
        "albumArt": "../assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg"
    }
];
        this._tracks = rawTracks.map(track => {
            const srcKey = findAssetKey(track.src);
            const srcUrl = srcKey ? audioAssets[srcKey] : null;

            const artKey = findAssetKey(track.albumArt);
            const mappedArt = artKey ? audioAssets[artKey] : null;

            if (!srcUrl) { 
                console.warn('Audio asset not found in build:', track.src);
            }

            return {
                ...track,
                src: srcUrl || track.src,
                albumArt: mappedArt || null
            };
        });
    }
    get tracks() { return this._tracks; }
    getAll() { return this._tracks; }
    getById(id) { return this._tracks.find(track => track.id === id); }
    addTrack(track) { this._tracks.push(track); }
}
export const audioLibrary = new AudioLibrary();
