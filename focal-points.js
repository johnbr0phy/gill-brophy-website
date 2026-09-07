// Hand-selected subject centres in the original paintings (x, y).
// Keep these independent of screen size; coverPlacement clamps crops to the image.
const focalPoints={
 "c00c91feafa8c9a81484d4f9":[0.48, 0.38], // Artwork 01
 "79167d1dfe8f03d3b8d95763":[0.5, 0.3], // A Small Crowd Had Gathered (Detail)
 "52c5267ede983b8422009d6c":[0.53, 0.48], // Artwork 03
 "eae70281444a71af01b1fccc":[0.5, 0.45], // Artwork 04
 "86b56a8760a685ddb9c5b33e":[0.52, 0.4], // Artwork 06
 "4d8a54d383220e99035e8ea0":[0.52, 0.38], // Artwork 07
 "12ebd0533a0a7dc2b823b56b":[0.5, 0.5], // Artwork 08
 "6e16a0ef7fd247d41f4cb83e":[0.5, 0.46], // Artwork 09
 "211d313f5ab6c86453e1aed2":[0.5, 0.33], // Artwork 10
 "bfb991e775687829efd29dbc":[0.48, 0.4], // Artwork 11
 "e38ad44b1a0891f456e73065":[0.5, 0.42], // Artwork 12
 "05b0e25f6e90f81ad2d1e76d":[0.52, 0.43], // Artwork 13
 "444c3c4e0bc1e93c0652244a":[0.5, 0.38], // Flora —  Transparencies
 "fff29ea1da708df4bc70ac54":[0.5, 0.38], // Artwork 15
 "104a84fb859e21762fdbb2b8":[0.5, 0.46], // Flora —  In the Pink
 "272a8cf9b38dfce6044749ad":[0.5, 0.45], // Artwork 17
 "22754c6879dca5e5c1f47678":[0.5, 0.45], // Artwork 18
 "8f1ddca72ee99534314bc2a7":[0.5, 0.45], // Artwork 19
 "9bbad714aa66fd317c870e5a":[0.5, 0.45], // Artwork 20
 "fab08e1fe5649d4c63d4b9dd":[0.5, 0.45], // Artwork 21
 "bfb5d79db71489055c479ca9":[0.5, 0.45], // Artwork 22
 "b3f13bdff8a0278f90730b01":[0.5, 0.45], // Artwork 23
 "1db8b6a08ec02ebaf384b419":[0.5, 0.45], // Artwork 24
 "7266e7aa8d4b684272306d43":[0.5, 0.32], // Artwork 25
 "18c88a4aa57701418adcea04":[0.5, 0.4], // Me & My Bruvers
 "c7f3868e587e454437958242":[0.5, 0.43], // Talking Heads - Talking to Myself
 "171b076d37b366c014307c63":[0.5, 0.48], // Pomodoro
 "29ea0ead7fddaa3311ab0520":[0.5, 0.48], // Aglio
 "bf2537e111f89ccfb30579e0":[0.5, 0.33], // Flora —  The Ribbon
 "154acf78557fc6d600541702":[0.45, 0.46], // Path to the River
 "a63d4faa25dbbde6cbaf32c1":[0.5, 0.45], // Mirror, Mirror
 "03f01827981a06216085ce1f":[0.48, 0.37], // Walkies Anyone
 "e25eaf24e252b5d8a863d387":[0.5, 0.43], // Flora —  Pink with a Wink
 "300346a739d50ade8de97bc4":[0.5, 0.48], // Winchester Hill Track II
 "555d4e058c7044d9cd0887ea":[0.5, 0.37], // Flora —  The Orange Tulips
 "a02445212b0b9d003b3c3e41":[0.5, 0.34], // Flora —  The Orange Tulips
 "a8e1b42957632f22976bd7f7":[0.48, 0.3], // Fields of Gold
 "6748a477de51a7fb8ebb27a7":[0.5, 0.34], // The Black Cat
 "372f41c529d886c971fdd298":[0.56, 0.43], // Moonset
 "4d6621e637be933f62afd4ff":[0.5, 0.4], // Growth
 "6284b28be3b1ce0290b499fa":[0.48, 0.39], // Contemplation
 "f4c6265d19bb9286d18b5140":[0.5, 0.43], // Low Tide
 "3425659e0a62bb5e5d43efcc":[0.5, 0.44], // With floral undertones
 "fe504f66aa69cfd520130fbf":[0.5, 0.38], // Flora —  Two Vases
 "6ed9267d0a10f9a75dabfcd5":[0.6, 0.5], // The Allotment - I
 "0812a5ef065f09851da311a0":[0.5, 0.45], // The Allotment - II
 "fa14d50c6c43f8cd9681e482":[0.5, 0.42], // The Allotment - II
 "7a8e026bd363b8c6cce10c92":[0.5, 0.39], // Flora —  Neon Bouquet
 "985374864b32aaf1fdfd2a2d":[0.54, 0.68], // Willum
 "07920ab84e6915a83134d878":[0.56, 0.34], // Willum in the Wild Flowers — keep both ears above the desktop crop
 "75468b16b2766554f4ae0637":[0.5, 0.44], // Rudbekia Dancers
 "de1a45ae578cfc58f007df0e":[0.5, 0.45], // Views Through I
 "9c26bee26cfeb0c3fd28fbb1":[0.5, 0.44], // Views Through II
 "7db5017581c48ed8a698641f":[0.5, 0.43], // Views Through III
 "a315d7b2fb2c2028086c2af5":[0.52, 0.37], // Flora —  Bouquet in Blue & Gold
 "b93fbcb174fe244163e49db2":[0.49, 0.53], // I will always love you
 "65e2e69cb59cfedcf5728685":[0.5, 0.39], // Jacob's Pots
 "d5adb17e31e00fe59769304e":[0.5, 0.37], // Jacob's Pots
 "00d35d83d110ff6776af569f":[0.5, 0.38], // Loop the Loop
 "c2339f92f23dfa148646ad0e":[0.5, 0.41], // Cote Fleurie
 "f563abc5b549c8db9c8599fe":[0.5, 0.42], // Profusion - Square
 "964ff9c9074cc3e7706f1147":[0.5, 0.43], // Summer
 "7c8b53089758cb8758e58a29":[0.5, 0.48], // The Bud
 "eafc613e5860c5b0cba21eca":[0.5, 0.43], // Bottles
 "f3a94cc1a16d144b9a094d64":[0.52, 0.57], // The Honeymoon
 "18509801d619f7442e5a7133":[0.5, 0.43], // Hellebores
 "5532c945ce0769216025e2ba":[0.5, 0.48], // Not from Concentrate
 "143358be9397521d00aa3832":[0.5, 0.45], // White Label
 "adf5ed552ab010a954a131e4":[0.5, 0.48], // Segments
 "3167534e68628d2d465d4084":[0.5, 0.35], // Majesty
 "017cd666fe765c3bb8f3c94f":[0.5, 0.46], // High Tide
 "bf1ed0775b897862b99200b3":[0.5, 0.39], // Lello
 "4793d1af02c3b0e14bb352aa":[0.5, 0.48], // Cat and Mouse
 "99c79a9ddb85aa00bc7e6cd4":[0.5, 0.45], // Reflections Square
 "aa0c7692f7075132f3115753":[0.46, 0.35], // Artwork 82
 "ec3b627c2860f84f885b5cbb":[0.5, 0.5], // Artwork 83
 "c9d00f8b595adc0353c3503e":[0.5, 0.48], // Test Valley Treasure
 "a5a933c358d2fbce9f5a9a02":[0.5, 0.6], // Artwork 86
 "0e0795bd04c7aefec6c36ab3":[0.5, 0.6], // Artwork 87
 "5170b6e9a1acce07fd8e2640":[0.5, 0.4], // Artwork 89
 "2a180e8c26a3abf39e469634":[0.5, 0.25], // Artwork 90
 "e622be81fa7df7eed3308964":[0.44, 0.35], // Artwork 91
 "9a1228f7ba1b11e431b26a4d":[0.5, 0.38], // Artwork 92
 "cc3e1da2b497af5ad9cb4b1d":[0.54, 0.46], // Artwork 93
 "4574e75a4b9d11c02f8664d5":[0.5, 0.43], // Artwork 94
 "65bd994b63e364d222a6dc63":[0.5, 0.36], // Artwork 96
 "6f811bfba0fc2c4c078c2301":[0.5, 0.34], // Artwork 97
 "9d550b06d8ffeaf1cf64b2e7":[0.5, 0.45], // Family Tree
 "546d676d76a497874d851166":[0.5, 0.46], // The Net
 "6bd114d12247ddf3af1331df":[0.5, 0.42], // Pocket full of Posies
 "139caf9a521069620d59fc32":[0.5, 0.46], // Blueberry Trees
 "273002e6c9e33a416b76f27e":[0.5, 0.43], // The Denim Mug
 "46d5f7554225f7660e8f507b":[0.5, 0.41], // The Squiggly Vase
 "fdd2cf101e2890ed008bf724":[0.5, 0.37], // Ten Red Buds
 "7d3b96c372579459bae961d4":[0.5, 0.43], // Snapshots
 "449a82c5d3fa0e037fd1ddd7":[0.5, 0.43], // Turn Around when Possible
 "a4dbf752817ba03498f8bcf1":[0.5, 0.32], // Left at Next Junction
 "88b04dc65e1a7039f67c9713":[0.54, 0.37], // Flora — The Striped Pot
 "871462d622f0bfec68aaa90c":[0.5, 0.42], // Denim Daisies
 "85938d764fa359cac7629535":[0.48, 0.28], // Fields of Gold (full view)
 "6af17d6760b477664e746acc":[0.5, 0.39], // Spook
 "5b72e0800ec895face469536":[0.5, 0.46], // Flora — The Rock Garden
 "b7c79eee6a7057c841393d13":[0.48, 0.44], // Inspired by Elda — 4
 "2c2cc5ebb931158ff6b1500e":[0.52, 0.46], // Inspired by Elda — 1
 "2d875f6cefcedff971a4fe73":[0.5, 0.44], // Inspired by Elda — 2
 "2507105e0e94706030726e1a":[0.46, 0.59], // Inspired by Elda — 3
};
export const focalPointFor=work=>focalPoints[work.id]||[.5,.5];
export function coverPlacement(imageWidth,imageHeight,width,height,focus=[.5,.5]){
 const scale=Math.max(width/imageWidth,height/imageHeight);
 const sw=imageWidth*scale,sh=imageHeight*scale;
 const x=Math.min(0,Math.max(width-sw,width/2-sw*focus[0]));
 const y=Math.min(0,Math.max(height-sh,height/2-sh*focus[1]));
 return {x,y,sw,sh};
}
