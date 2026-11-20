import { useState } from "react";
import { exportLocalFirstSecret } from "jazz-tools";
import { useJazzAuth } from "jazz-tools/react";
import { RecoveryPhrase } from "jazz-tools/passphrase";

export function RecoveryPhraseManager() {
  const { account, sessionActions } = useJazzAuth();
  const [generatedPhrase, setGeneratedPhrase] = useState<string | null>(null);
  const [inputPhrase, setInputPhrase] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 1. Générer et afficher la phrase de récupération du compte actuel:
  const handleGeneratePhrase = () => {
    if (!account) return;
    setError(null);

    const secret = exportLocalFirstSecret(account);
    const phrase = RecoveryPhrase.fromSecret(secret);
    setGeneratedPhrase(phrase);
  };

  // 2. Restaurer le compte sur un navigateur vierge à partir de la phrase:
  const handleRestorePhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionActions || !inputPhrase.trim()) return;
    setError(null);

    try {
      const recoveredSecret = RecoveryPhrase.toSecret(inputPhrase.trim());
      await sessionActions.restoreLocalFirst(recoveredSecret);
      setInputPhrase("");
    } catch (err) {
      setError("Phrase de récupération invalide. Vérifiez l'orthographe et l'ordre des mots.");
    }
  };

  return (
    <div>
      {/* Section Sauvegarde */}
      <div>
        <button onClick={handleGeneratePhrase} disabled={!account}>
          Afficher ma phrase de récupération
        </button>
        {generatedPhrase && (
          <div>
            <p>Notez ces mots précieusement (quiconque les possède a accès à votre compte) :</p>
            <pre>{generatedPhrase}</pre>
          </div>
        )}
      </div>

      {/* Section Restauration */}
      <form onSubmit={handleRestorePhrase}>
        <input
          type="text"
          value={inputPhrase}
          onChange={(e) => setInputPhrase(e.target.value)}
          placeholder="Collez ou saisissez votre phrase de récupération..."
        />
        <button type="submit" disabled={!sessionActions}>
          Restaurer le compte
        </button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
}
