import config from "../../site-config.json";
export function OperatorDetails() {
  if (!config.operatorName || !config.postalAddress || !config.contactEmail)
    return (
      <div className="notice warning">
        <p>
          Vorschau: Die bestätigten Angaben zu Betreiber, Postadresse und
          Kontakt-E-Mail fehlen noch. Diese Version ist für die Prüfung
          vorgesehen; die Veröffentlichung ist bis zur Ergänzung gesperrt.
        </p>
      </div>
    );
  return (
    <address>
      {config.operatorName}
      <br />
      {config.postalAddress}
      <br />
      <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>
      {config.uid && (
        <>
          <br />
          UID: {config.uid}
        </>
      )}
    </address>
  );
}
