(() => {
  const body = document.body;
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.getElementById("primary-nav");
  const navLinks = [...document.querySelectorAll(".site-nav__link")];
  const sections = [...document.querySelectorAll("[data-section]")];
  const hero = document.querySelector(".hero");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canUsePointerEffects = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const parallaxElements = prefersReducedMotion ? [] : [...document.querySelectorAll("[data-parallax-speed]")];

  if (body) {
    body.classList.add("js-enhanced");
  }

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 32);
  };

  const openMenu = () => {
    if (!header || !menuToggle || !nav) return;
    nav.setAttribute("aria-hidden", "false");
    header.classList.add("is-menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  };

  const closeMenu = () => {
    if (!header || !menuToggle || !nav) return;
    header.classList.remove("is-menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    nav.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const toggleMenu = () => {
    if (header && header.classList.contains("is-menu-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  if (menuToggle && nav) {
    if (window.matchMedia("(max-width: 900px)").matches) {
      nav.setAttribute("aria-hidden", "true");
    }

    menuToggle.addEventListener("click", toggleMenu);

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 900px)").matches) {
          closeMenu();
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header && header.classList.contains("is-menu-open")) {
        closeMenu();
      }
    });
  }

  const primeRevealElement = (element, defaultDirection = "up", defaultDelay = 0) => {
    if (!(element instanceof HTMLElement)) return;
    if (!element.dataset.reveal) {
      element.dataset.reveal = defaultDirection;
    }

    const explicitDelay = Number(element.dataset.revealDelay || defaultDelay || 0);
    element.style.setProperty("--reveal-delay", `${explicitDelay}ms`);
  };

  document.querySelectorAll("[data-reveal]").forEach((element) => {
    primeRevealElement(element, element.dataset.reveal || "up");
  });

  document.querySelectorAll("[data-reveal-children]").forEach((group) => {
    const direction = group.dataset.revealChildren || "up";
    [...group.children].forEach((child, index) => {
      if (!(child instanceof HTMLElement) || child.hidden || child.matches("script, style")) return;
      primeRevealElement(child, direction, index * 90);
    });
  });

  document.querySelectorAll("[data-reveal-grid]").forEach((grid) => {
    [...grid.children].forEach((child, index) => {
      if (!(child instanceof HTMLElement) || child.hidden) return;
      primeRevealElement(child, "up", index * 110);
    });
  });

  const revealElements = [...document.querySelectorAll("[data-reveal]")];

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -14% 0px",
        threshold: 0.18
      }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const setActiveNav = (id) => {
    navLinks.forEach((link) => {
      const isMatch = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isMatch);
      if (isMatch) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        setActiveNav(visible.target.id);
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.2, 0.4, 0.6]
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  let parallaxFrame = 0;

  const updateParallax = () => {
    parallaxFrame = 0;
    const viewportHeight = window.innerHeight || 1;

    parallaxElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom < -60 || rect.top > viewportHeight + 60) return;

      const speed = Number(element.dataset.parallaxSpeed || 0);
      const distanceFromCenter = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
      const shift = Math.max(Math.min(distanceFromCenter * speed * -180, 28), -28);
      element.style.setProperty("--parallax-y", `${shift.toFixed(2)}px`);
    });
  };

  const requestParallax = () => {
    if (!parallaxElements.length || parallaxFrame) return;
    parallaxFrame = window.requestAnimationFrame(updateParallax);
  };

  if (hero && canUsePointerEffects && !prefersReducedMotion) {
    let pointerFrame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const renderPointerShift = () => {
      pointerFrame = 0;
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;

      hero.style.setProperty("--pointer-x", `${currentX.toFixed(2)}px`);
      hero.style.setProperty("--pointer-y", `${currentY.toFixed(2)}px`);

      if (Math.abs(targetX - currentX) > 0.12 || Math.abs(targetY - currentY) > 0.12) {
        pointerFrame = window.requestAnimationFrame(renderPointerShift);
      }
    };

    const requestPointerShift = () => {
      if (!pointerFrame) {
        pointerFrame = window.requestAnimationFrame(renderPointerShift);
      }
    };

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
      const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

      targetX = normalizedX * 28;
      targetY = normalizedY * 22;
      requestPointerShift();
    });

    hero.addEventListener("pointerleave", () => {
      targetX = 0;
      targetY = 0;
      requestPointerShift();
    });

    window.addEventListener("blur", () => {
      targetX = 0;
      targetY = 0;
      requestPointerShift();
    });
  }

  const handleResize = () => {
    if (!nav || !header) return;

    if (window.matchMedia("(min-width: 901px)").matches) {
      if (header.classList.contains("is-menu-open")) {
        closeMenu();
      }
      nav.removeAttribute("aria-hidden");
    } else if (!header.classList.contains("is-menu-open")) {
      nav.setAttribute("aria-hidden", "true");
    }

    requestParallax();
  };

  const handleScroll = () => {
    setHeaderState();
    requestParallax();
  };

  setHeaderState();
  requestParallax();
  handleResize();

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleResize);

  window.requestAnimationFrame(() => {
    body?.classList.add("is-ready");
  });
})();
