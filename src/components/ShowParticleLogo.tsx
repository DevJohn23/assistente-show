'use client';
import { useEffect, useRef } from 'react';

const SOURCE = '/brand/show-symbol-reconstructed-v1.png';
type Particle = { x:number; y:number; homeX:number; homeY:number; vx:number; vy:number; radius:number };

export function ShowParticleLogo() {
  const surface = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const host = surface.current, element = canvas.current;
    if (!host || !element) return;
    const desktop = matchMedia('(min-width: 1024px)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let dispose: (()=>void) | undefined;
    function configure() {
      dispose?.(); dispose = undefined;
      if (!desktop.matches || reduced.matches || !host || !element) return;
      const ctx = element.getContext('2d');
      if (!ctx) return;
      let particles: Particle[] = [], frame = 0, previous = 0, width = 0, height = 0;
      let destroyed = false, visible = true, loaded = false;
      let pointer: {x:number;y:number}|null = null;
      const image = new Image();
      const sample = document.createElement('canvas');
      sample.width = sample.height = 256;
      const sampleContext = sample.getContext('2d', {willReadFrequently:true});
      if (!sampleContext) return;
      const stop = () => {cancelAnimationFrame(frame);frame=0;previous=0;};
      const draw = () => {
        ctx.clearRect(0,0,width,height);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        for (const p of particles) {ctx.moveTo(p.x+p.radius,p.y);ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);}
        ctx.fill();
      };
      const tick = (time:number) => {
        frame=0;
        if (destroyed || !visible || document.hidden) return;
        const dt = previous ? Math.min((time-previous)/16.667,2) : 1;
        previous=time;
        let moving=false;
        for (const p of particles) {
          let tx=p.homeX,ty=p.homeY;
          if(pointer) {
            const dx=p.homeX-pointer.x,dy=p.homeY-pointer.y;
            const distance=Math.hypot(dx,dy),range=90;
            if(distance<range) {
              const force=(1-distance/range)**2*52;
              tx+=dx/Math.max(distance,1)*force;ty+=dy/Math.max(distance,1)*force;
            }
          }
          p.vx=(p.vx+(tx-p.x)*0.06*dt)*Math.pow(0.78,dt);
          p.vy=(p.vy+(ty-p.y)*0.06*dt)*Math.pow(0.78,dt);
          p.x+=p.vx*dt;p.y+=p.vy*dt;
          if(Math.abs(tx-p.x)+Math.abs(ty-p.y)+Math.abs(p.vx)+Math.abs(p.vy)>0.08) moving=true;
          else {p.x=tx;p.y=ty;p.vx=p.vy=0;}
        }
        draw();
        if(moving) frame=requestAnimationFrame(tick);else previous=0;
      };
      const start = () => {if(!frame && particles.length && visible && !document.hidden) frame=requestAnimationFrame(tick);};
      const resize = () => {
        if(!loaded || destroyed) return;
        const rect=host.getBoundingClientRect();width=rect.width;height=rect.height;
        if(!width || !height) return;
        const dpr=Math.min(devicePixelRatio || 1,1.5);
        element.width=Math.round(width*dpr);element.height=Math.round(height*dpr);
        ctx.setTransform(dpr,0,0,dpr,0,0);
        sampleContext.clearRect(0,0,256,256);sampleContext.drawImage(image,0,0,256,256);
        const pixels=sampleContext.getImageData(0,0,256,256).data;
        const size=Math.min(width,height)*0.96,scale=size/256;
        particles=[];
        for(let y=0;y<256;y+=2) for(let x=0;x<256;x+=2) {
          const i=(y*256+x)*4;
          if(pixels[i+3]<190 || pixels[i+2]<pixels[i]+25) continue;
          const homeX=(width-size)/2+x*scale,homeY=(height-size)/2+y*scale;
          particles.push({x:homeX,y:homeY,homeX,homeY,vx:0,vy:0,radius:Math.max(0.9,scale*0.68)});
        }
        stop();draw();host.classList.add('is-ready');
      };
      const move = (event:PointerEvent) => {
        if(event.pointerType==='touch') return;
        const rect=host.getBoundingClientRect();pointer={x:event.clientX-rect.left,y:event.clientY-rect.top};start();
      };
      const leave = () => {pointer=null;start();};
      const visibility = () => {pointer=null;if(document.hidden) stop();else start();};
      const observer=new ResizeObserver(resize);observer.observe(host);
      const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible) start();else {pointer=null;stop();}});intersection.observe(host);
      host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);
      document.addEventListener('visibilitychange',visibility);
      image.onload=()=>{if(!destroyed){loaded=true;resize();}};
      image.src=SOURCE;
      dispose=()=>{
        destroyed=true;stop();image.onload=null;observer.disconnect();intersection.disconnect();
        host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);
        document.removeEventListener('visibilitychange',visibility);host.classList.remove('is-ready');
      };
    }
    configure();desktop.addEventListener('change',configure);reduced.addEventListener('change',configure);
    return ()=>{dispose?.();desktop.removeEventListener('change',configure);reduced.removeEventListener('change',configure);};
  },[]);
  return <div className="show-particle-art" ref={surface} aria-hidden="true"><div className="show-particle-fallback"/><canvas ref={canvas}/></div>;
}
