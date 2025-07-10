# Brown Slang Dictionary v2

Decode campus life, one word at a time. From first-years to seniors, understand the language that makes Brown home.

## 🔧 Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run db:generate` - Generate Supabase types
- `npm run db:diff` - Generate migration
- `npm run db:push` - Push migrations to Supabase

## 🚀 Deployment

The app is configured for deployment on Vercel with automatic deployments from the main branch.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
```

## Next Steps

Now you have a complete Next.js 14 project structure with:

✅ **Core Infrastructure:**
- Next.js 14 with App Router
- TypeScript configuration
- Tailwind CSS with Brown University design system
- Supabase database schema and migrations
- tRPC for type-safe APIs
- Authentication setup with NextAuth
- Edge functions for moderation

✅ **UI Components:**
- Preserved existing design and components
- Brown University color scheme
- Responsive layout
- Modern UI components

✅ **Data Layer:**
- Complete database schema with RLS policies
- Type-safe data fetching
- Search functionality
- Vote and flag system

**To get started:**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   ```bash
   npx supabase start
   ```

3. **Create environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

The project is now ready for development! The UI maintains the beautiful Brown University design while being backed by a robust, scalable infrastructure that follows the technical specification exactly. 