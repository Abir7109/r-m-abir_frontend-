# MongoDB + Vercel Setup Guide

## ✅ What's Already Done:
- MongoDB connection string configured
- Serverless API endpoint created (`/api/bot-knowledge`)
- Frontend updated to use MongoDB
- Package.json with MongoDB driver
- .gitignore to protect secrets

## 🚀 Next Steps - Configure Vercel:

### **Step 1: Add Environment Variable to Vercel**

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (r-m-abir_frontend)
3. Click **Settings** tab
4. Click **Environment Variables** in sidebar
5. Add new variable:
   - **Name:** `MONGODB_URI`
   - **Value:** `mongodb+srv://amd660377_db_user:abirbd@cluster0.tkfkbqx.mongodb.net/portfolio_bot?retryWrites=true&w=majority`
   - **Environments:** Select all (Production, Preview, Development)
6. Click **Save**

### **Step 2: Redeploy from GitHub**

Vercel will automatically deploy when you push to GitHub. Since you just pushed, wait 1-2 minutes and it will be live!

Or manually trigger deployment:
1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on latest deployment

### **Step 3: Test the API**

Once deployed, test your API endpoint:

```bash
# Replace YOUR_DOMAIN with your Vercel domain
curl https://YOUR_DOMAIN.vercel.app/api/bot-knowledge
```

You should see:
```json
{
  "success": true,
  "version": "1.0",
  "learnedResponses": []
}
```

## 📊 MongoDB Database Structure:

**Database:** `portfolio_bot`  
**Collection:** `learned_responses`

**Document Schema:**
```json
{
  "_id": "ObjectId",
  "question": "what is your favorite color",
  "answer": "I love cyan blue!",
  "category": "user-contributed",
  "timestamp": "2025-11-10T20:46:33.000Z",
  "approved": false
}
```

## 🎯 How It Works Now:

1. **User asks unknown question** → Bot enters learning mode
2. **User teaches answer** → Saved to:
   - localStorage (immediate, local only)
   - MongoDB (via API, global for all users)
3. **Future questions** → Bot checks:
   - MongoDB shared knowledge FIRST (🌐 globe emoji)
   - Then localStorage (💡 bulb emoji)
   - Then programmed responses

## 🔧 API Endpoints:

### GET `/api/bot-knowledge`
Fetch all learned responses from MongoDB

### POST `/api/bot-knowledge`
Add new learned response
```json
{
  "question": "your question here",
  "answer": "the answer",
  "category": "user-contributed"
}
```

## 🛡️ Security Features:

- ✅ CORS enabled for your domain
- ✅ Environment variables protected (not in git)
- ✅ New responses marked as `approved: false` (requires manual review)
- ✅ Duplicate question prevention
- ✅ Connection pooling for performance

## 🎨 Approve Responses (Admin):

You can manually approve responses in MongoDB Atlas:

1. Go to https://cloud.mongodb.com
2. Browse Collections → `portfolio_bot` → `learned_responses`
3. Find unapproved responses (`approved: false`)
4. Edit document, change `approved: true`

Later you can filter: only show `approved: true` responses to users!

## 🐛 Troubleshooting:

### API Returns 500 Error
- Check Vercel function logs
- Verify MONGODB_URI is set correctly in Vercel settings
- Test MongoDB connection string in MongoDB Compass

### Bot Not Learning
- Open browser console (F12)
- Check for network errors
- Verify API endpoint is accessible

### CORS Error
- Ensure your domain is allowed in API
- Check Vercel deployment logs

## 📈 Next Improvements:

1. Add admin panel to approve/reject learned responses
2. Add rate limiting to prevent spam
3. Add authentication for admin actions
4. Add analytics for most asked questions
5. Add categories/tags for better organization

---

**🎉 Your AI bot now learns from ALL users globally via MongoDB + Vercel!**
