export interface UploadedModel {
  url: string;
  fileName: string;
  cleanup: () => void;
}

export interface ModelUploadAnalysis {
  modelType: "gltf" | "glb";
  missingAssets: string[];
}

function isAbsoluteUri(uri: string): boolean {
  return /^(data:|blob:|https?:\/\/|file:\/\/)/i.test(uri);
}

function normalizePath(value: string): string {
  return decodeURIComponent(value).replace(/\\/g, "/").replace(/^\.\//, "");
}

function makeLookupKeys(file: File): string[] {
  const keys = new Set<string>();

  keys.add(file.name);

  const relative = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
  if (relative) {
    const normalized = normalizePath(relative);
    keys.add(normalized);

    const segments = normalized.split("/");
    if (segments.length > 1) {
      keys.add(segments.slice(1).join("/"));
    }

    keys.add(segments[segments.length - 1]);
  }

  return Array.from(keys);
}

function findMatchingFile(files: File[], uri: string): File | undefined {
  const normalizedUri = normalizePath(uri).split("?")[0];
  const uriBaseName = normalizedUri.split("/").pop();

  return files.find((file) => {
    const keys = makeLookupKeys(file);

    if (keys.includes(normalizedUri)) {
      return true;
    }

    if (uriBaseName && keys.includes(uriBaseName)) {
      return true;
    }

    return keys.some((key) => key.endsWith(`/${normalizedUri}`));
  });
}

function rewriteAssetUris(gltf: Record<string, unknown>, files: File[], urlCache: Map<File, string>) {
  const getBlobUrl = (uri: string): string => {
    if (isAbsoluteUri(uri)) {
      return uri;
    }

    const matching = findMatchingFile(files, uri);
    if (!matching) {
      return uri;
    }

    const existing = urlCache.get(matching);
    if (existing) {
      return existing;
    }

    const blobUrl = URL.createObjectURL(matching);
    urlCache.set(matching, blobUrl);
    return blobUrl;
  };

  const buffers = Array.isArray(gltf.buffers) ? gltf.buffers : [];
  for (const buffer of buffers as Array<Record<string, unknown>>) {
    if (typeof buffer.uri === "string") {
      buffer.uri = getBlobUrl(buffer.uri);
    }
  }

  const images = Array.isArray(gltf.images) ? gltf.images : [];
  for (const image of images as Array<Record<string, unknown>>) {
    if (typeof image.uri === "string") {
      image.uri = getBlobUrl(image.uri);
    }
  }
}

function extractRelativeAssetUris(gltf: Record<string, unknown>): string[] {
  const assetUris: string[] = [];

  const buffers = Array.isArray(gltf.buffers) ? gltf.buffers : [];
  for (const buffer of buffers as Array<Record<string, unknown>>) {
    if (typeof buffer.uri === "string" && !isAbsoluteUri(buffer.uri)) {
      assetUris.push(buffer.uri);
    }
  }

  const images = Array.isArray(gltf.images) ? gltf.images : [];
  for (const image of images as Array<Record<string, unknown>>) {
    if (typeof image.uri === "string" && !isAbsoluteUri(image.uri)) {
      assetUris.push(image.uri);
    }
  }

  return assetUris;
}

export async function analyzeUploadedModel(files: File[]): Promise<ModelUploadAnalysis | null> {
  const candidates = files.filter((file) => /\.(gltf|glb)$/i.test(file.name));
  if (candidates.length === 0) {
    return null;
  }

  const modelFile = candidates.find((file) => /\.glb$/i.test(file.name)) ?? candidates[0];

  if (/\.glb$/i.test(modelFile.name)) {
    return {
      modelType: "glb",
      missingAssets: [],
    };
  }

  try {
    const rawText = await modelFile.text();
    const gltf = JSON.parse(rawText) as Record<string, unknown>;
    const companionFiles = files.filter((file) => file !== modelFile);
    const relativeAssetUris = extractRelativeAssetUris(gltf);

    const missingAssets = Array.from(
      new Set(relativeAssetUris.filter((uri) => !findMatchingFile(companionFiles, uri)).map((uri) => normalizePath(uri)))
    );

    return {
      modelType: "gltf",
      missingAssets,
    };
  } catch {
    return null;
  }
}

export async function prepareUploadedModel(files: File[]): Promise<UploadedModel | null> {
  const candidates = files.filter((file) => /\.(gltf|glb)$/i.test(file.name));
  if (candidates.length === 0) {
    return null;
  }

  const modelFile = candidates.find((file) => /\.glb$/i.test(file.name)) ?? candidates[0];

  if (/\.glb$/i.test(modelFile.name)) {
    const url = URL.createObjectURL(modelFile);
    return {
      url,
      fileName: modelFile.name,
      cleanup: () => URL.revokeObjectURL(url),
    };
  }

  const urlCache = new Map<File, string>();

  try {
    const rawText = await modelFile.text();
    const gltf = JSON.parse(rawText) as Record<string, unknown>;

    const companionFiles = files.filter((file) => file !== modelFile);
    rewriteAssetUris(gltf, companionFiles, urlCache);

    const gltfBlob = new Blob([JSON.stringify(gltf)], { type: "model/gltf+json" });
    const gltfBlobUrl = URL.createObjectURL(gltfBlob);

    return {
      url: gltfBlobUrl,
      fileName: modelFile.name,
      cleanup: () => {
        URL.revokeObjectURL(gltfBlobUrl);
        for (const blobUrl of urlCache.values()) {
          URL.revokeObjectURL(blobUrl);
        }
      },
    };
  } catch {
    for (const blobUrl of urlCache.values()) {
      URL.revokeObjectURL(blobUrl);
    }

    return null;
  }
}
