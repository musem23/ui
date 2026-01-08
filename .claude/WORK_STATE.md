# Brand Template - Liste des Tâches Atomiques
### [2026-01-07 22:01] Session
**User Request**: "Session completed"

**Agent Actions**:
Work performed in this session

**Final State**: Session completed
**Next Steps**: Continue work as needed

---


### [2026-01-07 21:59] Session
**User Request**: "Session completed"

**Agent Actions**:
Work performed in this session

**Final State**: Session completed
**Next Steps**: Continue work as needed

---


### [2026-01-07 21:59] Session
**User Request**: "Session completed"

**Agent Actions**:
Work performed in this session

**Final State**: Session completed
**Next Steps**: Continue work as needed

---


### [2026-01-07 21:59] Session
**User Request**: "Session completed"

**Agent Actions**:
Work performed in this session

**Final State**: Session completed
**Next Steps**: Continue work as needed

---


### [2026-01-07 21:12] Session
**User Request**: "Session completed"

**Agent Actions**:
Work performed in this session

**Final State**: Session completed
**Next Steps**: Continue work as needed

---


### [2026-01-07 20:55] Session
**User Request**: "Session completed"

**Agent Actions**:
Work performed in this session

**Final State**: Session completed
**Next Steps**: Continue work as needed

---



## Last Updated: 2026-01-07

---

## Phase 1: Créer le système de tokens

- [ ] 1.1 Créer le dossier `brand/`
- [ ] 1.2 Créer `brand/tokens.ts` - définir les couleurs primary
- [ ] 1.3 Créer `brand/tokens.ts` - définir les couleurs secondary
- [ ] 1.4 Créer `brand/tokens.ts` - définir background/foreground
- [ ] 1.5 Créer `brand/tokens.ts` - définir muted/accent/destructive
- [ ] 1.6 Créer `brand/tokens.ts` - définir border/input/ring
- [ ] 1.7 Créer `brand/tokens.ts` - définir sidebar colors
- [ ] 1.8 Créer `brand/tokens.ts` - définir chart colors
- [ ] 1.9 Créer `brand/tokens.ts` - définir fonts (sans, mono)
- [ ] 1.10 Créer `brand/tokens.ts` - définir radius (default, sm, md, lg, xl)
- [ ] 1.11 Créer `brand/tokens.css` - écrire les CSS variables :root
- [ ] 1.12 Créer `brand/tokens.css` - écrire les CSS variables .dark
- [ ] 1.13 Créer `brand/theme.ts` - définitions light mode
- [ ] 1.14 Créer `brand/theme.ts` - définitions dark mode
- [ ] 1.15 Créer `brand/config.ts` - configuration fonts
- [ ] 1.16 Créer `brand/config.ts` - configuration radius
- [ ] 1.17 Créer `brand/config.ts` - export de la config globale

---

## Phase 2: Simplifier globals.css

- [ ] 2.1 Lire le fichier `styles/globals.css` actuel
- [ ] 2.2 Créer une backup de globals.css
- [ ] 2.3 Supprimer les imports inutiles
- [ ] 2.4 Ajouter `@import "../brand/tokens.css"`
- [ ] 2.5 Garder `@import "tailwindcss"`
- [ ] 2.6 Garder `@custom-variant dark`
- [ ] 2.7 Simplifier @layer base - border-border
- [ ] 2.8 Simplifier @layer base - bg-background
- [ ] 2.9 Simplifier @layer base - text-foreground
- [ ] 2.10 Vérifier la syntaxe finale

---

## Phase 3: Organiser les composants UI (55 composants)

### 3.1 Créer la structure de dossiers

- [ ] 3.1.1 Créer `components/ui/`
- [ ] 3.1.2 Créer `lib/hooks/`

### 3.2 Copier les composants (A-B)

- [ ] 3.2.1 Copier accordion.tsx
- [ ] 3.2.2 Copier alert-dialog.tsx
- [ ] 3.2.3 Copier alert.tsx
- [ ] 3.2.4 Copier aspect-ratio.tsx
- [ ] 3.2.5 Copier avatar.tsx
- [ ] 3.2.6 Copier badge.tsx
- [ ] 3.2.7 Copier breadcrumb.tsx
- [ ] 3.2.8 Copier button-group.tsx
- [ ] 3.2.9 Copier button.tsx

### 3.3 Copier les composants (C)

- [ ] 3.3.1 Copier calendar.tsx
- [ ] 3.3.2 Copier card.tsx
- [ ] 3.3.3 Copier carousel.tsx
- [ ] 3.3.4 Copier chart.tsx
- [ ] 3.3.5 Copier checkbox.tsx
- [ ] 3.3.6 Copier collapsible.tsx
- [ ] 3.3.7 Copier combobox.tsx
- [ ] 3.3.8 Copier command.tsx
- [ ] 3.3.9 Copier context-menu.tsx

### 3.4 Copier les composants (D-F)

- [ ] 3.4.1 Copier dialog.tsx
- [ ] 3.4.2 Copier drawer.tsx
- [ ] 3.4.3 Copier dropdown-menu.tsx
- [ ] 3.4.4 Copier empty.tsx
- [ ] 3.4.5 Copier field.tsx
- [ ] 3.4.6 Copier form.tsx

### 3.5 Copier les composants (H-L)

- [ ] 3.5.1 Copier hover-card.tsx
- [ ] 3.5.2 Copier input-group.tsx
- [ ] 3.5.3 Copier input-otp.tsx
- [ ] 3.5.4 Copier input.tsx
- [ ] 3.5.5 Copier item.tsx
- [ ] 3.5.6 Copier kbd.tsx
- [ ] 3.5.7 Copier label.tsx

### 3.6 Copier les composants (M-N)

- [ ] 3.6.1 Copier menubar.tsx
- [ ] 3.6.2 Copier native-select.tsx
- [ ] 3.6.3 Copier navigation-menu.tsx

### 3.7 Copier les composants (P-R)

- [ ] 3.7.1 Copier pagination.tsx
- [ ] 3.7.2 Copier popover.tsx
- [ ] 3.7.3 Copier progress.tsx
- [ ] 3.7.4 Copier radio-group.tsx
- [ ] 3.7.5 Copier resizable.tsx

### 3.8 Copier les composants (S)

- [ ] 3.8.1 Copier scroll-area.tsx
- [ ] 3.8.2 Copier select.tsx
- [ ] 3.8.3 Copier separator.tsx
- [ ] 3.8.4 Copier sheet.tsx
- [ ] 3.8.5 Copier sidebar.tsx
- [ ] 3.8.6 Copier skeleton.tsx
- [ ] 3.8.7 Copier slider.tsx
- [ ] 3.8.8 Copier sonner.tsx
- [ ] 3.8.9 Copier spinner.tsx
- [ ] 3.8.10 Copier switch.tsx

### 3.9 Copier les composants (T-Z)

- [ ] 3.9.1 Copier table.tsx
- [ ] 3.9.2 Copier tabs.tsx
- [ ] 3.9.3 Copier textarea.tsx
- [ ] 3.9.4 Copier toggle-group.tsx
- [ ] 3.9.5 Copier toggle.tsx
- [ ] 3.9.6 Copier tooltip.tsx

### 3.10 Copier hooks et lib

- [ ] 3.10.1 Copier use-mobile.ts vers lib/hooks/
- [ ] 3.10.2 Copier utils.ts vers lib/

---

## Phase 4: Fichiers de configuration

- [ ] 4.1 Lire registry/themes.ts
- [ ] 4.2 Copier registry/themes.ts vers brand/
- [ ] 4.3 Lire registry/fonts.ts
- [ ] 4.4 Copier registry/fonts.ts vers brand/
- [ ] 4.5 Lire registry/base-colors.ts
- [ ] 4.6 Copier registry/base-colors.ts vers brand/
- [ ] 4.7 Mettre à jour les imports dans themes.ts
- [ ] 4.8 Mettre à jour les imports dans fonts.ts
- [ ] 4.9 Mettre à jour les imports dans base-colors.ts

---

## Phase 5: Supprimer le contenu inutile

### 5.1 Documentation

- [ ] 5.1.1 Supprimer apps/v4/content/
- [ ] 5.1.2 Supprimer apps/v4/app/(app)/docs/

### 5.2 Packages

- [ ] 5.2.1 Supprimer packages/shadcn/
- [ ] 5.2.2 Supprimer packages/tests/

### 5.3 Fichiers registry

- [ ] 5.3.1 Supprimer registry/directory.json
- [ ] 5.3.2 Supprimer registry/__index__.tsx
- [ ] 5.3.3 Supprimer registry/new-york-v4/blocks/
- [ ] 5.3.4 Supprimer registry/new-york-v4/charts/
- [ ] 5.3.5 Supprimer registry/new-york-v4/examples/

---

## Phase 6: Script de synchronisation

- [ ] 6.1 Créer le dossier scripts/
- [ ] 6.2 Créer scripts/sync-brand.ts
- [ ] 6.3 Importer execSync depuis child_process
- [ ] 6.4 Définir constante BRAND_REPO
- [ ] 6.5 Définir constante BRAND_BRANCH
- [ ] 6.6 Définir array SYNC_PATHS
- [ ] 6.7 Implémenter fonction syncBrand()
- [ ] 6.8 Ajouter git fetch dans syncBrand
- [ ] 6.9 Ajouter git checkout pour chaque path
- [ ] 6.10 Ajouter console.log de confirmation
- [ ] 6.11 Appeler syncBrand()

---

## Phase 7: Mettre à jour package.json

- [ ] 7.1 Lire package.json actuel
- [ ] 7.2 Supprimer script registry:build
- [ ] 7.3 Supprimer script registry:capture
- [ ] 7.4 Supprimer script shadcn:*
- [ ] 7.5 Supprimer script validate:registries
- [ ] 7.6 Supprimer script pub:*
- [ ] 7.7 Ajouter script "sync-brand": "tsx scripts/sync-brand.ts"
- [ ] 7.8 Mettre à jour workspaces (retirer packages/*)
- [ ] 7.9 Nettoyer devDependencies inutiles
- [ ] 7.10 Nettoyer dependencies inutiles

---

## Phase 8: Vérification finale

- [ ] 8.1 Vérifier que brand/ existe avec tous les fichiers
- [ ] 8.2 Vérifier que components/ui/ contient 55 fichiers
- [ ] 8.3 Vérifier que lib/utils.ts existe
- [ ] 8.4 Vérifier que lib/hooks/use-mobile.ts existe
- [ ] 8.5 Vérifier globals.css importe tokens.css
- [ ] 8.6 Exécuter pnpm install
- [ ] 8.7 Exécuter pnpm build
- [ ] 8.8 Exécuter pnpm dev
- [ ] 8.9 Tester le dark mode dans le navigateur
- [ ] 8.10 Tester bun run scripts/sync-brand.ts
- [ ] 8.11 Fork le projet dans un nouveau dossier
- [ ] 8.12 Vérifier que le fork fonctionne

---

## Phase 9: Intégration Skills (optionnel)

- [ ] 9.1 Tester document-skills:theme-factory
- [ ] 9.2 Générer des tokens avec theme-factory
- [ ] 9.3 Tester document-skills:brand-guidelines
- [ ] 9.4 Valider le branding avec brand-guidelines
- [ ] 9.5 Documenter l'utilisation des skills

---

## Notes

- Total: ~100 tâches atomiques
- Chaque tâche est indépendante et peut être cochée individuellement
- Les phases doivent être exécutées dans l'ordre
