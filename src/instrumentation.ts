/** Prepares default categories and starter content in the background as soon as the server boots. */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NEXT_PHASE === "phase-production-build") return;
  const { ensureBootstrapped } = await import("@/lib/wallpapers/bootstrap");
  void ensureBootstrapped().catch((error: unknown) => {
    console.error("[bootstrap] Could not prepare initial content:", error instanceof Error ? error.message : error);
  });
}
