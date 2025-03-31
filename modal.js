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
    o = s.querySelector('[sm-data="mount"]'),
    n = s.querySelector('[sm-data="animation"]'),
    l = a.getAttribute("sm-data-blur");
  "deposit" === e && (l = "blur(0px)"),
    t
      ? (await sunbetModalsClose(s, !0),
        gsap.set(n, {
          display: "",
        }))
      : (gsap
          .to(a, {
            backdropFilter: l,
            duration: 0.95,
          })
          .delay(0.05),
        (a.onclick = () => {
          sunbetModalsClose(s);
        }));
  let d = await sunbetModalsAppend(e, !1, !0),
    r = d.querySelector('[sm-data="script"] script');
  gsap.set(n, {
    display: "none",
  }),
    o.appendChild(d),
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
    function o() {
      let a = new CustomEvent("sunbet-modals-close", {
        detail: {
          modal: e,
          childOnly: t,
          successClose: s,
        },
      });
      window.dispatchEvent(a);
    }
    let n = gsap.timeline(),
      l = e.querySelector("sunbet-modal");
    if (
      (l &&
        n.to(l, {
          scale: 0.5,
          duration: 0.2,
        }),
      t)
    )
      return void n.call(() => {
        l?.remove(), console.log("sunbet-modals-close 11"), a(), o();
      });
    let d = e.querySelector('[sm-data="background"]');
    d &&
      n.to(
        d,
        {
          backdropFilter: "blur(0px)",
          duration: 0.2,
        },
        "<"
      ),
      n
        .to(
          e,
          {
            opacity: 0,
            duration: 0.2,
          },
          "<"
        )
        .call(() => {
          e.remove(), a(), o();
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
  let o = document.createElement("sunbet-modal");
  (o.innerHTML = a), document.body.appendChild(o);
  let n = {
      opacity: 0,
    },
    l = {
      opacity: 1,
      duration: 0.2,
    };
  return s && ((n.scale = 0.5), (l.scale = 1)), gsap.fromTo(o, n, l), o;
}
sunbetModalsAddEventListeners(), sunbetModalsAppend("loader", !0);
