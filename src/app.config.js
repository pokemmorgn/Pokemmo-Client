import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import cors from "cors";

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom.js";

export default config({

    initializeGameServer: (gameServer) => {
        gameServer.define('my_room', MyRoom);
    },

    initializeExpress: (app) => {
        // Ajout du middleware CORS
        app.use(cors({
            origin: ['https://pokemmorgn.github.io', 'http://localhost:3000'], // liste des origines autorisées
            methods: ["GET", "POST", "OPTIONS"],
            credentials: true,
        }));

        app.get("/hello_world", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }

        // Protection basique par mot de passe pour le monitor
        app.use("/monitor", (req, res, next) => {
            const auth = { login: "admin", password: "password" }; // CHANGE CES VALEURS !

            const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
            const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

            if (login && password && login === auth.login && password === auth.password) {
                return next();
            }

            res.set('WWW-Authenticate', 'Basic realm="Monitor"');
            res.status(401).send('Authentication required.');
        }, monitor());
    },

    beforeListen: () => {
        // code avant le lancement du serveur si besoin
    }

});
