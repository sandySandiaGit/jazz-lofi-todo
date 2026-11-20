import { useState } from "react";
import { useJazzAuth } from "jazz-tools/react";
import { BrowserPasskeyBackup } from "jazz-tools/passkey-backup";

const passkeyBackup = new BrowserPasskeyBackup({
  appName: "Mon Application",
  appHostname: window.location.hostname,
});

export function PasskeyRestoreButton() {
  // Les actions de cycle de vie sont dans sessionActions
  const { sessionActions } = useJazzAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRestoreWithPasskey = async () => {
    if (!sessionActions) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Ouvre la fenêtre biométrique / Passkey et extrait le secret:
      const recoveredSecret = await passkeyBackup.restore();

      console.log("Recovered secret:", recoveredSecret);

      // 2. Restaure le compte local-first:
      await sessionActions.restoreLocalFirst(recoveredSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la restauration Passkey");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleRestoreWithPasskey} disabled={loading || !sessionActions}>
        {loading ? "Connexion..." : "Passkey"}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}


