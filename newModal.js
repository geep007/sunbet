function sunbetModalsAddEventListeners() {
  document.querySelectorAll("[sunbet-modals]").forEach((e) => {
    e.hasAttribute("sm-data") ||
      (e.addEventListener("click", () => {
        sunbetModalsRender(e.getAttribute("sunbet-modals"));
      }),
      e.setAttribute("sm-data", "click"));
  });
}
async function sunbetModalsRender(e) {
  if (!e) return;
  let t = document.querySelector("sunbet-modal"),
    s = t || (await sunbetModalsAppend("loader")),
    a = s.querySelector('[sm-data="background"]'),
    n = s.querySelector('[sm-data="mount"]'),
    o = s.querySelector('[sm-data="animation"]'),
    l = a.getAttribute("sm-data-blur");

  // Set default modal properties
  a.style.pointerEvents = "auto";
  a.style.background = "";

  // Configure modal based on type
  if (e === "deposit") {
    l = "blur(0px)";
    a.style.background = "transparent";
  }

  // Add click handler for closing modal when clicking background
  a.onclick = (event) => {
    // Only close if clicking directly on the background
    if (event.target === a) {
      sunbetModalsClose(s);
    }
  };

  // Handle existing modal
  if (t) {
    await sunbetModalsClose(s, true);
    gsap.set(o, {
      display: "",
    });
  } else {
    // Animate backdrop filter for new modal
    gsap
      .to(a, {
        backdropFilter: l,
        duration: 0.95,
      })
      .delay(0.05);
  }

  let d = await sunbetModalsAppend(e, !1, !0),
    r = d.querySelector('[sm-data="script"] script');
  gsap.set(o, {
    display: "none",
  }),
    n.appendChild(d),
    sunbetModalsAddClosers(d, s),
    sunbetModalsAddEventListeners(),
    r && Function(r.innerHTML)();
}

function sunbetModalsAddClosers(e, t) {
  e.querySelectorAll('[sm-data="closer"]').forEach((e) =>
    e.addEventListener("click", () => {
      sunbetModalsClose(t);
    })
  );
}
async function sunbetModalsClose(e, t = !1, s = !1) {
  return new Promise((a) => {
    function n() {
      let a = new CustomEvent("sunbet-modals-close", {
        detail: {
          modal: e,
          childOnly: t,
          successClose: s,
        },
      });
      window.dispatchEvent(a);
    }
    let o = gsap.timeline(),
      l = e.querySelector("sunbet-modal");
    if (
      (l &&
        o.to(l, {
          scale: 0.5,
          duration: 0.2,
        }),
      t)
    )
      return void o.call(() => {
        l?.remove(), console.log("sunbet-modals-close 11"), a(), n();
      });
    let d = e.querySelector('[sm-data="background"]');
    d &&
      o.to(
        d,
        {
          backdropFilter: "blur(0px)",
          duration: 0.2,
        },
        "<"
      ),
      o
        .to(
          e,
          {
            opacity: 0,
            duration: 0.2,
          },
          "<"
        )
        .call(() => {
          e.remove(), a(), n();
        }),
      s ||
        simlBC.isLoggedIn() ||
        "auth-required" != document.body.getAttribute("sm-data") ||
        (location.href = "/");
  });
}
async function sunbetModalsAppend(e, t = !1, s = !1) {
  let a = sessionStorage.getItem("__sunbet_modal_assests__" + e);
  if (!a) {
    let t = await fetch("/assets/" + e),
      s = await t.text();
    (a = new DOMParser()
      .parseFromString(s, "text/html")
      .body.querySelector("*").outerHTML),
      sessionStorage.setItem("__sunbet_modal_assests__" + e, a);
  }
  if (t) return;
  let n = document.createElement("sunbet-modal");
  (n.innerHTML = a), document.body.appendChild(n);
  let o = {
      opacity: 0,
    },
    l = {
      opacity: 1,
      duration: 0.2,
    };
  return s && ((o.scale = 0.5), (l.scale = 1)), gsap.fromTo(n, o, l), n;
}
sunbetModalsAddEventListeners(), sunbetModalsAppend("loader", !0);
