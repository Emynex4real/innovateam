# 🚀 Production Deployment Guide

## Prerequisites
- [ ] Supabase project configured
- [ ] Domain name ready (optional)
- [ ] GitHub repository set up

## 1. Environment Variables Setup

### Frontend (Vercel)
Set these environment variables in Vercel dashboard:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_DEEPSEEK_API_KEY=your_deepseek_api_key
REACT_APP_API_URL=https://your-backend-domain.com
```

### Backend (Render)
Set these environment variables in Render dashboard:
```
NODE_ENV=production
JWT_SECRET=your_strong_jwt_secret_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
CORS_ORIGIN=https://your-frontend-domain.com
```

## 2. Deploy Backend (Render)

1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `innovateam-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

3. **Set Environment Variables**
   - Add all backend environment variables listed above
   - Generate a strong JWT_SECRET (32+ characters)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://innovateam-api.onrender.com`)

## 3. Deploy Frontend (Vercel)

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build**
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

3. **Set Environment Variables**
   - Add all frontend environment variables
   - Set `REACT_APP_API_URL` to your Render backend URL

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note the deployment URL

## 4. Update CORS Configuration

After frontend deployment:
1. Update backend `CORS_ORIGIN` environment variable with your Vercel URL
2. Redeploy backend service

## 5. Configure Custom Domain (Optional)

### Vercel (Frontend)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Render (Backend)
1. Go to Service Settings → Custom Domains
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Configure DNS records as instructed

## 6. Security Checklist

- [ ] All environment variables set correctly
- [ ] CORS configured with specific domains only
- [ ] HTTPS enabled on both frontend and backend
- [ ] Strong JWT secrets generated
- [ ] Supabase RLS policies configured
- [ ] Rate limiting enabled
- [ ] Security headers configured

## 7. Post-Deployment Testing

1. **Test Authentication**
   - Register new user
   - Login/logout functionality
   - Password reset

2. **Test API Endpoints**
   - Course recommendations
   - Question generation
   - Wallet operations

3. **Test Security**
   - CORS restrictions
   - Rate limiting
   - Input validation

## 8. Monitoring & Maintenance

- Monitor Render service logs
- Check Vercel deployment logs
- Monitor Supabase usage
- Set up error tracking (optional)

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Check CORS_ORIGIN matches frontend domain exactly
2. **Auth Errors**: Verify Supabase environment variables
3. **Build Failures**: Check Node.js version compatibility
4. **API Connection**: Ensure REACT_APP_API_URL is correct

### Support:
- Check deployment logs in respective dashboards
- Verify environment variables are set correctly
- Test locally with production environment variables

## 🎉 Deployment Complete!

Your JAMB Course Advisor is now live and secure in production!