// sunbetModalsRender('welcome');

(() => {
  // Show loader
  document.querySelector('[sm-data="message-loader"]').classList.remove("hide");
  document
    .querySelectorAll(
      '[sm-data="username"], [sm-data="message"], [sm-data="cta"]'
    )
    .forEach((el) => el.classList.add("hide"));
})();

simlBC.getProfile((err, data) => {
  // HIde loader
  document.querySelector('[sm-data="message-loader"]').classList.add("hide");
  document
    .querySelectorAll(
      '[sm-data="username"], [sm-data="message"], [sm-data="cta"]'
    )
    .forEach((el) => el.classList.remove("hide"));

  // Values
  const isVerified =
    data.player.profile.playerStatuses.identityDocumentationStatus == "Passed";

  // Styles

  // Username
  document.querySelector('[sm-data="username"]').innerHTML =
    data.player.profile.personal.firstName;

  // CTA
  const cta = document.querySelector('[sm-data="cta"]');
  cta.innerHTML = isVerified ? "Explore" : "Continue";
  cta.onclick = () => {
    isVerified
      ? sunbetModalsClose(document.querySelector("sunbet-modal"), false, true)
      : sunbetModalsRender("fica");
  };

  // Message
  document.querySelector('[sm-data="message"]').innerHTML = isVerified
    ? `
<div style="text-align: left; padding: 0;">
  <p>Experience the thrill of sports betting and online gaming like never before. Whether you're a seasoned pro or just starting, we've got the best odds, exciting promotions, and an unbeatable selection of markets just for you!</p>
  <ul style="list-style-type: none; padding: 0; padding-top: 10px;">
    <li>🔸 <strong>Place your bets on your favorite sports</strong></li>
    <li>🔸 <strong>Enjoy fast and secure payouts</strong></li>
    <li>🔸 <strong>Join today and claim your welcome bonus!</strong></li>
  </ul>
  <p>Get ready for a world of winning. Let’s make your next big win happen at SunBet!</p>
</div>
`
    : `
<div style="text-align: left; padding: 0;">
  <p>We’re thrilled to have you on board and can’t wait for you to start betting on your favorite sports and markets. But before you can fully enjoy everything SunBet has to offer, we need you to upload your FICA documentation.</p>
  <p style="padding-top: 10px; padding-bottom: 10px;">🔸 <strong>Why FICA? It’s part of our commitment to ensuring a safe and secure betting environment.</strong></p>
  <p>Once you’ve uploaded your documents, you’ll be ready to dive into the action!</p>
</div>
`;
});
