import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from "fs";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()]
  ,
  optimizeDeps: {
    include: ['jssip'],
  },
   build: {
    commonjsOptions: {
      include: ["jssip"],
    },

  },

  server: {
    // allowedHosts: ["occidentally-scapose-jimmie.ngrok-free.dev"],
    // host: '0.0.0.0',
    // https: {
    //   key: fs.readFileSync('./certs/self-signed.key'),
    //   cert: fs.readFileSync('./certs/self-signed.crt')
    // },
    // headers: {
    //   'Cache-Control': 'no-store',


    // }
  }
});
