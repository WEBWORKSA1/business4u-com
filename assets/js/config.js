/* Business4U.com site configuration.
   Edit values here; no build step required. */
window.B4U = {
  name: "Business4U.com",
  url: "https://business4u.com",
  contactUrl: "https://web.works/contact",
  adClient: "ca-pub-6620975821265271",
  // Paste AdSense ad-unit slot IDs to enable manual units. Empty = Auto ads only (recommended until approved).
  adSlots: { top: "", incontent: "", side: "", bottom: "" },
  // Owner inbox (obfuscated). Decoded only at submit/click time; never written to the page.
  k: [90, 19, 55, 108],
  m: [45, 118, 85, 27, 53, 97, 92, 31, 59, 34, 119, 11, 55, 114, 94, 0, 116, 112, 88, 1],
  donate: {
    currency: "USD",
    monthlyGoal: 1500,
    paypalHostedButtonId: "",   // e.g. "ABCD1234XYZ" from PayPal > Donate button (removes inbox from the PayPal URL)
    stripeLink: "",             // e.g. "https://buy.stripe.com/xxxx"
    bmcHandle: ""               // e.g. "business4u" for buymeacoffee.com/business4u
  },
  contest: {
    name: "Founder Pitch of the Month",
    prize: "Featured founder spotlight on Business4U.com + sponsor prize pack",
    note: "Cash prizes are added when a sponsor funds the month. The current prize is always shown here."
  }
};
