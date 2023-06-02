import { svelte } from "buchta/plugins/svelte";
import { react } from "buchta/plugins/react";
import { vue } from "buchta/plugins/vue";

import { BuchtaConfig } from "buchta";

export default {
    port: 3000,
    ssr: true,

    rootDir: import.meta.dir,
    plugins: [svelte(), react({}), vue()],
} as BuchtaConfig;
