"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface EnvVar { key: string; value: string; }
interface Service {
  name: string;
  image: string;
  ports: string[];
  envVars: EnvVar[];
  volumes: string[];
  dependsOn: string[];
  restart: string;
  command: string;
  expanded: boolean;
}

const RESTART_POLICIES = ["no", "always", "unless-stopped", "on-failure"];

function generateYaml(services: Service[], composeVersion: string, networkName: string): string {
  const lines: string[] = [];
  lines.push(`version: '${composeVersion}'`);
  lines.push("");
  lines.push("services:");

  for (const svc of services) {
    const name = svc.name || "service";
    lines.push(`  ${name}:`);
    lines.push(`    image: ${svc.image || "nginx:latest"}`);

    if (svc.restart && svc.restart !== "no") {
      lines.push(`    restart: ${svc.restart}`);
    }

    if (svc.command) {
      lines.push(`    command: ${svc.command}`);
    }

    if (svc.ports.some(Boolean)) {
      lines.push("    ports:");
      svc.ports.filter(Boolean).forEach((p) => lines.push(`      - "${p}"`));
    }

    if (svc.envVars.some((e) => e.key)) {
      lines.push("    environment:");
      svc.envVars.filter((e) => e.key).forEach((e) => {
        lines.push(`      - ${e.key}=${e.value}`);
      });
    }

    if (svc.volumes.some(Boolean)) {
      lines.push("    volumes:");
      svc.volumes.filter(Boolean).forEach((v) => lines.push(`      - ${v}`));
    }

    if (svc.dependsOn.length > 0) {
      lines.push("    depends_on:");
      svc.dependsOn.forEach((d) => lines.push(`      - ${d}`));
    }

    if (networkName) {
      lines.push("    networks:");
      lines.push(`      - ${networkName}`);
    }
  }

  if (networkName) {
    lines.push("");
    lines.push("networks:");
    lines.push(`  ${networkName}:`);
    lines.push("    driver: bridge");
  }

  return lines.join("\n");
}

function makeService(name = ""): Service {
  return {
    name,
    image: "",
    ports: [""],
    envVars: [{ key: "", value: "" }],
    volumes: [""],
    dependsOn: [],
    restart: "unless-stopped",
    command: "",
    expanded: true,
  };
}

export function DockerComposeGeneratorTool() {
  const [services, setServices] = useState<Service[]>([makeService("app")]);
  const [composeVersion, setComposeVersion] = useState("3.8");
  const [networkName, setNetworkName] = useState("app-network");

  const yaml = generateYaml(services, composeVersion, networkName);

  const updateService = (i: number, updates: Partial<Service>) => {
    setServices((prev) => prev.map((s, idx) => idx === i ? { ...s, ...updates } : s));
  };

  const addService = () => setServices((prev) => [...prev, makeService(`service${prev.length + 1}`)]);
  const removeService = (i: number) => setServices((prev) => prev.filter((_, idx) => idx !== i));
  const toggleExpand = (i: number) => updateService(i, { expanded: !services[i].expanded });

  const updateList = (i: number, field: "ports" | "volumes", idx: number, val: string) => {
    const arr = [...services[i][field]];
    arr[idx] = val;
    updateService(i, { [field]: arr });
  };
  const addListItem = (i: number, field: "ports" | "volumes") => {
    updateService(i, { [field]: [...services[i][field], ""] });
  };
  const removeListItem = (i: number, field: "ports" | "volumes", idx: number) => {
    updateService(i, { [field]: services[i][field].filter((_, j) => j !== idx) });
  };

  const updateEnvVar = (i: number, idx: number, key: "key" | "value", val: string) => {
    const arr = [...services[i].envVars];
    arr[idx] = { ...arr[idx], [key]: val };
    updateService(i, { envVars: arr });
  };
  const addEnvVar = (i: number) => updateService(i, { envVars: [...services[i].envVars, { key: "", value: "" }] });
  const removeEnvVar = (i: number, idx: number) => updateService(i, { envVars: services[i].envVars.filter((_, j) => j !== idx) });

  const toggleDepends = (i: number, name: string) => {
    const dep = services[i].dependsOn;
    updateService(i, { dependsOn: dep.includes(name) ? dep.filter((d) => d !== name) : [...dep, name] });
  };

  const handleDownload = () => {
    const blob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "docker-compose.yml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = "w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono";
  const labelCls = "block text-xs text-text-secondary font-mono uppercase tracking-wide mb-1.5";

  return (
    <ToolLayout
      agentReady
      title="Docker Compose Generator"
      description="Build docker-compose.yml files visually. Add services, configure ports, environment variables, volumes, and networks."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Builder */}
        <div className="space-y-5">
          {/* Global */}
          <div className="bg-card-bg border border-card-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Global Options</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Compose Version</label>
                <select value={composeVersion} onChange={(e) => setComposeVersion(e.target.value)} className={inputCls}>
                  {["3.8", "3.7", "3", "2.4"].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Network Name</label>
                <input value={networkName} onChange={(e) => setNetworkName(e.target.value)} className={inputCls} placeholder="app-network" />
              </div>
            </div>
          </div>

          {/* Services */}
          {services.map((svc, i) => (
            <div key={i} className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-surface-subtle transition-colors"
                onClick={() => toggleExpand(i)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🐳</span>
                  <span className="text-sm font-semibold text-text-primary">{svc.name || `service${i + 1}`}</span>
                  {svc.image && <span className="text-xs text-text-muted font-mono">({svc.image})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); removeService(i); }} className="p-1 text-text-muted hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                  {svc.expanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
                </div>
              </div>

              {svc.expanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-border-subtle pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Service Name</label>
                      <input value={svc.name} onChange={(e) => updateService(i, { name: e.target.value })} className={inputCls} placeholder="app" />
                    </div>
                    <div>
                      <label className={labelCls}>Image</label>
                      <input value={svc.image} onChange={(e) => updateService(i, { image: e.target.value })} className={inputCls} placeholder="nginx:latest" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Restart Policy</label>
                      <select value={svc.restart} onChange={(e) => updateService(i, { restart: e.target.value })} className={inputCls}>
                        {RESTART_POLICIES.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Command (optional)</label>
                      <input value={svc.command} onChange={(e) => updateService(i, { command: e.target.value })} className={inputCls} placeholder="npm start" />
                    </div>
                  </div>

                  {/* Ports */}
                  <div>
                    <label className={labelCls}>Ports</label>
                    <div className="space-y-2">
                      {svc.ports.map((p, pi) => (
                        <div key={pi} className="flex gap-2">
                          <input value={p} onChange={(e) => updateList(i, "ports", pi, e.target.value)} className={inputCls} placeholder="8080:80" />
                          <button onClick={() => removeListItem(i, "ports", pi)} className="p-2 text-text-muted hover:text-red-400 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addListItem(i, "ports")} className="flex items-center gap-1 text-xs text-accent hover:underline">
                        <Plus size={12} /> Add Port
                      </button>
                    </div>
                  </div>

                  {/* Env Vars */}
                  <div>
                    <label className={labelCls}>Environment Variables</label>
                    <div className="space-y-2">
                      {svc.envVars.map((e, ei) => (
                        <div key={ei} className="flex gap-2">
                          <input value={e.key} onChange={(ev) => updateEnvVar(i, ei, "key", ev.target.value)} className={inputCls} placeholder="KEY" />
                          <input value={e.value} onChange={(ev) => updateEnvVar(i, ei, "value", ev.target.value)} className={inputCls} placeholder="value" />
                          <button onClick={() => removeEnvVar(i, ei)} className="p-2 text-text-muted hover:text-red-400 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addEnvVar(i)} className="flex items-center gap-1 text-xs text-accent hover:underline">
                        <Plus size={12} /> Add Variable
                      </button>
                    </div>
                  </div>

                  {/* Volumes */}
                  <div>
                    <label className={labelCls}>Volumes</label>
                    <div className="space-y-2">
                      {svc.volumes.map((v, vi) => (
                        <div key={vi} className="flex gap-2">
                          <input value={v} onChange={(e) => updateList(i, "volumes", vi, e.target.value)} className={inputCls} placeholder="./data:/data" />
                          <button onClick={() => removeListItem(i, "volumes", vi)} className="p-2 text-text-muted hover:text-red-400 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addListItem(i, "volumes")} className="flex items-center gap-1 text-xs text-accent hover:underline">
                        <Plus size={12} /> Add Volume
                      </button>
                    </div>
                  </div>

                  {/* Depends On */}
                  {services.length > 1 && (
                    <div>
                      <label className={labelCls}>Depends On</label>
                      <div className="flex flex-wrap gap-2">
                        {services.filter((_, j) => j !== i).map((s) => (
                          <button
                            key={s.name}
                            onClick={() => toggleDepends(i, s.name)}
                            className={`px-2.5 py-1 text-xs rounded-full border transition-colors font-mono ${
                              svc.dependsOn.includes(s.name)
                                ? "bg-accent text-white border-accent"
                                : "border-border-subtle text-text-muted hover:border-accent"
                            }`}
                          >
                            {s.name || `service${services.indexOf(s) + 1}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <button onClick={addService} className="action-btn w-full flex items-center justify-center gap-2">
            <Plus size={14} /> Add Service
          </button>
        </div>

        {/* Output */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">docker-compose.yml</h2>
            <div className="flex gap-2">
              <CopyButton text={yaml} label="Copy YAML" />
              <button onClick={handleDownload} className="action-btn text-xs">
                Download
              </button>
            </div>
          </div>
          <div className="bg-[#1a1a2e] border border-card-border rounded-xl p-4 flex-1 overflow-auto">
            <pre className="text-xs font-mono text-blue-300 whitespace-pre-wrap leading-relaxed">{yaml}</pre>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
