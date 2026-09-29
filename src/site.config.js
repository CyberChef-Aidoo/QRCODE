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
   * Do not add campaign parameters here. Those belong on the QR landing address.
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
    "Clear explanations, worked examples, and exam support for accounting students.",

  youtubeTitle: "YouTube channel",
  youtubeLabel: "Watch lessons on YouTube",
  youtubeCaption: "Clear explanations and worked examples.",

  whatsappTitle: "WhatsApp channel",
  whatsappLabel: "Get updates on WhatsApp",
  whatsappCaption: "Short updates for accounting students.",

  sharedNote:
    "These buttons open the channel in a new tab. On YouTube, tap Subscribe yourself. On WhatsApp, tap Follow yourself.",

  aboutHeading: "About Duahbed Consult",
  aboutText:
    "Duahbed Consult helps accounting students with clear explanations, worked examples, and exam support. Success is always assured.",

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
  quizSelectedLabel: "Selected",
  quizCorrectLabel: "Correct",
  quizIncorrectLabel: "Incorrect",
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
