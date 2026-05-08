import { useState, useEffect } from "react";
import { PROVIDERS, DEFAULT_PROVIDER } from "../modules/providers";
import { getEnabledProviders } from "../modules/registry";
import {
  GeminiLogo,
  OpenRouterLogo,
  OllamaLogo,
  OpenCodeLogo,
  Check,
  Close,
  Warning,
  Lock,
} from "./Icons";

function getProviderIcon(id, className) {
  switch (id) {
    case "gemini":
      return <GeminiLogo size={26} className={className} />;
    case "openrouter":
      return <OpenRouterLogo size={26} className={className} />;
    case "ollama":
      return <OllamaLogo size={26} className={className} />;
    case "opencode":
      return <OpenCodeLogo size={26} className={className} />;
    default:
      return null;
  }
}

const PROVIDER_STYLES = {
  gemini: {
    color: "border-blue-600/50 hover:border-blue-500",
    bgColor: "bg-blue-500/10",
    iconColor: "text-[#4285F4]",
  },
  openrouter: {
    color: "border-indigo-700/50 hover:border-indigo-500",
    bgColor: "bg-indigo-500/10",
    iconColor: "text-[#6467F2]",
  },
  ollama: {
    color: "border-purple-700/50 hover:border-purple-500",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-400",
  },
  opencode: {
    color: "border-cyan-700/50 hover:border-cyan-500",
    bgColor: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
  },
};

export default function ApiKeyModal({ config, onSave, onClose }) {
  const [enabledProviderIds, setEnabledProviderIds] =
    useState(getEnabledProviders);

  const displayProviders = PROVIDERS.filter((p) =>
    enabledProviderIds.includes(p.id),
  ).map((p) => ({
    ...p,
    ...PROVIDER_STYLES[p.id],
    icon: getProviderIcon(p.id, PROVIDER_STYLES[p.id]?.iconColor),
  }));

  const defaultProvider =
    displayProviders.find((p) => p.id === config.apiType)?.id ||
    displayProviders[0]?.id ||
    DEFAULT_PROVIDER;
  const [selectedId, setSelectedId] = useState(defaultProvider);
  const [key, setKey] = useState(config.key);
  const [customUrl, setCustomUrl] = useState(
    displayProviders.some((p) => p.defaultUrl === config.baseUrl)
      ? ""
      : config.baseUrl,
  );
  const [customModel, setCustomModel] = useState(
    displayProviders.some((p) => p.defaultModel === config.model)
      ? ""
      : config.model,
  );

  const activeProvider = displayProviders.find((p) => p.id === selectedId);

  const handleSelectProvider = (provider) => {
    setSelectedId(provider.id);
    setCustomUrl("");
    setCustomModel("");
  };

  const handleSave = () => {
    const provider = activeProvider;
    if (!provider) return;
    onSave({
      key: provider.needsKey ? key : "",
      baseUrl: customUrl || provider.defaultUrl,
      model: customModel || provider.defaultModel,
      apiType: provider.id,
    });
  };

  const canSave =
    !activeProvider?.needsKey ||
    (activeProvider?.needsKey && key.trim().length > 0);

  // Re-check enabled providers on mount and when settings change
  useEffect(() => {
    const enabled = getEnabledProviders();
    setEnabledProviderIds(enabled);
  }, []);

  // If no providers are enabled, show a message
  if (displayProviders.length === 0) {
    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 font-sans"
        onClick={onClose}
      >
        <div
          className="bg-s1 border border-borderc rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex justify-center">
            <Warning size={32} />
          </div>
          <h3 className="text-base font-semibold text-text mb-2">
            Keine KI-Anbieter aktiv
          </h3>
          <p className="text-sm text-t2 mb-4">
            Gehe zu den Einstellungen und aktiviere mindestens einen
            KI-Anbieter.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent/90"
          >
            Schließen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 font-sans"
      onClick={onClose}
    >
      <div
        className="bg-s1 border border-borderc rounded-xl shadow-2xl w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-borderc">
          <h3 className="text-base font-semibold text-text">
            KI-Anbieter wählen
          </h3>
          <button
            onClick={onClose}
            className="text-t2 hover:text-text p-0.5"
            aria-label="Schließen"
          >
            <Close size={18} />
          </button>
        </div>

        {/* Provider grid */}
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-5">
            {displayProviders.map((p) => {
              const isActive = selectedId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProvider(p)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border-2 text-left
                    ${
                      isActive
                        ? "bg-s2 border-accent"
                        : `bg-s3 border-borderc hover:bg-s2 ${p.color}`
                    }`}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-s1">
                    {p.icon}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-text">
                      {p.name}
                    </div>
                    <div className="text-xs text-t2 mt-0.5">
                      {p.needsKey ? "API-Key nötig" : "Kein Key nötig"}
                    </div>
                  </div>
                  {isActive && (
                    <span className="ml-auto text-accent">
                      <Check size={18} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* API-Key field (only for providers that need it) */}
          {activeProvider?.needsKey && (
            <div className="mb-4">
              <label className="block text-xs text-text mb-1.5 font-medium">
                API-Key
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={`${activeProvider.name} API-Key`}
                className="w-full bg-s3 text-text text-sm rounded-lg px-3.5 py-2.5 border border-border2 focus:border-accent focus:outline-none font-mono placeholder:text-t3"
                autoFocus
              />
              {activeProvider.hint && (
                <p className="text-xs text-t3 mt-1.5">{activeProvider.hint}</p>
              )}
              <p className="text-xs text-t3 mt-1.5 flex items-center gap-1">
                <Lock size={13} /> Dein API-Key wird nur lokal im Browser
                gespeichert.
              </p>
            </div>
          )}

          {/* Local provider hints */}
          {activeProvider?.id === "opencode" && (
            <div className="mb-4 p-3 rounded-lg bg-s3 border border-borderc text-xs text-t2">
              <p className="mb-1">Starte den OpenCode-Server:</p>
              <code className="text-accent block font-mono">
                opencode serve --port 4096
              </code>
              <p className="mt-1.5 text-t3">
                Kein API-Key erforderlich – die Anfragen laufen lokal.
              </p>
            </div>
          )}
          {activeProvider?.id === "ollama" && (
            <div className="mb-4 p-3 rounded-lg bg-s3 border border-borderc text-xs text-t2">
              <p className="mb-1">Starte Ollama lokal:</p>
              <code className="text-accent block font-mono">ollama serve</code>
              <p className="mt-1.5 text-t3">
                Kein API-Key erforderlich – läuft lokal auf deinem Rechner.
              </p>
            </div>
          )}

          {/* Advanced: URL & Model override */}
          <details className="text-xs text-t3 group mb-4">
            <summary className="cursor-pointer hover:text-text select-none">
              Erweiterte Einstellungen
            </summary>
            <div className="mt-3 space-y-3 pl-2 border-l-2 border-borderc">
              <div>
                <label className="block text-xs text-t2 mb-1">
                  Base URL überschreiben
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder={activeProvider?.defaultUrl || "https://..."}
                  className="w-full bg-s3 text-text text-xs rounded px-3 py-2 border border-border2 focus:border-accent focus:outline-none font-mono placeholder:text-t3"
                />
              </div>
              {activeProvider?.needsModel !== false && (
                <div>
                  <label className="block text-xs text-t2 mb-1">
                    Model überschreiben
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder={activeProvider?.defaultModel || "gpt-4o-mini"}
                    className="w-full bg-s3 text-text text-xs rounded px-3 py-2 border border-border2 focus:border-accent focus:outline-none font-mono placeholder:text-t3"
                  />
                </div>
              )}
            </div>
          </details>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-t2 hover:text-text hover:bg-s3 rounded-lg"
            >
              Abbrechen
            </button>
            <div className="flex-1" />
            {activeProvider?.needsKey && (
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={`px-5 py-2 text-sm font-medium rounded-lg ${
                  canSave
                    ? "bg-accent text-white hover:bg-accent/90"
                    : "bg-s3 text-t3 cursor-not-allowed"
                }`}
              >
                Speichern
              </button>
            )}
            {!activeProvider?.needsKey && (
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-green-dim text-green hover:bg-green-dim inline-flex items-center gap-1.5"
              >
                <Check size={14} /> Bereit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
