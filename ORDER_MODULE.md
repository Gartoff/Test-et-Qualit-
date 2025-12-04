# Module Commande - Conventions et Architecture

## Architecture hexagonale simplifiee
- **Controller** (`src/module/order/createOrder/createOrderController.ts`) : recoit la requete HTTP, extrait les donnees utiles (productIds, totalPrice), instancie le cas d'usage et renvoie les codes HTTP (201 en succes, 400 en erreur metier, 500 en erreur inconnue).
- **Use case** (`src/module/order/createOrder/createOrderUseCase.ts`) : contient la logique metier (validations, preparation de l'entite) et ne depend que d'une interface de depot.
- **Repository interface** (`src/module/order/createOrder/createOrderRepository.ts`) : contrat de persistence, isole le use case du detail technique.
- **Adapter TypeORM** (`src/module/order/createOrder/createOrderTypeOrmRepository.ts`) : implementation concrete qui sauvegarde via TypeORM. L'infrastructure reste interchangeable car le use case depend du contrat.
- **Entite** (`src/module/order/Order.ts`) : modele persistant partage par les couches. Les champs `createdAt` et `status` sont definis automatiquement par TypeORM.

## Regles metier appliquees
- `productIds` doit etre un tableau de 1 a 5 identifiants, chaque element doit etre un entier positif.
- `totalPrice` doit etre un nombre compris entre 2 et 500.
- Le statut par defaut d'une commande est `PENDING`; `createdAt` est genere par la base.
- En cas d'erreur de persistence, le use case renvoie un message controle (`erreur lors de la creation de la commande`).

## Qualite de code
- **Validation au plus pres du domaine** : toutes les regles sont centralisees dans le use case pour eviter la duplication et garantir la coherence.
- **Gestion d'erreurs explicite** : les exceptions metier sont remontees au controller qui repond en HTTP 400; les erreurs inconnues sont renvoyees en 500.
- **Dependances injectees** : le use case reçoit un `CreateOrderRepository`, ce qui permet de tester sans base de donnees.
- **Nomage clair** : fonctions et messages en francais simple, sans caracteres speciaux pour rester compatibles ASCII.
- **Tests unitaires** : `src/module/order/createOrder/test/createOrderUseCase.spec.ts` couvre scenarios de succes, validations et erreur de persistence.

## Extension et bonnes pratiques
- Pour d'autres actions (lecture, update), creer un nouveau dossier par cas d'usage avec le meme tronc commun `controller -> use case -> repository`.
- Centraliser les messages d'erreur dans des constantes si plusieurs use cases les partagent.
- Lorsque la recuperation du prix unitaire sera necessaire, injecter un `ProductQueryRepository` dans le use case et calculer `totalPrice` avant de sauvegarder.
- Les routes doivent etre branchees dans `src/config/app.ts` sous le prefixe `/api`.
