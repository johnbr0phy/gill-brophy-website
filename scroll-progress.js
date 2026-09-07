// The first work is complete at rest; the very first scroll advances the next.
export function paintingProgress(position,count,span=1.65){
 if(count<=1||position<=0)return {index:0,phase:1};
 const step=position/span;
 if(step>=count-1)return {index:count-1,phase:1};
 const segment=Math.floor(step);
 return {index:segment+1,phase:Math.min(1,(step-segment)/.72)};
}
