# Contxt Setup Guide

Complete setup instructions for getting Contxt production-ready.

## 📋 Prerequisites

### Required Software

1. **Node.js** (v20.x or higher)
   ```bash
   node --version  # Should be v20+
   ```

2. **pnpm** (v8.x)
   ```bash
   npm install -g pnpm@8
   pnpm --version
   ```

3. **Git**
   ```bash
   git --version
   ```

### Optional (for cloud features)

4. **Supabase CLI** (for cloud sync)
   ```bash
   npm install -g supabase
   supabase --version
   ```

5. **Deno** (for Edge Functions)
   ```bash
   curl -fsSL https://deno.land/install.sh | sh
   deno --version
   ```

## 🔐 Environment Variables

### For Local Development (No Cloud)

**None required!** Contxt works offline with SQLite.

### For Cloud Sync (Supabase)

Create a `.env` file in project root:

```bash
# Supabase Configuration (required for cloud sync)
CONTXT_SUPABASE_URL=https://your-project.supabase.co
CONTXT_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration (required for semantic search embeddings)
OPENAI_API_KEY=sk-...your-openai-api-key

# Supabase Service Role (for Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### How to Get These Values

#### Supabase Keys

1. Go to https://supabase.com
2. Create new project (or use existing)
3. Go to Project Settings → API
4. Copy:
   - **Project URL** → `CONTXT_SUPABASE_URL`
   - **anon/public key** → `CONTXT_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

#### OpenAI API Key

1. Go to https://platform.openai.com
2. Click on API Keys
3. Create new secret key
4. Copy → `OPENAI_API_KEY`

**Cost Note:** text-embedding-3-small is ~$0.00002 per 1K tokens (~$0.02 per 1M tokens)

## 🚀 Deployment Checklist

### Step 1: Build Packages

```bash
cd /Users/kareempjackson/Desktop/GhostSavvyStudios/ProductStudio/contxt
pnpm build
```

### Step 2: Test Locally (Offline Mode)

```bash
# Create test project
mkdir test-contxt
cd test-contxt

# Initialize
contxt init --name "Test Project"

# Add some test data
contxt decision add \
  --title "Test Decision" \
  --rationale "Testing Contxt"

# Verify
contxt status
contxt decision list

# Test MCP server
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | \
  node ../packages/mcp/dist/server.js
```

### Step 3: Deploy Supabase (Optional - For Cloud Sync)

#### 3.1 Initialize Supabase Project

```bash
cd /Users/kareempjackson/Desktop/GhostSavvyStudios/ProductStudio/contxt
supabase init
```

#### 3.2 Link to Remote Project

```bash
supabase link --project-ref your-project-ref
```

Get your project ref from Supabase dashboard URL: `https://app.supabase.com/project/[your-project-ref]`

#### 3.3 Run Migrations

```bash
supabase db push
```

This will run all 4 migration files:
- `00001_initial_schema.sql` - Core tables
- `00002_auth_schema.sql` - User profiles
- `00003_rls_policies.sql` - Security policies
- `00004_pgvector.sql` - Semantic search

#### 3.4 Enable pgvector Extension

In Supabase dashboard:
1. Go to Database → Extensions
2. Search for "vector"
3. Enable "vector" extension

#### 3.5 Deploy Edge Function

```bash
# Set secrets for Edge Function
supabase secrets set OPENAI_API_KEY=sk-your-key-here

# Deploy embed function
supabase functions deploy embed --no-verify-jwt
```

#### 3.6 Enable GitHub OAuth (Optional)

In Supabase dashboard:
1. Go to Authentication → Providers
2. Enable GitHub provider
3. Add GitHub OAuth App:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase

### Step 4: Configure Environment Variables

Create `.env` file with values from Supabase:

```bash
# In project root
cat > .env << EOF
CONTXT_SUPABASE_URL=https://your-project.supabase.co
CONTXT_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF
```

### Step 5: Test Cloud Sync

```bash
# Source environment variables
export $(cat .env | xargs)

# Test authentication
cd test-contxt
contxt auth login

# Test push
contxt push

# Test pull (from another directory)
mkdir test-contxt-2
cd test-contxt-2
contxt init --name "Test Project"
contxt pull
contxt decision list
# Should show the decision from first project
```

### Step 6: Publish to npm (Optional)

```bash
cd /Users/kareempjackson/Desktop/GhostSavvyStudios/ProductStudio/contxt

# Login to npm
npm login

# Update package versions
# Edit package.json in each package (cli, core, adapters, mcp)
# Set version to 0.1.0 (or higher)

# Publish all packages
pnpm publish -r --access public

# Or publish individually
cd packages/core && npm publish --access public
cd ../adapters && npm publish --access public
cd ../cli && npm publish --access public
cd ../mcp && npm publish --access public
```

**Note:** Package names are already scoped correctly:
- `@mycontxt/core`
- `@mycontxt/adapters`
- `@mycontxt/cli`
- `@mycontxt/mcp`

### Step 7: Install Globally (After Publishing)

```bash
npm install -g @mycontxt/cli

# Or link locally for development
cd packages/cli
npm link
```

## 🧪 Testing Checklist

### Local Features (No Cloud Required)

- [ ] `contxt init` creates project
- [ ] `contxt decision add/list/show` works
- [ ] `contxt pattern add/list` works
- [ ] `contxt context set/show` works
- [ ] `contxt doc add/list` works
- [ ] `contxt session start/end` works
- [ ] `contxt search` returns results
- [ ] `contxt export/import` works
- [ ] `contxt branch create/list/switch/merge` works
- [ ] `contxt history show/restore` works
- [ ] `contxt load --task/--files/--all` works
- [ ] `contxt stats` shows token analytics
- [ ] `contxt diff` shows context changes
- [ ] `contxt sessions` lists recent sessions
- [ ] MCP server lists tools correctly

### Cloud Features (Requires Supabase)

- [ ] `contxt auth login` opens browser
- [ ] `contxt auth status` shows authenticated user
- [ ] `contxt push` syncs to cloud
- [ ] `contxt pull` fetches from cloud
- [ ] `contxt sync` works bidirectionally
- [ ] Conflict detection with `--force` flag works
- [ ] Semantic search finds relevant entries
- [ ] Multiple machines can sync same project

## 🔧 Common Issues & Solutions

### Issue: "No such file or directory: schema.sql"

**Solution:** Run `pnpm build` again. The schema.sql file should be copied to dist.

### Issue: "OPENAI_API_KEY not configured"

**Solution:** Set environment variable:
```bash
export OPENAI_API_KEY=sk-your-key
```

### Issue: "Supabase configuration missing"

**Solution:** Set environment variables:
```bash
export CONTXT_SUPABASE_URL=https://your-project.supabase.co
export CONTXT_SUPABASE_ANON_KEY=your-anon-key
```

### Issue: "Not authenticated"

**Solution:** Run `contxt auth login` first

### Issue: pgvector functions not found

**Solution:**
1. Enable vector extension in Supabase dashboard
2. Re-run migrations: `supabase db push`

### Issue: Edge Function timeout

**Solution:** Reduce batch size (max 100 entries per push)

## 📊 Usage Limits (Free Tier)

### Supabase Free Tier
- 500MB database space
- 1GB bandwidth/month
- 50,000 monthly active users
- **Enough for:** Personal use, small teams

### OpenAI Free Tier (With Credits)
- $5 free credits on new accounts
- **Enough for:** ~250,000 embeddings (250K entries)

## 🎯 Production Considerations

### Before Going Live

1. **Security:**
   - [ ] Add CORS restrictions in Supabase
   - [ ] Review RLS policies
   - [ ] Rotate secrets regularly
   - [ ] Enable 2FA on Supabase account

2. **Performance:**
   - [ ] Monitor Supabase usage dashboard
   - [ ] Set up pgvector indexes (already in migrations)
   - [ ] Configure connection pooling if needed

3. **Monitoring:**
   - [ ] Set up Supabase logging
   - [ ] Monitor OpenAI usage/costs
   - [ ] Track error rates

4. **Backup:**
   - [ ] Enable Supabase automated backups
   - [ ] Export production data regularly
   - [ ] Test restore procedures

## 🚢 Next Steps After Setup

1. **Create GitHub Repository**
   ```bash
   git remote add origin https://github.com/yourusername/contxt.git
   git push -u origin main
   ```

2. **Set Up CI/CD** (Optional)
   - GitHub Actions for automated testing
   - Automated npm publishing on tags

3. **Documentation Site** (Optional)
   - Deploy README.md to GitHub Pages
   - Create demo videos
   - Write blog post

4. **Community**
   - Enable GitHub Discussions
   - Create Discord server
   - Share on Twitter/HN

## 📞 Support

If you run into issues:
1. Check this SETUP.md file
2. Review error messages carefully
3. Check Supabase logs (Database → Logs)
4. Check OpenAI usage dashboard
5. Create GitHub issue with error details

---

**You're ready to ship! 🚀**
