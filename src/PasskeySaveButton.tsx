import { useState } from "react";
import { exportLocalFirstSecret } from "jazz-tools";
import { useJazzAuth } from "jazz-tools/react";
import { BrowserPasskeyBackup } from "jazz-tools/passkey-backup";

const passkeyBackup = new BrowserPasskeyBackup({
  appName: "Mon Application",
  appHostname: window.location.hostname,
});

export function PasskeySaveButton() {
  // On récupère directement "account" depuis useJazzAuth():
  const { account } = useJazzAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSavePasskey = async () => {
    if (!account) {
      setError("Aucun compte local-first actif à sauvegarder.");
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      // 1. Extrait le secret cryptographique depuis le handle "account":
      const secret = exportLocalFirstSecret(account);

      console.log("Exported secret:", secret);

      // 2. Ouvre la fenêtre biométrique / clé de sécurité pour enregistrer la Passkey:
      await passkeyBackup.backup(secret, "Mon compte Jazz");

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la sauvegarde Passkey");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleSavePasskey} disabled={loading || !account}>
        {loading ? "Enregistrement..." : "Sauvegarder une Passkey"}
      </button>
      {saved && <p>Passkey enregistrée avec succès !</p>}
      {error && <p>{error}</p>}
    </div>
  );
}
