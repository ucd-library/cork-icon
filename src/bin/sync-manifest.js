#!/usr/bin/env node

import gcs from "../lib/gcs.js";

await gcs.syncManifestFile();
