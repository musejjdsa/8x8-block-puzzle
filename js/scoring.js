/* ============================================================
   MODULE: js/scoring.js — points, combo & Perfect Clear multiplier
============================================================ */
const Scoring={
 placePoints:cells=>cells*10,
 linePoints:n=>n<=0?0:[0,100,300,600,1000,1500][Math.min(n,5)],
 resolve:({cells,lines,boardEmpty,multiplier,combo})=>{
   let pts=Scoring.placePoints(cells); const events=[];
   if(lines>0){pts+=Scoring.linePoints(lines)*multiplier;events.push(lines===1?'Line clear!':lines+' lines!');}
   let mult=multiplier,cmb=lines>0?combo+1:0;
   if(lines>0&&cmb>=2){mult=Math.min(5,1+cmb-1);}
   let perfect=false;
   if(boardEmpty&&lines>0){perfect=true;pts+=500*mult;mult=Math.min(5,mult+1);events.push('PERFECT CLEAR!');}
   if(lines===0)mult=1;
   return{points:pts,multiplier:perfect?mult:(lines>0?mult:1),combo:cmb,perfect,events};
 }
};
