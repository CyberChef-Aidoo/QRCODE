function cell(value) {
  if (value == null) {
    return "";
  }
  const text = /^[=+\-@]/.test(String(value)) ? `'${value}` : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function row(values) {
  return values.map(cell).join(",");
}

function rateCell(rate) {
  return typeof rate === "number" ? rate : "";
}

/**
 * CSV of one authorised report.
 * Daily clicked-user cells are listed separately and are not a period total.
 */
export function buildAudienceCsv(report) {
  const lines = [
    row([
      "note",
      "Clicked users are not subscriptions. Do not add daily clicked users to get the period total.",
    ]),
    row([
      "section",
      "date",
      "reporting_timezone",
      "campaign",
      "youtube_clicked_users",
      "youtube_clicks",
      "whatsapp_clicked_users",
      "whatsapp_clicks",
      "youtube_share_of_tagged_visits",
      "whatsapp_share_of_tagged_visits",
    ]),
    row([
      "period",
      `${report.range.from} to ${report.range.to}`,
      report.timeZone,
      report.campaign,
      report.channels.youtube.users,
      report.channels.youtube.clicks,
      report.channels.whatsapp.users,
      report.channels.whatsapp.clicks,
      rateCell(report.channels.youtube.rate),
      rateCell(report.channels.whatsapp.rate),
    ]),
  ];

  if (report.channels.youtube.previous && report.channels.whatsapp.previous) {
    lines.push(
      row([
        "previous_period",
        "",
        report.timeZone,
        report.campaign,
        report.channels.youtube.previous.users,
        report.channels.youtube.previous.clicks,
        report.channels.whatsapp.previous.users,
        report.channels.whatsapp.previous.clicks,
        "",
        "",
      ]),
    );
  }

  for (const day of report.trend ?? []) {
    lines.push(
      row([
        "day",
        day.date,
        report.timeZone,
        report.campaign,
        day.youtubeUsers,
        day.youtubeClicks,
        day.whatsappUsers,
        day.whatsappClicks,
        "",
        "",
      ]),
    );
  }

  return `${lines.join("\n")}\n`;
}
