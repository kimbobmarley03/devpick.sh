"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";

interface LicenseInfo {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  conditions: string[];
  limitations: string[];
  getText: (year: string, author: string) => string;
}

const LICENSES: LicenseInfo[] = [
  {
    id: "mit",
    name: "MIT",
    description: "A short and simple permissive license with conditions only requiring preservation of copyright and license notices.",
    permissions: ["Commercial use", "Distribution", "Modification", "Private use"],
    conditions: ["License and copyright notice"],
    limitations: ["Liability", "Warranty"],
    getText: (year, author) => `MIT License

Copyright (c) ${year} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    id: "apache-2",
    name: "Apache 2.0",
    description: "A permissive license whose main conditions require preservation of copyright and license notices. Contributors provide an express grant of patent rights.",
    permissions: ["Commercial use", "Distribution", "Modification", "Patent use", "Private use"],
    conditions: ["License and copyright notice", "State changes"],
    limitations: ["Liability", "Trademark use", "Warranty"],
    getText: (year, author) => `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright ${year} ${author}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`,
  },
  {
    id: "gpl-3",
    name: "GPL 3.0",
    description: "Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications.",
    permissions: ["Commercial use", "Distribution", "Modification", "Patent use", "Private use"],
    conditions: ["Disclose source", "License and copyright notice", "Same license", "State changes"],
    limitations: ["Liability", "Warranty"],
    getText: (year, author) => `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) ${year} ${author}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.`,
  },
  {
    id: "gpl-2",
    name: "GPL 2.0",
    description: "The GNU GPL is the most widely used free software license and has a strong copyleft requirement. Version 2 of the license.",
    permissions: ["Commercial use", "Distribution", "Modification", "Private use"],
    conditions: ["Disclose source", "License and copyright notice", "Same license"],
    limitations: ["Liability", "Warranty"],
    getText: (year, author) => `GNU GENERAL PUBLIC LICENSE
Version 2, June 1991

Copyright (C) ${year} ${author}

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.`,
  },
  {
    id: "bsd-2",
    name: "BSD 2-Clause",
    description: "A permissive license that comes in two variants. This is the simpler one, also known as the Simplified BSD License or the FreeBSD License.",
    permissions: ["Commercial use", "Distribution", "Modification", "Private use"],
    conditions: ["License and copyright notice"],
    limitations: ["Liability", "Warranty"],
    getText: (year, author) => `BSD 2-Clause License

Copyright (c) ${year}, ${author}
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`,
  },
  {
    id: "bsd-3",
    name: "BSD 3-Clause",
    description: "A permissive license similar to BSD 2-Clause, but with a 3rd clause that prohibits others from using the name of the project or its contributors.",
    permissions: ["Commercial use", "Distribution", "Modification", "Private use"],
    conditions: ["License and copyright notice"],
    limitations: ["Liability", "Warranty"],
    getText: (year, author) => `BSD 3-Clause License

Copyright (c) ${year}, ${author}
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors
   may be used to endorse or promote products derived from this software
   without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`,
  },
  {
    id: "isc",
    name: "ISC",
    description: "A permissive license lets people do anything with your code with proper attribution and without warranty. The ISC license is functionally equivalent to the BSD 2-Clause license.",
    permissions: ["Commercial use", "Distribution", "Modification", "Private use"],
    conditions: ["License and copyright notice"],
    limitations: ["Liability", "Warranty"],
    getText: (year, author) => `ISC License

Copyright (c) ${year} ${author}

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.`,
  },
  {
    id: "unlicense",
    name: "Unlicense",
    description: "A license with no conditions whatsoever which dedicates works to the public domain. Unlicensed works, modifications, and larger works may be distributed under different terms.",
    permissions: ["Commercial use", "Distribution", "Modification", "Private use"],
    conditions: [],
    limitations: ["Liability", "Warranty"],
    getText: (_year, _author) => `This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>`,
  },
  {
    id: "mpl-2",
    name: "MPL 2.0",
    description: "Permissions of this weak copyleft license are conditioned on making available source code of licensed files and modifications.",
    permissions: ["Commercial use", "Distribution", "Modification", "Patent use", "Private use"],
    conditions: ["Disclose source", "License and copyright notice", "Same license (file)"],
    limitations: ["Liability", "Trademark use", "Warranty"],
    getText: (year, author) => `Mozilla Public License Version 2.0

Copyright (c) ${year} ${author}

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.`,
  },
  {
    id: "lgpl-3",
    name: "LGPL 3.0",
    description: "Permissions of this copyleft license are conditioned on making available complete source code of licensed works and modifications under the same license.",
    permissions: ["Commercial use", "Distribution", "Modification", "Patent use", "Private use"],
    conditions: ["Disclose source", "License and copyright notice", "Same license (library)"],
    limitations: ["Liability", "Warranty"],
    getText: (year, author) => `GNU LESSER GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) ${year} ${author}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.`,
  },
  {
    id: "agpl-3",
    name: "AGPL 3.0",
    description: "Permissions of this strongest copyleft license are conditioned on making available complete source code of licensed works and modifications, including larger works using a licensed work.",
    permissions: ["Commercial use", "Distribution", "Modification", "Patent use", "Private use"],
    conditions: ["Disclose source", "License and copyright notice", "Network use is distribution", "Same license", "State changes"],
    limitations: ["Liability", "Warranty"],
    getText: (year, author) => `GNU AFFERO GENERAL PUBLIC LICENSE
Version 3, 19 November 2007

Copyright (C) ${year} ${author}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.`,
  },
  {
    id: "cc-by",
    name: "CC BY 4.0",
    description: "Creative Commons Attribution license. Others can distribute, remix, adapt, and build upon your work, even commercially, as long as they credit you.",
    permissions: ["Commercial use", "Distribution", "Modification", "Private use"],
    conditions: ["License and copyright notice", "State changes"],
    limitations: ["Liability", "Trademark use", "Warranty"],
    getText: (year, author) => `Creative Commons Attribution 4.0 International

Copyright (c) ${year} ${author}

This work is licensed under the Creative Commons Attribution 4.0
International License. To view a copy of this license, visit
http://creativecommons.org/licenses/by/4.0/ or send a letter to
Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.`,
  },
  {
    id: "cc-by-sa",
    name: "CC BY-SA 4.0",
    description: "Creative Commons Attribution-ShareAlike license. Allows remixing and building upon your work, even commercially, but with the same license applied.",
    permissions: ["Commercial use", "Distribution", "Modification", "Private use"],
    conditions: ["License and copyright notice", "Same license", "State changes"],
    limitations: ["Liability", "Trademark use", "Warranty"],
    getText: (year, author) => `Creative Commons Attribution-ShareAlike 4.0 International

Copyright (c) ${year} ${author}

This work is licensed under the Creative Commons Attribution-ShareAlike 4.0
International License. To view a copy of this license, visit
http://creativecommons.org/licenses/by-sa/4.0/`,
  },
  {
    id: "cc-by-nc",
    name: "CC BY-NC 4.0",
    description: "Creative Commons Attribution-NonCommercial license. Allows remixing and adapting for non-commercial purposes only.",
    permissions: ["Distribution", "Modification", "Private use"],
    conditions: ["License and copyright notice", "State changes"],
    limitations: ["Commercial use", "Liability", "Trademark use", "Warranty"],
    getText: (year, author) => `Creative Commons Attribution-NonCommercial 4.0 International

Copyright (c) ${year} ${author}

This work is licensed under the Creative Commons Attribution-NonCommercial 4.0
International License. To view a copy of this license, visit
http://creativecommons.org/licenses/by-nc/4.0/`,
  },
];

const COMPARISON = [
  { feature: "Commercial Use", mit: "✅", apache: "✅", gpl3: "✅", bsd: "✅", unlicense: "✅" },
  { feature: "Modification", mit: "✅", apache: "✅", gpl3: "✅", bsd: "✅", unlicense: "✅" },
  { feature: "Distribution", mit: "✅", apache: "✅", gpl3: "✅", bsd: "✅", unlicense: "✅" },
  { feature: "Patent Use", mit: "❌", apache: "✅", gpl3: "✅", bsd: "❌", unlicense: "❌" },
  { feature: "Private Use", mit: "✅", apache: "✅", gpl3: "✅", bsd: "✅", unlicense: "✅" },
  { feature: "Copyleft", mit: "❌", apache: "❌", gpl3: "✅", bsd: "❌", unlicense: "❌" },
  { feature: "Disclose Source", mit: "❌", apache: "❌", gpl3: "✅", bsd: "❌", unlicense: "❌" },
  { feature: "Credit Required", mit: "✅", apache: "✅", gpl3: "✅", bsd: "✅", unlicense: "❌" },
];

export function LicenseGeneratorTool() {
  const [selectedId, setSelectedId] = useState("mit");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [author, setAuthor] = useState("");

  const license = LICENSES.find((l) => l.id === selectedId) || LICENSES[0];
  const licenseText = license.getText(year, author || "Your Name");

  const handleDownload = () => {
    const blob = new Blob([licenseText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "LICENSE";
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = "w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono";
  const labelCls = "block text-xs text-text-secondary font-mono uppercase tracking-wide mb-1.5";

  const badgeColor = (type: "permission" | "condition" | "limitation") => ({
    permission: "bg-green-500/10 text-green-400 border-green-500/20",
    condition: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    limitation: "bg-red-500/10 text-red-400 border-red-500/20",
  }[type]);

  return (
    <ToolLayout
      agentReady
      title="License Generator"
      description="Choose an open source license, enter your details, and get the full license text ready to use."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* License Picker */}
        <div className="space-y-5">
          <div className="bg-card-bg border border-card-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Your Info</h2>
            <div>
              <label className={labelCls}>Year</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Copyright Holder</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Your Name" className={inputCls} />
            </div>
          </div>

          <div className="bg-card-bg border border-card-border rounded-xl p-5 space-y-2">
            <h2 className="text-sm font-semibold text-text-primary mb-3">License</h2>
            {LICENSES.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedId === l.id
                    ? "bg-accent/10 text-accent border border-accent/30"
                    : "text-text-secondary hover:bg-surface-subtle border border-transparent"
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* Details + Output */}
        <div className="lg:col-span-2 space-y-5">
          {/* Info card */}
          <div className="bg-card-bg border border-card-border rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-text-primary">{license.name}</h2>
            <p className="text-sm text-text-secondary leading-relaxed">{license.description}</p>
            <div className="flex flex-wrap gap-4">
              {license.permissions.length > 0 && (
                <div>
                  <div className="text-xs text-text-muted mb-1.5">Permissions</div>
                  <div className="flex flex-wrap gap-1.5">
                    {license.permissions.map((p) => (
                      <span key={p} className={`text-xs px-2 py-0.5 rounded border ${badgeColor("permission")}`}>{p}</span>
                    ))}
                  </div>
                </div>
              )}
              {license.conditions.length > 0 && (
                <div>
                  <div className="text-xs text-text-muted mb-1.5">Conditions</div>
                  <div className="flex flex-wrap gap-1.5">
                    {license.conditions.map((c) => (
                      <span key={c} className={`text-xs px-2 py-0.5 rounded border ${badgeColor("condition")}`}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {license.limitations.length > 0 && (
                <div>
                  <div className="text-xs text-text-muted mb-1.5">Limitations</div>
                  <div className="flex flex-wrap gap-1.5">
                    {license.limitations.map((l) => (
                      <span key={l} className={`text-xs px-2 py-0.5 rounded border ${badgeColor("limitation")}`}>{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* License text */}
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">License Text</h2>
              <div className="flex gap-2">
                <CopyButton text={licenseText} label="Copy" />
                <button onClick={handleDownload} className="action-btn text-xs">Download LICENSE</button>
              </div>
            </div>
            <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed bg-surface-subtle rounded-lg p-4 max-h-64 overflow-y-auto">{licenseText}</pre>
          </div>

          {/* Comparison table */}
          <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border-subtle">
              <h2 className="text-sm font-semibold text-text-primary">License Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-subtle">
                    <th className="text-left px-4 py-2.5 text-text-muted font-mono">Feature</th>
                    {["MIT", "Apache 2.0", "GPL 3.0", "BSD", "Unlicense"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-center text-text-secondary font-mono">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-border-subtle last:border-0 ${i % 2 === 0 ? "" : "bg-surface-subtle/50"}`}>
                      <td className="px-4 py-2.5 text-text-secondary">{row.feature}</td>
                      <td className="px-4 py-2.5 text-center">{row.mit}</td>
                      <td className="px-4 py-2.5 text-center">{row.apache}</td>
                      <td className="px-4 py-2.5 text-center">{row.gpl3}</td>
                      <td className="px-4 py-2.5 text-center">{row.bsd}</td>
                      <td className="px-4 py-2.5 text-center">{row.unlicense}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
