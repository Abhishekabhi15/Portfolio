/* =========================
   ERASE + TYPE HERO TEXT
   ========================= */
const typingText = document.getElementById("typingText");
const typingWords = [
  "AI/ML Developer",
  "Full-Stack Developer"
];

let typingWord = 0;
let typingIndex = 0;
let deleting = false;

function typeLoop(){
  const word = typingWords[typingWord];

  if(!deleting){
    typingText.textContent = word.slice(0, typingIndex + 1);
    typingIndex++;

    if(typingIndex === word.length){
      deleting = true;
      setTimeout(typeLoop, 1900);
      return;
    }
    setTimeout(typeLoop, 105);
  }else{
    typingText.textContent = word.slice(0, typingIndex - 1);
    typingIndex--;

    if(typingIndex === 0){
      deleting = false;
      typingWord = (typingWord + 1) % typingWords.length;
      setTimeout(typeLoop, 350);
      return;
    }
    setTimeout(typeLoop, 68);
  }
}
typeLoop();

/* =========================
   CURSOR TILT + GLASS SHINE
   ========================= */
document.querySelectorAll("[data-tilt]").forEach(wrapper=>{
  const card = wrapper.querySelector(".photo-card");
  if(!card) return;

  wrapper.addEventListener("pointermove",(e)=>{
    const r = wrapper.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;

    const rotateY = (x - .5) * 14;
    const rotateX = (.5 - y) * 14;

    card.style.transform =
      `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    card.classList.add("is-hovered");
  });

  wrapper.addEventListener("pointerleave",()=>{
    card.style.transform = "";
    card.classList.remove("is-hovered");
  });
});

/* =========================
   PROJECT ORBIT / HORIZONTAL SCROLL
   ========================= */
const stage = document.getElementById("projectStage");
const cards = [...document.querySelectorAll(".project-card")];
const dots = [...document.querySelectorAll(".dot")];

/* Populate these only with real project URLs supplied by Abhishek. Empty values stay disabled. */
const projectLinks = Object.freeze({
  cvTrust: { github: "https://github.com/Abhishekabhi15/CV-TRUST.git", live: "https://cv-trust-frontend.onrender.com" },
  dayflow: { github: "https://github.com/Abhishekabhi15/DAYFLOW.git", live: " https://dayflow-frontend-2k5w.onrender.com" },
  cityfix: { github: "", live: "" }
});

function renderProjectLinks(){
  cards.forEach(card=>{
    const links = projectLinks[card.dataset.project];
    card.querySelectorAll("[data-link]").forEach(action=>{
      const url = links && links[action.dataset.link];
      const enabled = typeof url === "string" && url.trim().length > 0;
      action.classList.toggle("is-disabled", !enabled);
      action.setAttribute("aria-disabled", String(!enabled));
      if(enabled){
        action.href = url;
        action.target = "_blank";
        action.rel = "noopener noreferrer";
        action.removeAttribute("tabindex");
      }else{
        action.removeAttribute("href");
        action.removeAttribute("target");
        action.removeAttribute("rel");
        action.tabIndex = -1;
      }
    });
  });
}

let activeProject = 0;
let wheelLock = false;
let startX = 0;
let dragging = false;

function projectPosition(index){
  const n = cards.length;
  let diff = index - activeProject;

  // Circular shortest path
  if(diff > n / 2) diff -= n;
  if(diff < -n / 2) diff += n;

  if(diff === 0){
    return {
      x:-50, y:0, scale:1, rotate:0, opacity:1, blur:0, cls:"center"
    };
  }

  if(diff === -1){
    return {
      x:-158, y:112, scale:.70, rotate:-7, opacity:.58, blur:.1, cls:"left"
    };
  }

  if(diff === 1){
    return {
      x:58, y:112, scale:.70, rotate:7, opacity:.58, blur:.1, cls:"right"
    };
  }

  if(diff === -2){
    return {
      x:-174, y:150, scale:.55, rotate:-14, opacity:.16, blur:1, cls:"far"
    };
  }

  return {
    x:74, y:150, scale:.55, rotate:14, opacity:.16, blur:1, cls:"far"
  };
}

function renderProjects(){
  cards.forEach((card,index)=>{
    const p = projectPosition(index);
    card.className = "project-card " + p.cls;
    card.style.transform =
      `translateX(${p.x}%) translateY(${p.y}px) scale(${p.scale}) rotate(${p.rotate}deg) perspective(1000px) rotateX(var(--card-rx, 0deg)) rotateY(var(--card-ry, 0deg))`;
    card.style.opacity = p.opacity;
    card.style.filter = `blur(${p.blur}px)`;
  });

  dots.forEach((dot,index)=>dot.classList.toggle("active",index===activeProject));
}

function goProject(next){
  activeProject = (next + cards.length) % cards.length;
  renderProjects();
}

dots.forEach(dot=>{
  dot.addEventListener("click",()=>goProject(Number(dot.dataset.go)));
});

stage.addEventListener("wheel",(e)=>{
  /* Only the oval/orbit itself controls project navigation.
     Scrolling over the heading/empty project-section space remains normal page scrolling. */
  const rect = stage.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const cx = rect.width / 2;
  const cy = 320;
  const rx = Math.min(510, rect.width * 0.49);
  const ry = 250;
  const insideOval = (((x-cx)*(x-cx))/(rx*rx)) + (((y-cy)*(y-cy))/(ry*ry)) <= 1;

  if(!insideOval) return;

  e.preventDefault();
  if(wheelLock) return;

  const amount = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  if(Math.abs(amount) < 8) return;

  wheelLock = true;
  goProject(activeProject + (amount > 0 ? 1 : -1));
  setTimeout(()=>wheelLock=false,620);
},{passive:false});

stage.addEventListener("pointerdown",(e)=>{
  if(e.target.closest(".project-action")) return;
  dragging=true;
  startX=e.clientX;
  stage.classList.add("dragging");
  stage.setPointerCapture(e.pointerId);
});

stage.addEventListener("pointerup",(e)=>{
  if(!dragging) return;
  dragging=false;
  stage.classList.remove("dragging");
  const dx=e.clientX-startX;
  if(Math.abs(dx)>45) goProject(activeProject + (dx<0 ? 1 : -1));
});

stage.addEventListener("pointercancel",()=>{
  dragging=false;
  stage.classList.remove("dragging");
});

renderProjects();
renderProjectLinks();

/* Keyboard support */
window.addEventListener("keydown",(e)=>{
  const rect=stage.getBoundingClientRect();
  const visible=rect.top<window.innerHeight && rect.bottom>0;
  if(!visible) return;
  if(e.key==="ArrowRight") goProject(activeProject+1);
  if(e.key==="ArrowLeft") goProject(activeProject-1);
});

/* All information cards get the same cursor tilt + glass response */
const interactiveCards = document.querySelectorAll(
  ".skill-card, .edu-card, .cert, .contact-box"
);
interactiveCards.forEach(card=>{
  card.addEventListener("pointermove", e=>{
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width;
    const y=(e.clientY-r.top)/r.height;
    const rx=(0.5-y)*8;
    const ry=(x-0.5)*10;
    card.style.setProperty("--card-rx", `${rx}deg`);
    card.style.setProperty("--card-ry", `${ry}deg`);
    card.classList.add("card-tilt");
  });
  card.addEventListener("pointerleave",()=>{
    card.style.setProperty("--card-rx","0deg");
    card.style.setProperty("--card-ry","0deg");
  });
});
