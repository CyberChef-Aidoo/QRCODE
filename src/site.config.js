/**
 * SITE CONFIGURATION AND PAGE COPY
 * --------------------------------
 * Edit this file to change the name, logo, channel links, and the words
 * on the page. It is the only place for that text.
 *
 * Leave a channel link as "" until you have the real address.
 * A button stays off until its link is a full https:// address.
 *
 * Do not put student names or other personal information in this file.
 * This website has no login and no database.
 */

export const siteConfig = {
  /** Shown at the top of the page. Example: "North Ridge High School" */
  organisationName: "Duahbed Consult",

  /** Short line under the name. Leave as "" to hide it. */
  tagline: "Success is always assured",

  /**
   * Optional logo.
   * Put the image in the public folder, then set this to "/logo.png".
   * An https:// address also works.
   * Leave as "" to show the name only.
   */
  logoUrl: "/logo.jpg",

  /**
   * YouTube channel link.
   * Example: "https://www.youtube.com/@YourChannel"
   * Leave as "" to disable the YouTube button.
   */
  youtubeChannelUrl: "https://youtube.com/@duahbedconsult?si=r7O6R8kavlN6sQl9",

  /**
   * WhatsApp channel link.
   * Example: "https://www.whatsapp.com/channel/your-channel-id"
   * Leave as "" to disable the WhatsApp button.
   */
  whatsappChannelUrl: "https://whatsapp.com/channel/0029VbCMdxhEquiS6QwyF23b",
};

/**
 * Words shown on the landing page.
 * The quiz answer key is correctOptionId. Options use the ids increase,
 * decrease, and same.
 */
export const pageCopy = {
  heroHeading: "Make accounting make sense.",
  heroText:
    "Get clear explanations, worked examples, and support for exam preparation. Open a channel when you want to study, or try the question further down the page.",

  youtubeLabel: "Subscribe on YouTube",
  youtubeBenefit:
    "YouTube is for clear explanations and worked examples you can pause and replay while you prepare for exams. This button only opens the channel. On YouTube, tap Subscribe yourself.",

  whatsappLabel: "Follow on WhatsApp",
  whatsappBenefit:
    "WhatsApp is for short updates alongside those lessons. This button only opens the channel. On WhatsApp, tap Follow yourself.",

  channelsHeading: "Choose a channel",

  quizTitle: "Try one question",
  quizIntro:
    "This is optional. Your answer stays on this page. You do not sign in, and nothing is saved.",
  quizQuestion:
    "A business buys equipment for cash. What happens to its total assets?",
  quizOptions: [
    { id: "increase", label: "Increase" },
    { id: "decrease", label: "Decrease" },
    { id: "same", label: "Stay the same" },
  ],
  correctOptionId: "same",
  quizExplanation:
    "Equipment increases and cash decreases by the same amount, so total assets stay the same.",
  quizFeedback: {
    same: "Yes. Total assets stay the same.",
    increase: "Not this time. Total assets do not increase.",
    decrease: "Not this time. Total assets do not decrease.",
  },
  quizCheckLabel: "Check answer",
  quizChooseFirst: "Choose Increase, Decrease, or Stay the same, then check your answer.",

  resourcesHeading: "What is on this page",
  resourcesIntro:
    "There is no separate lesson list here. These are the channel links and the one practice question already on this page.",
  youtubeResourceTitle: "YouTube channel",
  youtubeResourceText:
    "Open the linked YouTube channel for explanations and worked examples.",
  whatsappResourceTitle: "WhatsApp channel",
  whatsappResourceText:
    "Open the linked WhatsApp channel for short updates.",
  whatsappMissingText: "A WhatsApp link has not been added yet.",
  practiceResourceTitle: "Practice question",
  practiceResourceText:
    "One question on this page: what happens to total assets when a business buys equipment for cash.",
};

/** Name used on the page when the setting above is blank. */
export function organisationLabel() {
  if (typeof siteConfig.organisationName !== "string") {
    return "Your school";
  }

  const trimmed = siteConfig.organisationName.trim();
  return trimmed || "Your school";
}

/**
 * Logo address, or "" when none is configured.
 * Only a file in public (starting with /) or an https address is used.
 */
export function logoSrc() {
  if (typeof siteConfig.logoUrl !== "string") {
    return "";
  }

  const trimmed = siteConfig.logoUrl.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}
