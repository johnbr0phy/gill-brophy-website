// Reviewed alternate photographs: full composition first, detail second.
const viewGroups=[["4d8a54d383220e99035e8ea0", "86b56a8760a685ddb9c5b33e"], ["a02445212b0b9d003b3c3e41", "555d4e058c7044d9cd0887ea"], ["fa14d50c6c43f8cd9681e482", "0812a5ef065f09851da311a0"], ["d5adb17e31e00fe59769304e", "65e2e69cb59cfedcf5728685"], ["0e0795bd04c7aefec6c36ab3", "a5a933c358d2fbce9f5a9a02"], ["6f811bfba0fc2c4c078c2301", "65bd994b63e364d222a6dc63"], ["85938d764fa359cac7629535", "a8e1b42957632f22976bd7f7"]];
export const openingIds=["bf2537e111f89ccfb30579e0", "7a8e026bd363b8c6cce10c92", "a315d7b2fb2c2028086c2af5", "d5adb17e31e00fe59769304e", "7c8b53089758cb8758e58a29", "4574e75a4b9d11c02f8664d5", "449a82c5d3fa0e037fd1ddd7", "2c2cc5ebb931158ff6b1500e"];
export const collectionCovers=["a02445212b0b9d003b3c3e41", "88b04dc65e1a7039f67c9713", "d5adb17e31e00fe59769304e", "85938d764fa359cac7629535", "f4c6265d19bb9286d18b5140", "6284b28be3b1ce0290b499fa", "9d550b06d8ffeaf1cf64b2e7", "449a82c5d3fa0e037fd1ddd7", "2c2cc5ebb931158ff6b1500e"];
export function displayTitle(work){
 const title=(work.title||'').replace(/\s+/g,' ').trim();
 return /^Artwork\s+\d+$/i.test(title)||!title?'Untitled':title.replace(/\s*\((?:full view|detail)\)$/i,'');
}
export function groupPaintings(works){
 const available=new Map(works.map(w=>[w.id,w])),members=new Map();
 for(const ids of viewGroups){const views=ids.map(id=>available.get(id)).filter(Boolean);for(const v of views)members.set(v.id,views)}
 const seen=new Set(),result=[];
 for(const work of works){const views=members.get(work.id)||[work],primary=views[0];if(seen.has(primary.id))continue;seen.add(primary.id);result.push({...primary,title:displayTitle(primary),views})}
 return result;
}
