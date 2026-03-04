# API — URL Shortener

Base URL : `https://urls.lat`

---

## POST /api/shorten — Créer un lien court

### Requête

```http
POST https://urls.lat/api/shorten
Content-Type: application/json
```

### Corps (JSON)

| Champ        | Type   | Requis | Description                                      |
|--------------|--------|--------|--------------------------------------------------|
| `url`        | string | ✅     | URL originale à raccourcir                       |
| `customCode` | string | ❌     | Alias personnalisé (2–16 caractères, a-z 0-9 -_) |
| `userId`     | string | ❌     | ID utilisateur Supabase (pour sauvegarder)       |

### Exemples

**Lien simple**
```bash
curl -X POST https://urls.lat/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/une-url-tres-longue"}'
```

**Avec alias personnalisé**
```bash
curl -X POST https://urls.lat/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "customCode": "mon-lien"}'
```

**Avec userId (lien sauvegardé dans le dashboard)**
```bash
curl -X POST https://urls.lat/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "userId": "uuid-de-l-utilisateur"}'
```

### Réponse 200

```json
{
  "shortUrl": "https://urls.lat/8YyLt5",
  "shortCode": "8YyLt5",
  "originalUrl": "https://example.com/une-url-tres-longue",
  "id": "uuid-du-lien"
}
```

### Erreurs

| Status | Message                                          | Cause                        |
|--------|--------------------------------------------------|------------------------------|
| 400    | `URL requise`                                    | Champ `url` manquant         |
| 400    | `URL invalide`                                   | URL mal formée               |
| 400    | `Le code doit contenir 2 à 16 caractères...`     | Format `customCode` invalide |
| 409    | `Ce code est déjà utilisé, essaie un autre.`     | Collision sur `customCode`   |
| 500    | `Erreur serveur`                                 | Erreur interne               |

---

## GET /{shortCode} — Redirection

Ouvrir simplement l'URL dans un navigateur ou faire un GET :

```bash
curl -L https://urls.lat/8YyLt5
# Suit la redirection 302 vers l'URL originale

curl -I https://urls.lat/8YyLt5
# Affiche seulement les headers (Location: https://example.com/...)
```

Retourne un **302** vers l'URL originale. Si le code n'existe pas ou est inactif → **404**.

---

## Exemple JavaScript (fetch)

```js
const response = await fetch('https://urls.lat/api/shorten', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com',
    customCode: 'mon-alias', // optionnel
  }),
});

const data = await response.json();
console.log(data.shortUrl); // https://urls.lat/mon-alias
```

## Exemple Python (requests)

```python
import requests

res = requests.post('https://urls.lat/api/shorten', json={
    'url': 'https://example.com',
})
data = res.json()
print(data['shortUrl'])  # https://urls.lat/8YyLt5
```
