const isText = (value) => typeof value === "string" && value.trim().length > 0;
const isVector = (value) => Array.isArray(value) && value.length === 3 && value.every(Number.isFinite);
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

// Returns messages too, so callers can surface validation in development tools.
export function validateContent(objects, warn = console.warn) {
  const errors = [];
  const report = (message) => { errors.push(message); warn(`[content] ${message}`); };
  if (!Array.isArray(objects) || objects.length === 0) {
    report("Expected a non-empty array of objects.");
    return errors;
  }
  const ids = new Set();
  const meshes = new Set();
  objects.forEach((object, index) => {
    const label = `Object ${index + 1}`;
    if (!isObject(object)) { report(`${label} must be an object.`); return; }
    for (const field of ["id", "meshName", "title", "focus", "integration", "panel"]) {
      if (!Object.hasOwn(object, field)) report(`${label} is missing required field "${field}".`);
    }
    if (!isText(object.id)) report(`${label} needs a non-empty id.`);
    else if (ids.has(object.id)) report(`${label} has duplicate id "${object.id}".`);
    ids.add(object.id);
    if (!isText(object.title)) report(`${label} needs a non-empty title.`);
    for (const field of ["cameraPosition", "lookAt"]) {
      if (!isVector(object.focus?.[field])) report(`${label} focus.${field} must contain three finite numbers.`);
    }
    if (!isText(object.meshName)) report(`${label} needs a non-empty meshName.`);
    else if (meshes.has(object.meshName)) report(`${label} has duplicate meshName "${object.meshName}".`);
    meshes.add(object.meshName);
    if (!isObject(object.panel) || !isText(object.panel.blurb)) report(`${label} needs a panel object with a non-empty blurb.`);
    if (object.id === 'football' && !isText(object.panel?.story)) report(`${label} needs a football story.`);
    if (object.integration !== null && !["github", "spotify"].includes(object.integration)) {
      report(`${label} integration must be null, "github" or "spotify".`);
    }
  });
  return errors;
}

// Pass the loaded Three.js scene (or glTF.scene); groups are valid targets too.
export function validateSceneMeshes(objects, scene, warn = console.warn) {
  if (!Array.isArray(objects) || typeof scene?.getObjectByName !== "function") {
    warn("[content] Mesh validation requires objects and a loaded Three.js scene.");
    return [];
  }
  const missing = [];
  for (const object of objects) {
    if (!isText(object?.meshName)) continue;
    if (!scene.getObjectByName(object.meshName)) {
      missing.push(object.meshName);
      warn(`[content] Object "${object.id}" expects mesh/group "${object.meshName}", but it was not found in the scene. Match the model name exactly (case-sensitive).`);
    }
  }
  return missing;
}
