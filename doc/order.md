# Module Order - Conventions code, qualite et architecture

## Architecture (hexagonale simplifiee)
- **Controller** (`src/module/order/createOrder/createOrderController.ts`) : recoit la requete HTTP, mappe le payload vers le cas d'usage, renvoie 201 en succes, 400 en erreur metier, 500 en erreur technique.
- **Use case** (`src/module/order/createOrder/createOrderUseCase.ts`) : centralise les regles metier (validation des `productIds`, `totalPrice`, construction de l'entite) et ne depend que du contrat de depot.
- **Repository (interface)** (`src/module/order/createOrder/createOrderRepository.ts`) : contrat unique pour la persistence; toute implementation doit respecter cette signature.
- **Repository TypeORM** (`src/module/order/createOrder/createOrderTypeOrmRepository.ts`) : adaptation infrastructure -> domaine pour sauvegarder une commande.
- **Entite** (`src/module/order/Order.ts`) : modele domaine/persistence partage, avec `status` par defaut `PENDING` et `createdAt` gere par TypeORM.

## Regles metier clefs
- `productIds` : tableau obligatoire de 1 a 5 ids, chaque id doit etre un entier positif.
- `totalPrice` : nombre obligatoire, compris entre 2 et 500 inclus.
- En cas d'erreur de persistence, le use case normalise le message en `erreur lors de la creation de la commande`.

## Conventions de code et qualite
- **Validation au plus pres du domaine** : toute regle d'ordre se trouve dans le use case, pas dans le controller.
- **Dependances injectees** : le use case depend de `CreateOrderRepository`; pour tester, utiliser un double (dummy/mock) sans base de donnees.
- **Messages en francais, ASCII** : pas d'accents pour rester compatibles partout.
- **Erreurs explicites** : lever des `Error` avec messages metier clairs; laisser le controller choisir le code HTTP.
- **Structure des dossiers** : un dossier par cas d'usage (`createOrder/`), contenant controller, use case, interface de depot, adaptation infra et tests.

## Tests
- Tests unitaires dans `src/module/order/createOrder/test/createOrderUseCase.spec.ts`.
- Scenarios couverts : succes, aucun produit, plus de 5 produits, ids invalides, totalPrice hors bornes, echec de sauvegarde. Le cas "6 produits" doit rejeter avec le message `la commande ne peut pas contenir plus de 5 produits` et ne pas sauvegarder d'ordre.
- Commande pour lancer les tests : `npm run test` (Jest).

## Checklist pour ajouter un nouveau cas d'usage Order
- Creer un dossier `src/module/order/<useCase>/` avec `...Controller`, `...UseCase`, `...Repository` (+ adaptation TypeORM si besoin) et `test/`.
- Mettre toutes les regles metier dans le use case; le controller reste un simple orchestrateur HTTP.
- Injecter les dependances (repositories, services externes) via le constructeur pour faciliter les tests.
- Ajouter des tests unitaires couvrant succes, validations et erreurs techniques.
