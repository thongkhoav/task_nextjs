// src/swEnvBuild.js

const fs = require("fs");

// This dotenv is the one used inside React.
// Load dotenv Intentionally because build process does not have access to .env file yet.
const dotenv = require("dotenv");
dotenv.config();

const {
  NEXT_PUBLIC_apiKey,
  NEXT_PUBLIC_authDomain,
  NEXT_PUBLIC_projectId,
  NEXT_PUBLIC_storageBucket,
  NEXT_PUBLIC_messagingSenderId,
  NEXT_PUBLIC_appId,
} = process.env;

const content = `const swEnv = {
    NEXT_PUBLIC_apiKey: '${NEXT_PUBLIC_apiKey}',
    NEXT_PUBLIC_authDomain: '${NEXT_PUBLIC_authDomain}',
    NEXT_PUBLIC_projectId: '${NEXT_PUBLIC_projectId}',
    NEXT_PUBLIC_storageBucket: '${NEXT_PUBLIC_storageBucket}',
    NEXT_PUBLIC_messagingSenderId: '${NEXT_PUBLIC_messagingSenderId}',
    NEXT_PUBLIC_appId: '${NEXT_PUBLIC_appId}',
 }`;

fs.writeFileSync("./public/swEnv.js", content);
