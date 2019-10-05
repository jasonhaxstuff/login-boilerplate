# Login Boilerplate
Build/start with `npm run start` or `yarn start`  
Start without building with `npm run start:nobuild` or `yarn start:nobuild`

## Configuration
You ***will*** want to edit the config file.

1. Rename the example config (located at `api/config.example.json`) to `config.json`.
2. Make `secret` a secure and random string.
3. If using HTTP, leave the port as `80`. For HTTPS, change it to `443`.
4. Leave or change `https.useHttps` depending on what you're using.
5. If using HTTPS, change `https.crt` and `https.key` to your certificate and private key files, relative to the `api` folder.  

*Note:* You should use HTTPS to make sure that passwords aren't intercepted by an attacker!  

6. Change `postgres` to reflect your PostgreSQL setup.
7. After you start the API and a password is hashed, you may get a warning about it taking a too short/long amount of time.
   * If it is taking <1000ms, raise the `hashingIterations` config option.
   * If it is taking >1000ms, lower the `hashingIterations` config option.
   * It may not always be perfect, and that's fine. Just make sure this warning doesn't go off for most password lengths.
