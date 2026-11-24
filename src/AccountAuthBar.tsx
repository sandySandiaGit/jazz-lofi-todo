import { useState, useMemo } from "react";
import { exportLocalFirstSecret } from "jazz-tools";
import { useJazzAuth } from "jazz-tools/react";
import { BrowserPasskeyBackup } from "jazz-tools/passkey-backup";
import { RecoveryPhrase } from "jazz-tools/passphrase";

export function AccountAuthBar() {
  const { account, sessionActions } = useJazzAuth();

  const passkeyBackup = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new BrowserPasskeyBackup({
      appName: "Jazz Local-First Demo",
      appHostname: window.location.hostname,
    });
  }, []);

  // Locally tracks whether this user has already backed up or restored their account:
  const [isBackedUp, setIsBackedUp] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("jazz_account_secured") === "true";
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedPhrase, setGeneratedPhrase] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inputPhrase, setInputPhrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const markAsSecured = () => {
    localStorage.setItem("jazz_account_secured", "true");
    setIsBackedUp(true);
  };

  // 1. Save the current account into a Passkey (first visit):
  const handleSavePasskey = async () => {
    if (!account || !passkeyBackup) return;
    setLoading(true);
    setFeedback(null);
    try {
      const secret = exportLocalFirstSecret(account);
      await passkeyBackup.backup(secret, "My Jazz Account");
      markAsSecured();
      setFeedback({ type: "ok", text: "Account saved with your Passkey!" });
    } catch (err) {
      setFeedback({
        type: "err",
        text: err instanceof Error ? err.message : "Cancelled or unable to create Passkey.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Restore an existing account via Passkey (fresh browser):
  const handleRestorePasskey = async () => {
    if (!sessionActions || !passkeyBackup) return;
    setLoading(true);
    setFeedback(null);
    try {
      const secret = await passkeyBackup.restore();
      await sessionActions.restoreLocalFirst(secret);
      markAsSecured();
      setFeedback({ type: "ok", text: "Account restored!" });
    } catch (err) {
      setFeedback({
        type: "err",
        text: err instanceof Error ? err.message : "No Passkey found or restoration cancelled.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. Generate the recovery phrase:
  const handleShowPhrase = () => {
    if (!account) return;
    const secret = exportLocalFirstSecret(account);
    setGeneratedPhrase(RecoveryPhrase.fromSecret(secret));
    setCopied(false);
  };

  // Copy recovery phrase to clipboard:
  const handleCopyPhrase = async () => {
    if (!generatedPhrase) return;
    await navigator.clipboard.writeText(generatedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 4. Restore via recovery phrase:
  const handleRestorePhrase = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sessionActions || !inputPhrase.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const secret = RecoveryPhrase.toSecret(inputPhrase.trim());
      await sessionActions.restoreLocalFirst(secret);
      markAsSecured();
      setInputPhrase("");
      setFeedback({ type: "ok", text: "Account restored via recovery phrase!" });
    } catch {
      setFeedback({ type: "err", text: "Invalid phrase. Please check the words entered." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm sm:p-3">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {!isBackedUp ? (
          <>
            <button
              type="button"
              onClick={handleSavePasskey}
              disabled={loading || !account}
              className="cursor-pointer rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
            >
              {loading ? "..." : "Save access (Passkey)"}
            </button>

            <button
              type="button"
              onClick={handleRestorePasskey}
              disabled={loading || !sessionActions}
              className="cursor-pointer rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
            >
              I already have a Passkey
            </button>
          </>
        ) : (
          <span className="text-xs font-medium text-green-600 sm:text-sm">
            ✓ Account secured with Passkey
          </span>
        )}

        {!showAdvanced && (
          <button
            type="button"
            // React functional update:
            onClick={() => setShowAdvanced((value) => !value)}
            //OR: onClick={() => setShowAdvanced(true)}
            className="cursor-pointer rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
          >
            Recovery phrase / Options
          </button>
        )}

        {feedback && (
          <p
            className={`w-full text-xs font-medium ${feedback.type === "ok" ? "text-green-600" : "text-pink-600"
              }`}
          >
            {feedback.text}
          </p>
        )}
      </div>

      {/* Collapsible panel for RecoveryPhrase and account switching: */}
      {showAdvanced && (
        <div className="mt-3 space-y-3 border-t border-slate-200 pt-3 sm:mt-4">
          {/* Panel header with close button: */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Backup & Recovery Options
            </span>
            <button
              type="button"
              onClick={() => {
                setShowAdvanced(false);
                setGeneratedPhrase(null);
              }}
              aria-label="Close backup options"
              className="cursor-pointer rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={handleShowPhrase}
              disabled={!account}
              className="cursor-pointer rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-1.5"
            >
              Show my recovery phrase
            </button>

            {generatedPhrase && (
              <div className="mt-2 flex items-start justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 p-2 sm:p-2.5">
                <pre className="flex-1 whitespace-pre-wrap break-all font-mono text-[11px] text-slate-800 sm:text-xs">
                  {generatedPhrase}
                </pre>
                <button
                  type="button"
                  onClick={handleCopyPhrase}
                  className="shrink-0 cursor-pointer rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 transition hover:bg-slate-100 sm:text-xs"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleRestorePhrase} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={inputPhrase}
              onChange={(e) => setInputPhrase(e.target.value)}
              placeholder="Paste a recovery phrase..."
              className="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 sm:px-3 sm:text-sm"
            />
            <button
              type="submit"
              disabled={loading || !sessionActions || !inputPhrase.trim()}
              className="cursor-pointer rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-sm"
            >
              Restore
            </button>
          </form>

          {isBackedUp && (
            <div className="flex flex-wrap gap-1.5 pt-1 sm:gap-2">
              <button
                type="button"
                onClick={handleSavePasskey}
                disabled={loading}
                className="cursor-pointer rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:px-3 sm:py-1.5"
              >
                Add another Passkey
              </button>
              <button
                type="button"
                onClick={handleRestorePasskey}
                disabled={loading}
                className="cursor-pointer rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:px-3 sm:py-1.5"
              >
                Load another account
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
