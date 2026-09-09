// No user input is read, logged or forwarded. Suggestions run in the browser.
export function POST() {
  return Response.json(
    { error: "Textvorschläge werden lokal im Browser erstellt." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
