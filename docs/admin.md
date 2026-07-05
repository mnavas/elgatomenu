# Administration & Maintenance

This guide covers managing your team, keeping backups, updating ElGatoMenu, and troubleshooting common problems.

---

## CLI quick reference

Run these commands from the `elgatomenu` folder on the server computer. On Windows, replace `./elgatomenu` with `elgatomenu`.

| Command | What it does |
|---|---|
| `./elgatomenu start` | Start all services |
| `./elgatomenu stop` | Stop all services |
| `./elgatomenu restart` | Restart all services |
| `./elgatomenu status` | Show whether each service is running |
| `./elgatomenu logs` | Live logs from all services (Ctrl+C to stop) |
| `./elgatomenu logs elgatomenu` | Logs from the web app only |
| `./elgatomenu logs db` | Database logs only |
| `./elgatomenu hostname` | Print all URLs where the app is reachable |
| `./elgatomenu backup` | Save a database backup to `backups/` |
| `./elgatomenu restore backups/file.sql` | Restore a database backup |
| `./elgatomenu update` | Pull latest code, rebuild, restart |
| `./elgatomenu seed` | Re-seed the restaurant row from `.env` values |
| `./elgatomenu add-owner` | Create an admin login account |
| `./elgatomenu reset-password` | Reset the password of an existing account |
| `./elgatomenu keys` | Show the generated secrets (truncated) |
| `./elgatomenu help` | Show all commands |

---

## Managing your team

You can create individual logins for your staff and control exactly which parts of ElGatoMenu they can access.

### User roles

Each staff member can have any combination of three roles:

| Role | What they can do |
|---|---|
| **Menú** | Add, edit, and hide dishes and categories |
| **Pagos** | Verify and reject orders in the payment dashboard |
| **Cocina** | See and complete orders in the kitchen screen |

Users with no role assigned can log in but cannot do anything. You can also mark a user as **Admin**, which gives them full access to everything including Settings and User management.

Your own account (the one created during install) is always an admin.

### Creating a staff user

1. Go to the dashboard and click **👥** in the header
2. Click **+ Añadir usuario**
3. Fill in:
   - **Nombre** — the person's name (shown on their profile)
   - **Email** — they will use this to log in
   - **Contraseña** — a temporary password; they can change it later
4. Check the boxes for the roles they need
5. Click **Crear usuario**

The user can now log in at `http://{your-ip}:3000/dashboard/login`.

> **Note:** If you add a user with only the "Cocina" role, they are taken directly to the kitchen screen when they log in — they never see the main dashboard.

### Changing a user's access

1. Click **👥** in the dashboard header
2. Find the user and click ✏️
3. Check or uncheck the role boxes
4. Click **Guardar**

Changes take effect immediately — the user will see the updated access the next time they load a page.

### Removing a user

1. Click **👥** in the dashboard header
2. Find the user and click 🗑
3. Confirm the deletion

This permanently deletes their login. They will not be able to access the system anymore.

### Resetting a password

There is no self-service password reset in ElGatoMenu. If a staff member forgets their password:

1. Delete their account (👥 → 🗑)
2. Create a new one with a new password (👥 → + Añadir usuario)

### Creating an additional admin account

Use the CLI:
```bash
./elgatomenu add-owner
```

You will be asked for an email and password (entered twice for confirmation). This account has full admin access.

---

## Backup

### Create a backup

```bash
./elgatomenu backup
```

This saves a file like `backups/elgatomenu_db_20260516_093000.sql` in the project folder.

The backup includes:
- All menu categories and items
- All orders, order items, and receipt records
- Restaurant settings (name, payment methods, tax rates, staff profiles)
- Admin accounts

It does **not** include uploaded receipt images or dish photos (those are in Docker volumes).

### Recommended backup schedule

- **Daily** — at the end of each business day
- **Before every update** — always back up before running `./elgatomenu update`
- **After major menu changes** — when you restructure the menu significantly

### Store backups off the computer

The `backups/` folder is on the same machine. If the computer fails, you lose everything. Copy backup files to at least one other location:
- A USB drive you keep at the restaurant
- A cloud folder (Google Drive, Dropbox, iCloud)
- Another computer on your network

### Restore from backup

```bash
./elgatomenu restore backups/elgatomenu_db_20260516_093000.sql
```

> **Warning:** this overwrites the current database. All changes since the backup was made will be lost. You will be asked to confirm before it proceeds.

After restoring, restart ElGatoMenu:
```bash
./elgatomenu restart
```

---

## Updating ElGatoMenu

```bash
./elgatomenu backup
./elgatomenu update
```

Always back up first. The update command:
1. Pulls the latest version from GitHub
2. Rebuilds the web app
3. Restarts all services

The app is briefly unavailable during the restart step (usually under 30 seconds).

**Best time to update:** before service opens, or between shifts.

---

## Ports and network

| Port | Service | Who accesses it |
|---|---|---|
| 3000 | ElGatoMenu app | Customers and staff — share this URL |
| 3001 | Supabase Studio | You only — do NOT share publicly |
| 8000 | Supabase API | Used internally by the app |

### Supabase Studio (port 3001)

Studio is a database admin panel. Use it to browse tables, run queries, and export data. Access it at `http://{your-ip}:3001`.

Login: username `supabase`, password = your Postgres password (found in `.env` as `POSTGRES_PASSWORD`).

**Keep Studio private.** Anyone with access to port 3001 can read and change all restaurant data. Never share this port or include it in your restaurant's WiFi.

---

## Security

### The `.env` file

The `.env` file in the `elgatomenu` folder contains all secrets: database password, signing keys, and internal tokens. Never share this file. If it is ever exposed, run `./elgatomenu install` on a fresh copy to generate new secrets (this resets the database — back up first).

### Network exposure

For most restaurants with a local WiFi setup, nothing extra is needed. If your server is accessible from the internet:
- Expose port 3000 only if needed
- Never expose ports 3001 or 8000
- Use a reverse proxy (nginx, Caddy) with HTTPS for public access

---

## Troubleshooting

### The app does not load

Check container status:
```bash
./elgatomenu status
```

All services should show `Up`. If any show `Restarting` or `Exited`:
```bash
./elgatomenu logs        # see what's going wrong
./elgatomenu restart     # try a restart first
```

If the app keeps restarting:
```bash
./elgatomenu logs elgatomenu
```

If everything is stopped:
```bash
./elgatomenu start
```

---

### Customers can't reach the app on their phones

1. Confirm ElGatoMenu is running (`./elgatomenu status`)
2. Run `./elgatomenu hostname` — verify the IP address
3. Confirm the customer's phone is on **the same WiFi** as the server computer
4. Try opening the URL from the server computer itself — if that works but phones can't, it's a network issue
5. Check if the router blocks device-to-device traffic ("AP isolation" or "client isolation") — disable it if so

---

### "Restaurant not configured" error

The restaurant row in the database is missing. Run:
```bash
./elgatomenu seed
```

---

### Can't log in to the dashboard

If you forgot your password, reset it from the server:
```bash
./elgatomenu reset-password
```

You will be prompted for the account email and a new password (typed twice). To create a brand-new admin account instead, use `./elgatomenu add-owner`.

---

### A staff member can't log in

Make sure their account exists: go to **👥** in the dashboard and confirm their email is listed. If not, create a new account. If it is listed, delete and recreate it with a new password.

---

### Orders are not appearing in real time

The dashboard uses a live connection (WebSocket) to receive orders without refreshing. If orders only appear after a manual refresh:

1. Check that the `realtime` container is running:
   ```bash
   ./elgatomenu status
   ```
2. If it shows `Restarting`, restart it:
   ```bash
   docker compose restart realtime
   ```

---

### The kitchen screen is not updating

Same cause as above — check the `realtime` container.

Also confirm the staff member's account has the **Cocina** role (👥 in the dashboard).

---

### OCR is not reading receipts

- Check that the image is clear and not too dark
- Screenshots from DeUna and Sipi apps are the most reliably read
- Blurry or rotated images may fail — you can still verify manually
- Check app logs for errors: `./elgatomenu logs elgatomenu`

Manual verification always overrides OCR — a failed OCR does not block you from approving an order.

---

### Disk space is running low

Check disk usage:
```bash
docker system df
```

Clean up unused Docker build cache (safe to run at any time, does not delete your data):
```bash
docker system prune
```

---

### After a power outage

ElGatoMenu restarts automatically. Wait about 2 minutes after power is restored. If it doesn't come back:
```bash
./elgatomenu start
```

Orders being placed at the exact moment of the outage may be lost. Orders already in the database are preserved.

---

## Changing settings after install

### Change the app URL

Edit `.env`:
```
NEXT_PUBLIC_APP_URL=http://192.168.1.100:3000
NEXT_PUBLIC_SUPABASE_URL=http://192.168.1.100:8000
SITE_URL=http://192.168.1.100:3000
```

Then rebuild and restart:
```bash
docker compose build elgatomenu
./elgatomenu restart
```

### Change an admin password

Log in to the dashboard → ⚙️ → account settings, or use Supabase Studio → Authentication → Users → edit the user.

### Change the restaurant name

Go to ⚙️ in the dashboard → Información del restaurante → update the name → Guardar cambios. No restart needed.

---

## Full reset (start over)

If you need to wipe everything and start fresh:

```bash
./elgatomenu stop
docker compose down -v    # removes all volumes including the database
./elgatomenu install
```

> **Warning:** `docker compose down -v` permanently deletes all data. Back up first if you want to keep anything.
