(() => {
  const packs = [
    {
      name: "Exploring the Alps",
      price: 1.99,
      description: "Three snow-bound alpine paintings in impasto style.",
      quantity: 5,
      label: "New",
      tags: ["nature", "alps"],
    },
    {
      name: "Golden Hours In Monaco",
      price: 1.99,
      description: "Sunlit harbor and coastal brushwork from Monaco.",
      quantity: 3,
      label: "Hot",
      tags: ["luxury", "city", "coast"],
    },
  ];

  const toSlug = (str) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const getPackImages = (pack) =>
    Array.from({ length: pack.quantity }, (_, i) =>
      `./media/${pack.name.toLowerCase()}/${i + 1}.png`
    );

  // Announcement bar
  const firstFeatured = packs.find((p) => p.label === "New" || p.label === "Hot") || packs[0];
  const announce = document.querySelector(".announce");
  if (announce && firstFeatured) {
    announce.textContent = `${firstFeatured.label ? `${firstFeatured.label} pack: ` : ""}${firstFeatured.name}, $${firstFeatured.price.toFixed(2)}`;
    announce.href = `#${toSlug(firstFeatured.name)}-pack`;
  }

  // Hero crossfade slideshow
  const heroSlides = document.querySelectorAll(".hero-phone .wallpaper-display");
  const allWallpapers = packs.flatMap(getPackImages);

  if (heroSlides.length === 2 && allWallpapers.length > 0) {
    let idx = 0;
    let layer = 0;
    heroSlides[0].src = allWallpapers[0];
    heroSlides[0].classList.add("on");
    heroSlides[1].src = allWallpapers[1 % allWallpapers.length];

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && allWallpapers.length > 1) {
      setInterval(() => {
        idx = (idx + 1) % allWallpapers.length;
        const next = 1 - layer;
        heroSlides[next].src = allWallpapers[idx];
        heroSlides[next].classList.add("on");
        heroSlides[layer].classList.remove("on");
        layer = next;
      }, 4500);
    }
  }

  // Live lockscreen clock
  const updateClock = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const timeStr = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    document.querySelectorAll("[data-lock-date]").forEach((el) => (el.textContent = dateStr));
    document.querySelectorAll("[data-lock-time]").forEach((el) => (el.textContent = timeStr));
  };
  updateClock();
  setInterval(updateClock, 15000);

  // Toast helper
  const toastEl = document.getElementById("toast");
  let toastTimer;
  const showToast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
  };

  // iOS Bottom-Sheet Preview Popup
  const sheet = document.getElementById("ios-sheet");
  const sheetBackdrop = document.getElementById("sheet-backdrop");
  const sheetTitle = document.getElementById("sheet-title");
  const sheetSub = document.getElementById("sheet-sub");
  const sheetPhone = document.getElementById("sheet-phone");
  const sheetWall = document.getElementById("sheet-wall");
  const sheetThumbs = document.getElementById("sheet-thumbs");
  const sheetPrice = document.getElementById("sheet-price");
  const sheetAddBtn = document.getElementById("sheet-add-btn");
  const sheetCloseBtn = document.getElementById("sheet-close");
  const sheetGrabber = document.getElementById("sheet-grabber");
  const segBtns = document.querySelectorAll("[data-sheet-mode]");

  let activeSheetPack = null;

  const setSheetMode = (mode) => {
    const isHome = mode === "home";
    sheetPhone?.classList.toggle("is-home", isHome);
    segBtns.forEach((b) => b.classList.toggle("active", b.dataset.sheetMode === mode));
  };

  segBtns.forEach((btn) => {
    btn.addEventListener("click", () => setSheetMode(btn.dataset.sheetMode));
  });

  const openSheet = (pack) => {
    if (!sheet || !sheetBackdrop) return;
    activeSheetPack = pack;
    const images = getPackImages(pack);

    if (sheetTitle) sheetTitle.textContent = pack.name;
    if (sheetSub) sheetSub.textContent = `${pack.quantity} wallpapers · Instant download`;
    if (sheetPrice) sheetPrice.textContent = `$${pack.price.toFixed(2)}`;
    if (sheetWall) sheetWall.src = images[0] || "";
    setSheetMode("lock");

    if (sheetThumbs) {
      sheetThumbs.innerHTML = images
        .map(
          (src, i) => `
          <button class="sheet-thumb-btn" type="button" data-sheet-pick="${i}" aria-pressed="${i === 0}" aria-label="${pack.name} ${i + 1}">
            <img src="${src}" alt="">
          </button>
        `
        )
        .join("");

      sheetThumbs.querySelectorAll("[data-sheet-pick]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const i = Number(btn.dataset.sheetPick);
          if (sheetWall && images[i]) sheetWall.src = images[i];
          sheetThumbs
            .querySelectorAll("[data-sheet-pick]")
            .forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        });
      });
    }

    sheet.hidden = false;
    sheet.style.transform = "";
    requestAnimationFrame(() => {
      sheet.classList.add("open");
      sheetBackdrop.classList.add("open");
      sheetCloseBtn?.focus();
    });
  };

  const closeSheet = () => {
    if (!sheet || !sheetBackdrop) return;
    sheet.classList.remove("open");
    sheetBackdrop.classList.remove("open");
    sheet.style.transform = "";
    setTimeout(() => {
      if (!sheet.classList.contains("open")) sheet.hidden = true;
    }, 380);
  };

  sheetCloseBtn?.addEventListener("click", closeSheet);
  sheetBackdrop?.addEventListener("click", closeSheet);

  // Drag-down handle gesture on mobile
  if (sheetGrabber && sheet) {
    let startY = 0;
    let deltaY = 0;
    let dragging = false;

    sheetGrabber.addEventListener("pointerdown", (e) => {
      dragging = true;
      startY = e.clientY;
      deltaY = 0;
      sheet.style.transition = "none";
      sheetGrabber.setPointerCapture(e.pointerId);
    });

    sheetGrabber.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      deltaY = Math.max(0, e.clientY - startY);
      sheet.style.transform = `translate(-50%, ${deltaY}px)`;
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      sheet.style.transition = "";
      if (deltaY > 110) closeSheet();
      else sheet.style.transform = "";
    };

    sheetGrabber.addEventListener("pointerup", endDrag);
    sheetGrabber.addEventListener("pointercancel", endDrag);
  }

  // Bag state & slide-over drawer
  let bagItems = [];
  try {
    const saved = JSON.parse(localStorage.getItem("sfondo_bag_items") || "[]");
    if (Array.isArray(saved)) bagItems = saved;
  } catch (_) {}

  const bagBtn = document.getElementById("bag");
  const bagCount = document.getElementById("bag-count");
  const drawer = document.getElementById("bag-drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  const drawerBody = document.getElementById("drawer-body");
  const drawerFoot = document.getElementById("drawer-foot");
  const bagTotal = document.getElementById("bag-total");
  const closeDrawerBtn = document.getElementById("close-drawer");
  const checkoutBtn = document.getElementById("checkout-btn");

  const renderBag = () => {
    if (bagCount) bagCount.textContent = String(bagItems.length);
    try {
      localStorage.setItem("sfondo_bag_items", JSON.stringify(bagItems));
    } catch (_) {}

    if (!drawerBody || !drawerFoot) return;

    if (bagItems.length === 0) {
      drawerBody.innerHTML = `<p class="bag-empty">Your bag is empty.</p>`;
      drawerFoot.hidden = true;
      return;
    }

    drawerBody.innerHTML = bagItems
      .map(
        (item) => `
        <div class="bag-item">
          <img src="${item.thumb}" alt="">
          <div class="bag-item-meta">
            <div class="bag-item-title">${item.name}</div>
            <div class="bag-item-sub">${item.quantity} wallpapers · $${item.price.toFixed(2)}</div>
          </div>
          <button class="remove-btn" type="button" data-remove="${item.id}">Remove</button>
        </div>
      `
      )
      .join("");

    const total = bagItems.reduce((sum, item) => sum + item.price, 0);
    if (bagTotal) bagTotal.textContent = `$${total.toFixed(2)}`;
    drawerFoot.hidden = false;

    drawerBody.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.remove;
        bagItems = bagItems.filter((item) => item.id !== id);
        renderBag();
        showToast("Removed from bag");
      });
    });
  };

  const addPackToBag = (pack) => {
    const id = toSlug(pack.name);
    if (!bagItems.some((item) => item.id === id)) {
      bagItems.push({
        id,
        name: pack.name,
        price: pack.price,
        quantity: pack.quantity,
        thumb: getPackImages(pack)[0] || "",
      });
      renderBag();
    }
    showToast(`Added ${pack.name} to your bag`);
  };

  sheetAddBtn?.addEventListener("click", () => {
    if (!activeSheetPack) return;
    addPackToBag(activeSheetPack);
    closeSheet();
  });

  const openDrawer = () => {
    if (!drawer || !backdrop) return;
    drawer.hidden = false;
    requestAnimationFrame(() => {
      drawer.classList.add("open");
      backdrop.classList.add("open");
      closeDrawerBtn?.focus();
    });
  };

  const closeDrawer = () => {
    if (!drawer || !backdrop) return;
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
    setTimeout(() => {
      if (!drawer.classList.contains("open")) drawer.hidden = true;
    }, 300);
    bagBtn?.focus();
  };

  bagBtn?.addEventListener("click", openDrawer);
  closeDrawerBtn?.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (sheet && !sheet.hidden) closeSheet();
      else if (drawer && !drawer.hidden) closeDrawer();
    }
  });

  checkoutBtn?.addEventListener("click", () => {
    bagItems = [];
    renderBag();
    closeDrawer();
    showToast("Thank you! Preparing your download…");
  });

  renderBag();

  // Render "Right now" Featured Section (New & Hot packs)
  const featuredGrid = document.getElementById("featured-grid");
  const featuredPacks = packs.filter((p) => {
    const l = (p.label || "").toLowerCase();
    return l === "new" || l === "hot";
  });

  if (featuredGrid) {
    featuredGrid.innerHTML = featuredPacks
      .map((pack, i) => {
        const thumb = getPackImages(pack)[0] || "";
        const badgeClass = `badge-${pack.label.toLowerCase()}`;
        return `
          <button class="featured-card" type="button" data-featured-idx="${i}">
            <div class="featured-thumb"><img src="${thumb}" alt=""></div>
            <div class="featured-body">
              <h3>${pack.name} <span class="${badgeClass}">${pack.label}</span></h3>
              <p>${pack.description || `${pack.quantity} portrait wallpapers.`}</p>
              <div class="featured-meta">
                <span>$${pack.price.toFixed(2)}</span>
                <span>·</span>
                <span>${pack.quantity} wallpapers</span>
              </div>
            </div>
          </button>
        `;
      })
      .join("");

    featuredGrid.querySelectorAll("[data-featured-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pack = featuredPacks[Number(btn.dataset.featuredIdx)];
        if (pack) openSheet(pack);
      });
    });
  }

  // Render Collections Catalog & Tag Filter
  const catalog = document.querySelector(".catalog");
  const filterBar = document.getElementById("filter-bar");
  const packCards = [];

  if (catalog) {
    catalog.innerHTML = "";

    packs.forEach((pack) => {
      const slug = toSlug(pack.name);
      const images = getPackImages(pack);
      const tags = Array.isArray(pack.tags) ? pack.tags : [];

      const cardsHtml = images
        .slice(0, Math.min(3, images.length))
        .map((src) => `<div class="card"><img src="${src}" alt=""></div>`)
        .join("");

      const badgeHtml = pack.label
        ? `<span class="badge-${pack.label.toLowerCase()}">${pack.label}</span>`
        : "";

      const tagsHtml = tags
        .map((tag) => `<button class="tag-pill" type="button" data-filter-tag="${tag}">${tag}</button>`)
        .join("");

      const article = document.createElement("article");
      article.className = "pack";
      article.id = `${slug}-pack`;

      article.innerHTML = `
        <button class="stack" type="button" data-open-sheet aria-label="Preview ${pack.name}">
          ${cardsHtml}
        </button>
        <div class="info">
          <h3>${pack.name} ${badgeHtml}</h3>
          <p>${pack.description}</p>
          ${tagsHtml ? `<div class="pack-tags">${tagsHtml}</div>` : ""}
          <div class="get-row">
            <button class="btn" type="button" data-open-sheet>Get</button>
            <span class="price">$${pack.price.toFixed(2)}</span>
          </div>
        </div>
      `;

      article.querySelectorAll("[data-open-sheet]").forEach((trigger) => {
        trigger.addEventListener("click", () => openSheet(pack));
      });

      catalog.appendChild(article);
      packCards.push({ article, tags });
    });
  }

  const allTags = ["all", ...new Set(packs.flatMap((p) => p.tags || []))];

  const applyFilter = (tag) => {
    filterBar?.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.tag === tag));
    });

    let visible = 0;
    packCards.forEach(({ article, tags }) => {
      const show = tag === "all" || tags.includes(tag);
      article.hidden = !show;
      if (show) visible += 1;
    });

    let empty = catalog?.querySelector(".empty-filter");
    if (visible === 0 && catalog) {
      if (!empty) {
        empty = document.createElement("p");
        empty.className = "empty-filter";
        catalog.appendChild(empty);
      }
      empty.textContent = `No collections tagged "${tag}" yet.`;
      empty.hidden = false;
    } else if (empty) {
      empty.hidden = true;
    }
  };

  if (filterBar) {
    filterBar.innerHTML = allTags
      .map(
        (tag) => `
        <button class="filter-btn" type="button" data-tag="${tag}" aria-pressed="${tag === "all"}">
          ${tag}
        </button>
      `
      )
      .join("");

    filterBar.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => applyFilter(btn.dataset.tag));
    });
  }

  catalog?.addEventListener("click", (e) => {
    const pill = e.target.closest("[data-filter-tag]");
    if (!pill) return;
    applyFilter(pill.dataset.filterTag);
    filterBar?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  // Newsletter form
  const joinForm = document.getElementById("join");
  joinForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("email");
    if (!input || !input.value.trim()) return;
    input.value = "";
    showToast("You're on the list for new packs.");
  });
})();