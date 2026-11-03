/**
 * Runs synchronously in <head> before first paint:
 * - theme (light by default; dark only when chosen with the toggle)
 * - motion: "reduce" | "full" (OS setting, or an override kept in sessionStorage)
 * - input: "touch" | "fine"
 * - intro: first visit of the session plays the <1 s intro
 */
export const headScript = `(function(){var d=document.documentElement;try{
var t=localStorage.getItem('theme');d.dataset.theme=t==='dark'?'dark':'light';
var mo=sessionStorage.getItem('pref:motion');var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
d.dataset.motion=(mo==='reduce'||(mo!=='full'&&rm))?'reduce':'full';
var io=sessionStorage.getItem('pref:input');var tc=matchMedia('(hover: none), (pointer: coarse)').matches;
d.dataset.input=(io==='touch'||(io!=='fine'&&tc))?'touch':'fine';
if(!sessionStorage.getItem('intro')&&d.dataset.motion==='full'){d.dataset.intro='1';sessionStorage.setItem('intro','1')}
}catch(e){d.dataset.theme='light'}d.classList.add('js')})()`;
