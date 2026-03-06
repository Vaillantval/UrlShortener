# API — URL Shortener
Base URL : `https://urls.lat`

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/shorten` | Optionnelle | Créer un lien court |
| `GET` | `/{shortCode}` | Aucune | Redirection 302 vers l'URL originale |
| `GET` | `/api/qr/{shortCode}` | Aucune | Image PNG du QR Code |
| `GET` | `/api/stats/{shortCode}` | Aucune | Statistiques du lien |

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

| Status | Message                                      | Cause                        |
|--------|----------------------------------------------|------------------------------|
| 400    | `URL requise`                                | Champ `url` manquant         |
| 400    | `URL invalide`                               | URL mal formée               |
| 400    | `Le code doit contenir 2 à 16 caractères...` | Format `customCode` invalide |
| 409    | `Ce code est déjà utilisé, essaie un autre.` | Collision sur `customCode`   |
| 500    | `Erreur serveur`                             | Erreur interne               |

---

## GET /{shortCode} — Redirection

Retourne un **302** vers l'URL originale. Si le code n'existe pas ou est inactif → **404**.

> Le compteur de clics est incrémenté de façon non-bloquante — la redirection n'est pas retardée.

```bash
# Suit la redirection 302 vers l'URL originale
curl -L https://urls.lat/8YyLt5

# Affiche seulement les headers (Location: https://example.com/...)
curl -I https://urls.lat/8YyLt5
```

---

## GET /api/qr/{shortCode} — QR Code

Retourne une image **PNG** du QR Code encodant l'URL courte. Utile pour l'impression, les flyers ou l'intégration dans un dashboard.

### Requête
```http
GET https://urls.lat/api/qr/{shortCode}
```

### Réponse

| Cas | Réponse |
|-----|---------|
| Code valide | `200 OK` — image PNG (`Content-Type: image/png`, cache 24h) |
| Code inexistant | `404 Not Found` |

### Exemples

```bash
# Télécharger le QR Code en PNG
curl https://urls.lat/api/qr/8YyLt5 --output qr.png
```

```html
<!-- Intégrer directement en HTML -->
<img src="https://urls.lat/api/qr/8YyLt5" alt="QR Code" width="200" />
```

```js
// Afficher dynamiquement en JavaScript
const qrUrl = `https://urls.lat/api/qr/${shortCode}`;
document.getElementById('qr').src = qrUrl;
```

> Le QR Code utilise le niveau de correction d'erreur **H** (30% de tolérance aux dommages) — idéal pour les supports imprimés.

---

## GET /api/stats/{shortCode} — Statistiques

Retourne les statistiques d'un lien : total des clics, date de création, statut, et les 100 derniers clics individuels avec métadonnées pays et appareil.

### Requête
```http
GET https://urls.lat/api/stats/{shortCode}
```

### Réponse 200
```json
{
  "short_code": "8YyLt5",
  "original_url": "https://example.com/une-url-tres-longue",
  "click_count": 142,
  "created_at": "2026-03-01T10:22:00Z",
  "is_active": true,
  "recent_clicks": [
    {
      "clicked_at": "2026-03-04T14:30:00Z",
      "country": "HT",
      "device_type": "mobile"
    }
  ]
}
```

### Erreurs

| Status | Message        | Cause                     |
|--------|----------------|---------------------------|
| 404    | `Not found`    | Le short code n'existe pas |
| 500    | `Server error` | Erreur interne             |

### Exemples

```bash
curl https://urls.lat/api/stats/8YyLt5
```

```js
const res = await fetch('https://urls.lat/api/stats/8YyLt5');
const stats = await res.json();
console.log(`${stats.click_count} clics au total`);
```

```python
import requests
data = requests.get("https://urls.lat/api/stats/8YyLt5").json()
print(f"{data['click_count']} clics — actif: {data['is_active']}")
```

> `recent_clicks` retourne au maximum 100 entrées, triées du plus récent au plus ancien. Le champ `country` utilise les codes ISO 3166-1 alpha-2 (ex: `HT` = Haïti). Le header `cf-ipcountry` est injecté automatiquement par Cloudflare.

---

## Exemples d'intégration

### JavaScript — fetch

```js
const response = await fetch('https://urls.lat/api/shorten', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com',
    customCode: 'mon-alias', // optionnel
  }),
});

if (!response.ok) {
  const err = await response.json();
  console.error('Erreur:', err.error);
} else {
  const data = await response.json();
  console.log(data.shortUrl); // https://urls.lat/mon-alias
}
```

### Python — requests

```python
import requests

res = requests.post('https://urls.lat/api/shorten', json={
    'url': 'https://example.com',
    'customCode': 'mon-alias',  # optionnel
})

if res.status_code == 200:
    data = res.json()
    print(data['shortUrl'])  # https://urls.lat/mon-alias
else:
    print('Erreur:', res.json()['error'])
```
