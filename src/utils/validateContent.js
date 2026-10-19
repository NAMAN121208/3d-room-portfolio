const isText = (value) => typeof value === "string" && value.trim().length > 0;
const isVector = (value) => Array.isArray(value) && value.length === 3 && value.every(Number.isFinite);
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

// Returns messages too, so callers can surface validation in development tools.
export function validateContent(stops, warn = console.warn) {
  const errors = [];
  const report = (message) => { errors.push(message); warn(`[content] ${message}`); };
  if (!Array.isArray(stops) || stops.length === 0) {
    report("Expected a non-empty array of stops.");
    return errors;
  }
  const ids = new Set();
  const meshes = new Set();
  stops.forEach((stop, index) => {
    const label = `Stop ${index + 1}`;
    if (!isObject(stop)) { report(`${label} must be an object.`); return; }
    for (const field of ["id", "meshName", "title", "cameraPosition", "lookAt", "panel"]) {
      if (!Object.hasOwn(stop, field)) report(`${label} is missing required field "${field}".`);
    }
    if (!isText(stop.id)) report(`${label} needs a non-empty id.`);
    else if (ids.has(stop.id)) report(`${label} has duplicate id "${stop.id}".`);
    ids.add(stop.id);
    if (!isText(stop.title)) report(`${label} needs a non-empty title.`);
    for (const field of ["cameraPosition", "lookAt"]) {
      if (!isVector(stop[field])) report(`${label} ${field} must contain three finite numbers.`);
    }
    if (stop.id === "intro") {
      if (stop.meshName !== null || stop.panel !== null) report(`${label} intro meshName and panel must be null.`);
    } else {
      if (!isText(stop.meshName)) report(`${label} needs a non-empty meshName.`);
      else if (meshes.has(stop.meshName)) report(`${label} has duplicate meshName "${stop.meshName}".`);
      meshes.add(stop.meshName);
      if (!isObject(stop.panel) || !isText(stop.panel.blurb)) report(`${label} needs a panel object with a non-empty blurb.`);
    }
    if (stop.integration !== undefined && !["github", "spotify"].includes(stop.integration)) {
      report(`${label} integration must be "github" or "spotify".`);
    }
  });
  return errors;
}

// Pass the loaded Three.js scene (or glTF.scene); groups are valid targets too.
export function validateSceneMeshes(stops, scene, warn = console.warn) {
  if (!Array.isArray(stops) || typeof scene?.getObjectByName !== "function") {
    warn("[content] Mesh validation requires stops and a loaded Three.js scene.");
    return [];
  }
  const missing = [];
  for (const stop of stops) {
    if (!isText(stop?.meshName)) continue;
    if (!scene.getObjectByName(stop.meshName)) {
      missing.push(stop.meshName);
      warn(`[content] Stop "${stop.id}" expects mesh/group "${stop.meshName}", but it was not found in the scene. Match the model name exactly (case-sensitive).`);
    }
  }
  return missing;
}
