gsap.registerPlugin(ScrollTrigger);

/* Mobile browser address bar resize issue fix */
ScrollTrigger.config({
  ignoreMobileResize: true
});

window.addEventListener("load", () => {
  const book = document.querySelector("#heroBook");
  const target = document.querySelector("#bannerBookTarget");

  if (!book || !target) return;

  ScrollTrigger.saveStyles("#heroBook");

  const mm = gsap.matchMedia();

  mm.add("(min-width: 981px)", () => {
    const targetRect = target.getBoundingClientRect();
    const bookRect = book.getBoundingClientRect();

    const targetX =
      targetRect.left + targetRect.width * 0.5 -
      (bookRect.left + bookRect.width * 0.5);

    const targetY =
      targetRect.top + targetRect.height * 0.5 -
      (bookRect.top + bookRect.height * 0.5);

    const tween = gsap.to(book, {
      x: targetX,
      y: targetY + 40,
      scale: 1.08,
      rotate: 20,
      ease: "none",
      scrollTrigger: {
        trigger: "#heroBanner",
        start: "top 85%",
        end: "top 20%",
        scrub: 1.2,
        invalidateOnRefresh: true
      }
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(book, { clearProps: "all" });
    };
  });

  mm.add("(max-width: 980px)", () => {
    const targetRect = target.getBoundingClientRect();
    const bookRect = book.getBoundingClientRect();

    const targetX =
      targetRect.left + targetRect.width * 0.5 -
      (bookRect.left + bookRect.width * 0.5);

    const targetY =
      targetRect.top + targetRect.height * 0.5 -
      (bookRect.top + bookRect.height * 0.5);

    const tween = gsap.to(book, {
      x: targetX,
      y: targetY + 30,
      scale: 0.75,
      rotate: 20,
      ease: "none",
      scrollTrigger: {
        trigger: "#heroBanner",
        start: "top 90%",
        end: "top 30%",
        scrub: 1.2,
        invalidateOnRefresh: true
      }
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(book, { clearProps: "all" });
    };
  });
});


/* =========================
   GALLERY VARIABLES
========================= */

const galleryImgItems = Array.from(
  { length: 6 },
  (_, i) => document.getElementById(`galleryImg${i}`)
);

const galleryBookCover = document.getElementById("galleryBookCover");
const galleryBookLabel = document.getElementById("galleryBookLabel");

const galleryProgDots = Array.from(
  { length: 6 },
  (_, i) => document.getElementById(`galleryPd${i}`)
);

const galleryScrollProg = document.getElementById("galleryScrollProgress");

const galleryLines = Array.from(
  { length: 6 },
  (_, i) => document.getElementById(`galleryLine${i}`)
);


/* =========================
   GALLERY POSITIONS
========================= */

function getGalleryPositions() {
  const scene = document.getElementById("bookGalleryScene");

  const vw = window.innerWidth;
  const vh = scene?.clientHeight || window.innerHeight;

  const rootStyle = getComputedStyle(document.documentElement);

  const imgSize =
    parseFloat(rootStyle.getPropertyValue("--gallery-img-size")) || 100;

  const bookW =
    parseFloat(rootStyle.getPropertyValue("--gallery-book-w")) || 120;

  const bookH =
    parseFloat(rootStyle.getPropertyValue("--gallery-book-h")) || 170;

  const sidePadding = vw <= 420 ? 14 : 22;
  const verticalPadding = vw <= 420 ? 54 : 66;

  const maxX = (vw / 2) - (imgSize / 2) - sidePadding;
  const maxY = (vh / 2) - (imgSize / 2) - verticalPadding;

  const minGapX = bookW / 2 + imgSize / 2 + (vw <= 420 ? 10 : 18);
  const minGapY = bookH / 2 + imgSize / 2 + (vw <= 420 ? 8 : 16);

  if (vw <= 980) {
    const x = Math.min(maxX, Math.max(minGapX, vw * 0.28));
    const y = Math.min(maxY, Math.max(minGapY, vh * 0.22));

    const midX = Math.min(maxX, Math.max(minGapX, vw * 0.32));

    return [
      { x: -x,    y: -y },
      { x:  x,    y: -y },
      { x: -midX, y:  0 },
      { x:  midX, y:  0 },
      { x: -x,    y:  y },
      { x:  x,    y:  y }
    ];
  }

  return [
    { x: -340, y: -260 },
    { x:  340, y: -260 },
    { x: -430, y: 0 },
    { x:  430, y: 0 },
    { x: -340, y: 260 },
    { x:  340, y: 260 }
  ];
}

let galleryPositions = getGalleryPositions();

galleryPositions.forEach((pos, i) => {
  if (!galleryImgItems[i]) return;

  gsap.set(galleryImgItems[i], {
    x: pos.x,
    y: pos.y,
    opacity: 0,
    scale: 0
  });
});


/* =========================
   CONNECTOR LINES
========================= */

function updateGalleryLines() {
  const scene = document.getElementById("bookGalleryScene");
  if (!scene) return;

  const rect = scene.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;

  const positions = getGalleryPositions();

  positions.forEach((p, i) => {
    const line = galleryLines[i];
    if (!line) return;

    const ix = cx + p.x;
    const iy = cy + p.y;

    line.setAttribute("x1", cx);
    line.setAttribute("y1", cy);
    line.setAttribute("x2", ix);
    line.setAttribute("y2", iy);

    const len = Math.sqrt((ix - cx) ** 2 + (iy - cy) ** 2);

    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
  });
}

function drawGalleryLines(progress) {
  galleryLines.forEach((line, i) => {
    if (!line) return;

    const startPct = 0.12 + i * 0.12;
    const drawDuration = 0.16;

    const p = Math.max(
      0,
      Math.min(1, (progress - startPct) / drawDuration)
    );

    const len = parseFloat(line.style.strokeDasharray) || 0;
    line.style.strokeDashoffset = len * (1 - p);
  });
}




/* =========================
   GALLERY TIMELINE
========================= */

const galleryTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".book-gallery-scroll-space",
    start: "top top",
    end: "bottom bottom",
    pin: "#bookGalleryScene",
    pinSpacing: true,
    scrub: 1.2,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    refreshPriority: 1,
    pinType: "fixed",

    onEnter: () => {
      galleryScrollProg?.classList.add("visible");
    },

    onLeave: () => {
      galleryScrollProg?.classList.remove("visible");
    },

    onEnterBack: () => {
      galleryScrollProg?.classList.add("visible");
      updateGalleryLines();
    },

    onLeaveBack: () => {
      galleryScrollProg?.classList.remove("visible");
      drawGalleryLines(0);
    },

    onRefresh: (self) => {
      updateGalleryLines();
      drawGalleryLines(self.progress);
    },

    onUpdate: (self) => {
      const p = self.progress;

      drawGalleryLines(p);

      galleryProgDots.forEach((dot, i) => {
        if (!dot) return;

        const dotStart = i / 6;
        dot.classList.toggle("lit", p >= dotStart);
      });
    }
  }
});


/* =========================
   BOOK INTRO
========================= */

if (galleryBookCover) {
  galleryTl.fromTo(
    galleryBookCover,
    {
      scale: 0.88,
      opacity: 0.65
    },
    {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: "power2.out"
    },
    0
  );
}

if (galleryBookLabel) {
  galleryTl.fromTo(
    galleryBookLabel,
    {
      opacity: 0
    },
    {
      opacity: 1,
      duration: 0.3
    },
    0.25
  );
}


/* =========================
   GALLERY IMAGES
========================= */

galleryImgItems.forEach((item, i) => {
  if (!item) return;

  const startAt = 0.1 + i * 0.28;
  const caption = item.querySelector(".gallery-img-caption");

  galleryTl.fromTo(
    item,
    {
      opacity: 0,
      scale: 0,
      x: () => getGalleryPositions()[i]?.x || 0,
      y: () => getGalleryPositions()[i]?.y || 0
    },
    {
      opacity: 1,
      scale: 1,
      x: () => getGalleryPositions()[i]?.x || 0,
      y: () => getGalleryPositions()[i]?.y || 0,
      duration: 0.4,
      ease: "power2.out",
      immediateRender: false
    },
    startAt
  );

  if (caption) {
    galleryTl.fromTo(
      caption,
      {
        opacity: 0,
        y: 4
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.25,
        ease: "power2.out",
        immediateRender: false
      },
      startAt + 0.28
    );
  }
});

galleryTl.to(
  {},
  {
    duration: 1.4
  },
  2.2
);


/* =========================
   POPUP
========================= */

const galleryPopup = document.getElementById("galleryPopup");
const galleryPopupImg = document.getElementById("galleryPopupImg");
const galleryPopupClose = document.getElementById("galleryPopupClose");
const galleryBoxes = document.querySelectorAll(".gallery-img-box");

galleryBoxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (!galleryPopup || !galleryPopupImg) return;

    const fullImg = box.getAttribute("data-full");
    const thumbImg = box.querySelector("img");

    galleryPopupImg.src = fullImg || thumbImg?.src || "";
    galleryPopupImg.alt = thumbImg?.alt || "Expanded page";

    galleryPopup.classList.add("active");
    document.body.classList.add("popup-open");
  });
});

function closeGalleryPopup() {
  if (!galleryPopup || !galleryPopupImg) return;

  galleryPopup.classList.remove("active");
  document.body.classList.remove("popup-open");

  setTimeout(() => {
    galleryPopupImg.src = "";
  }, 250);
}

galleryPopupClose?.addEventListener("click", closeGalleryPopup);

galleryPopup?.addEventListener("click", (e) => {
  if (e.target === galleryPopup) {
    closeGalleryPopup();
  }
});

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    galleryPopup?.classList.contains("active")
  ) {
    closeGalleryPopup();
  }
});


/* =========================
   LOAD + RESIZE
========================= */

window.addEventListener("load", () => {
  updateGalleryLines();
  drawGalleryLines(0);

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
});

let resizeTimer;
let lastGalleryVW = window.innerWidth;

window.addEventListener("resize", () => {
  const currentVW = window.innerWidth;

  if (ScrollTrigger.isTouch && currentVW === lastGalleryVW) {
    return;
  }

  lastGalleryVW = currentVW;
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    galleryPositions = getGalleryPositions();

    galleryTl.invalidate();
    updateGalleryLines();

    const galleryST = galleryTl.scrollTrigger;
    const currentProgress = galleryST ? galleryST.progress : 0;

    ScrollTrigger.refresh();
    drawGalleryLines(currentProgress);

    galleryProgDots.forEach((dot, i) => {
      if (!dot) return;

      const dotStart = i / 6;
      dot.classList.toggle("lit", currentProgress >= dotStart);
    });
  }, 220);
});

window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    galleryPositions = getGalleryPositions();

    galleryTl.invalidate();
    updateGalleryLines();
    ScrollTrigger.refresh();
  }, 350);
});