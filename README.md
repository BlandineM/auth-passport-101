**NB: Ce serveur est _très_ verbeux, et renvoie trop d'infos qui pourraient être utilisées par une personne malveillante. Il est conseillé de renvoyer le moins de détails possible dans ces cas là !**

### Step-by-step

#### 1. Installer les packages nécessaires

- `bcrypt`: hashage (de mot de passe, principalement)
- `body-parser`: lecture du corps des requêtes envoyées vers le backend
- `dotenv`: création/lecture de variables d'environnement depuis un fichier (_ajouté au `.gitignore`_)
- `express`: backend rapide à mettre en place
- `mysql`: connecteur entre JS et le SGBD du même nom
- `passport`: gestion de stratégies d'authentification
- `passport-jwt`: stratégie d'auth par token JWT
- `passport-local`: stratégie d'auth pas user/password

#### 2. Créer un backend "open bar"

- Création d'un fichier de conf pour la DB, le port du backend et les options JWT
- Import des librairies
- Initialisation des libs le requérant (express, passport, body-parser)
- Route "Hello World" à fins de tests
- Gestion 404 (Routes inexistantes)
- Lancement du serveur
- Création d'un fichier séparé pour les requêtes liées à l'authentification
- Création d'une database (dump disponible dans `db_backup.sql`)

#### 3. Créer les routes, liées à l'authentification ou non

- `POST /auth/signup`: Route publique permettant de créer un nouvel utilisateur
- `POST /auth/login`: Route protégée (stratégie locale) renvoyant le JWT du user
- `POST /profile`: Route protégée (stratégie JWT) renvoyant les infos du user (se trouvera dans un autre fichier)

#### 4. POST /auth/signup

- Je récupère les données du corps de la requête et stocke tout dans formData
- Je crypte le mot de passe fourni et mets à jour formData (-> je ne connais plus le mdp original)
- Je lance une requête d'insertion dans la base d'utilisateurs
  - Si il y a une erreur, je renvoie immédiatement un message informatif [FIN]
- J'efface le hash du password de formData (le front ne récupèrera pas cette info: elle ne lui servirait à rien, _et_ pourrait constituer un trou de sécurité)
- J'ajoute à formData l'ID de mon nouvel utilisateur (information utile pour plus tard)
- Je transforme formData en chaine de caractères (`JSON.stringify()`), puis en JWT (`jwt.sign()`)

#### 5. POST /auth/login

_Ici il faudra intervenir sur deux fichiers: `auth.js` et `passport-strategies.js`._
_Le premier fichier contient toujours les routes, mais le second contiendra toute la logique du "comment je m'authentifie ?"._

##### auth.js

- Je demande une authentification en utilisant la stratégie `local`
  - Si j'ai qqc dans `errAuth`, une erreur tech est survenue (BdD inaccessible, ...). Dans ce cas je renvoie une 500 [FIN]
  - Si je n'ai rien dans `user`, c'est que l'utilisateur n'a pas été reconnu (mauvais mail/password). Je renvoie alors une 401(Unauthorized) [FIN]
  - Dans les autres cas (pas d'erreur, et j'ai un user), je peux continuer !
- Je transforme mon user via `jwt.sign()` en utilisant le secret JWT stocké dans mes variables d'environnement
- Je renvoie le résultat avec un statut 200

##### passport-strategies.js

_Je vais ici détailler la stratégie `local`. Elle peut être utilisée par N routes sur notre backend, même si on la réserve en général au login_

- J'appelle la LocalStrategy du package `passport-local`, en lui fournissant les options `usernameField` et `passwordField`, qui sont les noms des champs à surveiller dans le corps de ma requête
- Je demande les champs que je veux renvoyer dans ma réponse (ici: id, mail, firstname, lastname) ainsi que le password (pour pouvoir le tester)
  - Si il y a une erreur, je renvoie immédiatement l'erreur [FIN]
  - Si je n'ai rien dans `queryRows` (les résultats même de la requête exécutée), je n'ai pas trouvé de user. Je renvoie alors un message informatif indiquant le problème [FIN]
- Je sors les variables `id, mail, firstname, lastname` (**PAS `password` !**) de mon premier résultat (normalement le _seul_ résultat), et les enregistre dans une variable `user`
- Je compare le password fourni dans ma requête (`formPassword`) avec le password issu de la BdD (`queryRows[0].password`), et stocke le résultat (true ou false) dans `isPasswordOK`
- Si cette variable est **false**, les passwords ne correspondent pas. Je renvoie alors un refus [FIN]
- Si j'arrive jusqu'ici, mon user est reconnu et le password fourni est le bon. Je renvoie alors mon user [FIN <3]

#### 6. GET /auth/profile

_Ceci est une route assez générique: on lui fait renvoyer le profil de l'utilisateur concerné, mais le principe serait exactement identique si on devait renvoyer une liste de voitures, poster un nouveau personnage, etc etc_
_Nous allons ajouter une stratégie (`jwt`) à notre `passport-strategies.js`, et l'appeler depuis la route qui en a besoin._

##### misc.js

- Je déclare ma route (`GET /profile`). Elle devra être appelée en fournissant le token dans le Header "Auth Bearer Token", sous peine d'être rejetée
- Je demande une authentification de type `jwt` à Passport
  - S'il y a une erreur, je renvoie une erreur 500 [FIN]
  - Si je n'ai pas de user, je renvoie une erreur 401 [FIN]
- Si j'arrive ici, c'est que tout est bon, je sais qui a demandé l'accès à cette route. **NB: J'ai à partir d'ici accès à toutes les données du token, par exemple toutes les infos sur mon utilisateur, sans avoir à faire un appel BdD pour ça !**
- (_Spécifique à notre cas_) Je renvoie les infos de notre utilisateur, comme si je voulais afficher sa page de profil sur notre site frotend par exemple, avec un statut 200 [FIN <3]

##### passport-strategies.js

_Je vais ici détailler la stratégie `jwt`. Elle est en général utilisée par N routes sur notre backend, car elle permet d'accéder à notre utilisateur sans avoir à faire de requête complémentaire **et** ne tient pas compte du moyen d'auth initial (Facebook, Github, Twitter, Local, ...), tout le monde utilisera les JWT pour les autres routes._

- J'appelle la JWTStrategy du package `passport-jwt`, en lui fournissant les options `jwtFromRequest` (Où trouver le token ? Ici, on le stocke dans un header de notre requête) et `secretOrKey` (quelle chaine de caractères utiliser pour décrypter nos données stockées dans le token ? Ici, elle se trouve dans nos variables d'environnement)
- Je stocke le contenu décrypté du token dans une variable `user`
- Je la renvoie (oui oui, c'est tout !) [FIN <3]
